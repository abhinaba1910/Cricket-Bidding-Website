const express = require("express");
const router = express.Router();
const auth = require("../Auth/Authentication");

const Auction = require("../Models/auction");
const Team = require("../Models/team");
const Player = require("../Models/player");
const Person = require("../Models/person");
// 2. Start bidding timer (frontend will handle the timer logic)
router.post("/start-timer/:playerId", auth, async (req, res) => {
  try {
    // Just a placeholder route for timer start signal
    // Emit via WebSocket that timer has started for this player
    const auctionId = req.body.auctionId; // assume client includes auctionId in body for context
    const playerId = req.params.playerId;
    if (auctionId) {
      const io = req.app.get("io");
      io.to(auctionId).emit("timer:started", { playerId });
    }
    res.json({ message: "Timer started for player" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/start-bidding/:auctionId", auth, async (req, res) => {
  try {
    const { selectionMode, automaticFilter } = req.body;
    const auction = await Auction.findById(req.params.auctionId)
      .populate("selectedPlayers")
      .populate("manualPlayerQueue.player");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Check if bidding is already started
    if (auction.biddingStarted) {
      return res.status(400).json({ error: "Bidding has already started" });
    }

    let nextPlayer = null;
    let updateData = {
      selectionMode: selectionMode || auction.selectionMode,
      automaticFilter: automaticFilter || auction.automaticFilter || "All",
      biddingStarted: true,
      currentQueuePosition: 0,
    };

    if (
      selectionMode === "automatic" ||
      (!selectionMode && auction.selectionMode === "automatic")
    ) {
      // Automatic mode - get first available player based on filter
      const filterQuery =
        updateData.automaticFilter === "All"
          ? { availability: "Available" }
          : {
              availability: "Available",
              role:
                updateData.automaticFilter === "Wicket keeper batsman"
                  ? "Wicket keeper batsman"
                  : updateData.automaticFilter,
            };

      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers },
      });
    } else {
      // Manual mode - get first player from queue (position 0)
      if (auction.manualPlayerQueue.length > 0) {
        // Sort queue by position to ensure correct order
        const sortedQueue = auction.manualPlayerQueue.sort(
          (a, b) => a.position - b.position
        );
        nextPlayer = await Player.findById(sortedQueue[0].player);
        updateData.currentQueuePosition = 0;
      }
    }

    if (!nextPlayer) {
      return res.status(400).json({
        error:
          selectionMode === "automatic" ||
          (!selectionMode && auction.selectionMode === "automatic")
            ? "No players available matching the selected filter"
            : "No players selected in manual queue",
      });
    }
    updateData.currentPlayerOnBid = nextPlayer._id;
    updateData.bidAmount = {
      player: nextPlayer._id,
      amount: nextPlayer.basePrice || 10000,
    };

    updateData.currentBid = { team: null, amount: 0 };

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    )
      .populate("currentPlayerOnBid")
      .populate("manualPlayerQueue.player");

    // Emit via WebSocket that bidding has started, with current player info
    {
      const io = req.app.get("io");
      io.to(req.params.auctionId).emit("bidding:started", {
        auction: updatedAuction,
        currentPlayer: nextPlayer,
        selectionMode: updateData.selectionMode,
      });
    }

    res.json({
      message: "Bidding started successfully",
      auction: updatedAuction,
      currentPlayer: nextPlayer,
      selectionMode: updateData.selectionMode,
    });
  } catch (err) {
    console.error("Start bidding error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/manual-sell/:auctionId/:playerId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate("selectedTeams")
      .populate("manualPlayerQueue.player");
    const playerId = req.params.playerId;

    if (!auction) {
      return res.status(400).json({ error: "Auction not found" });
    }

    if (!auction.biddingStarted) {
      return res.status(400).json({ error: "Bidding has not started yet" });
    }

    let teamId = auction.currentBid?.team;
    let amount = auction.currentBid?.amount;

    if (!teamId || !amount) {
      return res
        .status(400)
        .json({ error: "No valid bid or team found for sale." });
    }

    let nextPlayer = null;
    let newQueuePosition = auction.currentQueuePosition;

    if (auction.selectionMode === "automatic") {
      // Get next available player based on filter (excluding sold players)
      const filterQuery =
        auction.automaticFilter === "All"
          ? { availability: "Available" }
          : {
              availability: "Available",
              role:
                auction.automaticFilter === "Wicket keeper batsman"
                  ? "Wicket keeper batsman"
                  : auction.automaticFilter,
            };

      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: playerId },
      });
    } else {
      // Manual mode - get next player from queue
      const nextPosition = auction.currentQueuePosition + 1;
      const sortedQueue = auction.manualPlayerQueue.sort(
        (a, b) => a.position - b.position
      );

      if (sortedQueue.length > nextPosition) {
        nextPlayer = await Player.findById(sortedQueue[nextPosition].player);
        newQueuePosition = nextPosition;
      }
    }

    // Update sold player
    await Player.findByIdAndUpdate(playerId, {
      availability: "Sold",
    });

    // Update team with new player
    await Team.findByIdAndUpdate(teamId, {
      $push: { players: { player: playerId, price: amount } },
      $inc: { remaining: -amount },
    });

    auction.biddingHistory.push({
      player: playerId,
      team: teamId,
      bidAmount: amount,
      time: new Date(),
    });

    if (auction.pauseAfterCurrentPlayer) {
      auction.isPaused = true;
      auction.pauseAfterCurrentPlayer = false;
      auction.currentPlayerOnBid = null;
      auction.biddingStarted = false;

      await auction.save();

      // Emit that auction paused after selling current player
      {
        const io = req.app.get("io");
        io.to(req.params.auctionId).emit("auction:paused", {
          message: "Auction paused after current player",
          soldTo: teamId,
          amount,
          nextPlayer: null,
          isLastPlayer: true,
          currentQueuePosition: auction.currentQueuePosition,
          totalQueueLength: auction.manualPlayerQueue.length,
          remainingPlayers: 0,
          isPaused: true,
        });
      }

      return res.status(200).json({
        message:
          "Player sold successfully, auction paused after current player",
        soldTo: teamId,
        amount: amount,
        nextPlayer: null,
        isLastPlayer: true,
        currentQueuePosition: auction.currentQueuePosition,
        totalQueueLength: auction.manualPlayerQueue.length,
        remainingPlayers: 0,
        isPaused: true,
      });
    }

    if (nextPlayer) {
      auction.currentPlayerOnBid = nextPlayer._id;
      auction.currentBid = { team: null, amount: 0 };
      auction.currentQueuePosition = newQueuePosition;
      auction.bidAmount = {
        player: nextPlayer._id,
        amount: nextPlayer.basePrice,
      };
    } else {
      auction.currentPlayerOnBid = null;
      auction.currentBid = { team: null, amount: 0 };
      auction.bidAmount = {
        player: null,
        amount: 0,
      };
      auction.biddingStarted = false;
    }

    // Update lastSoldPlayer and mostExpensivePlayer
    auction.lastSoldPlayer = {
      player: playerId,
      team: teamId,
      bidAmount: amount,
    };

    if (
      !auction.mostExpensivePlayer ||
      amount > auction.mostExpensivePlayer.bidAmount
    ) {
      auction.mostExpensivePlayer = {
        player: playerId,
        team: teamId,
        bidAmount: amount,
      };
    }

    // Update auction with next player (already handled above)
    await auction.save();

    // After saving, emit via WebSocket the sale event and next-player info
    {
      const io = req.app.get("io");
      const isLastPlayer = !nextPlayer;
      let payload = {
        message: "Player sold successfully",
        soldTo: teamId,
        amount,
        nextPlayer: nextPlayer || null,
        isLastPlayer,
        biddingEnded: isLastPlayer,
        currentQueuePosition: auction.currentQueuePosition,
        totalQueueLength: auction.manualPlayerQueue.length,
        remainingPlayers:
          auction.selectionMode === "manual"
            ? Math.max(
                0,
                auction.manualPlayerQueue.length - newQueuePosition - 1
              )
            : 0,
        isPaused: false,
      };
      if (isLastPlayer) {
        payload.isPaused = false;
      }
      io.to(req.params.auctionId).emit("player:sold", payload);
    }

    return res.status(200).json({
      message: "Player sold successfully",
      soldTo: teamId,
      amount: amount,
      nextPlayer: nextPlayer || null,
      isLastPlayer: !nextPlayer,
      biddingEnded: !nextPlayer,
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: auction.manualPlayerQueue.length,
      remainingPlayers:
        auction.selectionMode === "manual"
          ? Math.max(0, auction.manualPlayerQueue.length - newQueuePosition - 1)
          : 0,
      isPaused: false,
    });
  } catch (err) {
    console.error("Manual sell error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/update-selection-mode/:auctionId", auth, async (req, res) => {
  try {
    const { selectionMode, automaticFilter } = req.body;
    const auction = await Auction.findById(req.params.auctionId);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Allow mode changes in these scenarios:
    // 1. Bidding hasn't started yet
    // 2. Switching from any mode to any mode (preserve current player)
    const canChangeMode = true; // Always allow mode changes now

    let updateData = {
      selectionMode,
      automaticFilter: automaticFilter || auction.automaticFilter || "All",
    };

    // If bidding has started and we're switching modes, preserve current player
    // but prepare for the next player according to new mode
    if (auction.biddingStarted) {
      if (selectionMode === "automatic") {
        // Switching to automatic - no need to change queue position
      } else if (selectionMode === "manual") {
        // Switching to manual - set position to -1 so next player starts from position 0
        updateData.currentQueuePosition = -1;
      }
    } else {
      // Bidding hasn't started, reset position
      updateData.currentQueuePosition = 0;
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    );

    // Emit selection-mode update
    {
      const io = req.app.get("io");
      io.to(req.params.auctionId).emit("selection-mode:updated", {
        selectionMode,
        automaticFilter: updateData.automaticFilter,
      });
    }

    res.json({
      message: "Selection mode updated successfully",
      auction: updatedAuction,
      canChangeMode: true,
    });
  } catch (err) {
    console.error("Update selection mode error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/set-manual-queue/:auctionId", auth, async (req, res) => {
  try {
    const { playerQueue } = req.body;
    const auction = await Auction.findById(req.params.auctionId);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    if (!playerQueue || !Array.isArray(playerQueue)) {
      return res.status(400).json({ error: "Invalid player queue data" });
    }

    // Always create fresh queue - no merging or updating
    const updateData = {
      manualPlayerQueue: playerQueue,
      currentQueuePosition: -1, // Will start from 0 when first player begins
    };

    // Only set currentQueuePosition to 0 if bidding hasn't started yet
    if (!auction.biddingStarted) {
      updateData.currentQueuePosition = 0;
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    ).populate("manualPlayerQueue.player");

    // Emit queue update
    const io = req.app.get("io");
    io.to(req.params.auctionId).emit("queue:updated", {
      manualPlayerQueue: updatedAuction.manualPlayerQueue,
      currentQueuePosition: updatedAuction.currentQueuePosition,
    });

    res.json({
      message: "Manual queue created successfully",
      auction: updatedAuction,
      totalQueueLength: playerQueue.length,
      currentPosition: updatedAuction.currentQueuePosition,
    });
  } catch (err) {
    console.error("Set manual queue error:", err);
    res.status(500).json({ error: err.message });
  }
});

// router.post("/set-manual-queue/:auctionId", auth, async (req, res) => {
//   try {
//     const { playerQueue, newPlayers, existingQueue } = req.body;
//     const auction = await Auction.findById(req.params.auctionId);

//     if (!auction) {
//       return res.status(404).json({ error: "Auction not found" });
//     }

//     let finalQueue = [];
//     let updateData = {};

//     // Utility: Ensure no duplicate player entries — override older ones with latest position
//     const mergeAndDeduplicateQueue = (baseQueue, addedPlayers) => {
//       const playerMap = new Map();

//       // First add existing queue
//       for (const item of baseQueue) {
//         playerMap.set(String(item.player), { ...item });
//       }

//       // Then add new players — overwrite if already exists
//       for (const item of addedPlayers) {
//         playerMap.set(String(item.player), { ...item }); // Update to new position
//       }

//       // Convert map back to array
//       return Array.from(playerMap.values()).sort(
//         (a, b) => a.position - b.position
//       );
//     };

//     // CASE 1: Adding more players to existing queue
//     if (newPlayers && existingQueue) {
//       console.log("Adding to existing queue");

//       // Merge and deduplicate by player ID
//       finalQueue = mergeAndDeduplicateQueue(existingQueue, newPlayers);

//       updateData = {
//         manualPlayerQueue: finalQueue,
//       };

//       // CASE 2: Replacing entire queue
//     } else if (playerQueue) {
//       console.log("Creating new queue");

//       // Ensure no duplicates within the new queue itself
//       finalQueue = mergeAndDeduplicateQueue([], playerQueue);

//       updateData = {
//         manualPlayerQueue: finalQueue,
//       };

//       if (!auction.biddingStarted) {
//         updateData.currentQueuePosition = 0;
//       } else if (
//         auction.selectionMode === "automatic" &&
//         finalQueue.length > 0
//       ) {
//         updateData.currentQueuePosition = -1;
//       }
//     } else {
//       return res.status(400).json({ error: "Invalid request data" });
//     }

//     // Save the updated auction
//     const updatedAuction = await Auction.findByIdAndUpdate(
//       req.params.auctionId,
//       updateData,
//       { new: true }
//     ).populate("manualPlayerQueue.player");

//     // Emit queue update
//     {
//       const io = req.app.get("io");
//       io.to(req.params.auctionId).emit("queue:updated", {
//         manualPlayerQueue: updatedAuction.manualPlayerQueue,
//         currentQueuePosition: updatedAuction.currentQueuePosition,
//       });
//     }

//     // Trigger next player if needed
//     let nextPlayerInfo = null;
//     if (
//       auction.biddingStarted &&
//       auction.selectionMode === "manual" &&
//       !auction.currentPlayerOnBid
//     ) {
//       const currentPos = updatedAuction.currentQueuePosition;
//       if (finalQueue.length > currentPos + 1) {
//         const nextPlayerData = finalQueue[currentPos + 1];
//         const nextPlayer = await Player.findById(nextPlayerData.player);
//         nextPlayerInfo = {
//           nextPlayer: nextPlayer,
//           shouldStartNext: true,
//         };
//       }
//     }

//     res.json({
//       message: newPlayers
//         ? "Players added to queue successfully"
//         : "Manual queue updated successfully",
//       auction: updatedAuction,
//       totalQueueLength: finalQueue.length,
//       currentPosition: updatedAuction.currentQueuePosition,
//       ...nextPlayerInfo,
//     });
//   } catch (err) {
//     console.error("Set manual queue error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

router.get("/queue-status/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate("manualPlayerQueue.player")
      .populate("currentPlayerOnBid");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Check if queue should be cleared (last player was processed)
    if (
      auction.manualPlayerQueue.length > 0 &&
      auction.selectionMode === "manual"
    ) {
      const lastPlayerIndex = auction.manualPlayerQueue.length - 1;
      const lastPlayer = auction.manualPlayerQueue[lastPlayerIndex];

      // If we've processed all players in the queue
      if (
        auction.currentQueuePosition >= lastPlayerIndex &&
        !auction.currentPlayerOnBid
      ) {
        // Clear the queue and pause auction
        await Auction.findByIdAndUpdate(auction._id, {
          manualPlayerQueue: [],
          currentQueuePosition: 0,
          isPaused: true,
        });

        const io = req.app.get("io");
        io.to(req.params.auctionId).emit("auction:paused", {
          message: "Queue completed - auction paused",
          nextPlayer: null,
          hasNextPlayer: false,
          remainingCount: 0,
          selectionMode: auction.selectionMode,
          auctionPaused: true,
        });

        return res.json({
          currentQueuePosition: 0,
          totalQueueLength: 0,
          remainingPlayers: 0,
          isLastPlayer: true,
          canChangeMode: true,
          selectionMode: auction.selectionMode,
          biddingStarted: auction.biddingStarted,
          hasCurrentPlayer: false,
          currentPlayer: null,
          manualPlayerQueue: [],
        });
      }
    }

    // Calculate remaining players in queue
    const remainingPlayers = Math.max(
      0,
      auction.manualPlayerQueue.length - auction.currentQueuePosition - 1
    );

    res.json({
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: auction.manualPlayerQueue.length,
      remainingPlayers,
      isLastPlayer: remainingPlayers === 0 && auction.biddingStarted,
      canChangeMode: true,
      selectionMode: auction.selectionMode,
      biddingStarted: auction.biddingStarted,
      hasCurrentPlayer: !!auction.currentPlayerOnBid,
      currentPlayer: auction.currentPlayerOnBid,
      manualPlayerQueue: auction.manualPlayerQueue,
    });
  } catch (err) {
    console.error("Queue status error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Simple next player - just get next in queue
router.get("/next-player/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate("manualPlayerQueue.player")
      .populate("currentPlayerOnBid");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Handle pause after current player
    if (auction.pauseAfterCurrentPlayer === true) {
      auction.isPaused = true;
      auction.pauseAfterCurrentPlayer = false;
      auction.currentPlayerOnBid = null;
      await auction.save();

      const io = req.app.get("io");
      io.to(req.params.auctionId).emit("auction:paused", {
        message: "Auction paused after current player",
        nextPlayer: null,
        hasNextPlayer: false,
        remainingCount: 0,
        selectionMode: auction.selectionMode,
        auctionPaused: true,
      });

      return res.json({
        message: "Auction paused after current player",
        nextPlayer: null,
        hasNextPlayer: false,
        remainingCount: 0,
        selectionMode: auction.selectionMode,
        auctionPaused: true,
      });
    }

    let nextPlayer = null;
    let remainingCount = 0;

    if (auction.selectionMode === "manual") {
      const nextPos = auction.currentQueuePosition + 1;

      if (auction.manualPlayerQueue.length > nextPos) {
        nextPlayer = auction.manualPlayerQueue[nextPos].player;
        remainingCount = auction.manualPlayerQueue.length - nextPos;
      } else {
        // No more players in queue - clear it and pause
        await Auction.findByIdAndUpdate(req.params.auctionId, {
          manualPlayerQueue: [],
          currentQueuePosition: 0,
          isPaused: true,
        });

        const io = req.app.get("io");
        io.to(req.params.auctionId).emit("auction:paused", {
          message: "Queue completed - auction paused",
          nextPlayer: null,
          hasNextPlayer: false,
          remainingCount: 0,
          selectionMode: auction.selectionMode,
          auctionPaused: true,
        });

        return res.json({
          nextPlayer: null,
          hasNextPlayer: false,
          remainingCount: 0,
          selectionMode: auction.selectionMode,
          message: "Queue completed - auction paused",
        });
      }
    } else {
      // Automatic mode logic remains the same
      const filterQuery =
        auction.automaticFilter === "All"
          ? { availability: "Available" }
          : {
              availability: "Available",
              role:
                auction.automaticFilter === "Wicket keeper batsman"
                  ? "Wicket keeper batsman"
                  : auction.automaticFilter,
            };

      const currentPlayerId = auction.currentPlayerOnBid;
      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: currentPlayerId },
      });

      if (nextPlayer) {
        remainingCount = await Player.countDocuments({
          ...filterQuery,
          _id: { $in: auction.selectedPlayers, $ne: currentPlayerId },
        });
      }
    }

    res.json({
      nextPlayer: nextPlayer,
      hasNextPlayer: !!nextPlayer,
      remainingCount: remainingCount,
      selectionMode: auction.selectionMode,
    });
  } catch (err) {
    console.error("Next player error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/start-automatic-bidding/:auctionId", auth, async (req, res) => {
  try {
    const { automaticFilter } = req.body;

    const auction = await Auction.findById(req.params.auctionId).populate(
      "selectedPlayers"
    );

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    if (auction.biddingStarted) {
      return res.status(400).json({ error: "Bidding has already started" });
    }

    // ✅ Filter players with correct availability
    const availabilityFilter = {
      availability: { $in: ["Available", "Unsold"] },
    };

    let filterQuery = { ...availabilityFilter };

    if (automaticFilter !== "All") {
      filterQuery.role =
        automaticFilter === "Wicket keeper batsman"
          ? "Wicket keeper batsman"
          : automaticFilter;
    }

    // ✅ Limit to only selected players
    filterQuery._id = { $in: auction.selectedPlayers };

    // ✅ Find all matching players (for count and first)
    const availablePlayers = await Player.find(filterQuery).sort({
      basePrice: 1,
    });

    if (!availablePlayers.length) {
      return res.status(400).json({
        error:
          "No available players left. Please add more players or check your filter.",
      });
    }

    const firstPlayer = availablePlayers[0];

    // ✅ Start bidding with first player
    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      {
        selectionMode: "automatic",
        automaticFilter: automaticFilter,
        biddingStarted: true,
        currentPlayerOnBid: firstPlayer._id,
        currentBid: {
          team: null,
          amount: 0,
        },
        currentQueuePosition: 0,
        bidAmount: {
          player: firstPlayer._id,
          amount: firstPlayer.basePrice || 0,
        },
      },
      { new: true }
    ).populate("currentPlayerOnBid");

    // Emit automatic bidding start
    {
      const io = req.app.get("io");
      io.to(req.params.auctionId).emit("bidding:started", {
        auction: updatedAuction,
        currentPlayer: firstPlayer,
        selectionMode: "automatic",
        automaticFilter,
      });
    }

    res.json({
      message: "Automatic bidding started successfully",
      auction: updatedAuction,
      currentPlayer: firstPlayer,
      selectionMode: "automatic",
      automaticFilter,
    });
  } catch (err) {
    console.error("Start automatic bidding error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Pause / Resume Auction
router.patch("/pause-auction/:id", auth, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const { isPaused } = req.body;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const io = req.app.get("io");

    // Automatic Mode - set pending pause if player is still on bid
    if (
      isPaused === true &&
      auction.selectionMode === "automatic" &&
      auction.currentPlayerOnBid
    ) {
      auction.pauseAfterCurrentPlayer = true;
      await auction.save();

      // Emit that a pending pause will happen after current player
      io.to(auctionId).emit("auction:pause-pending", {
        message: "Pause will activate after current player is sold",
        auctionId,
      });

      return res.status(200).json({
        message:
          "Pause will activate after current player is sold (automatic mode)",
        auction,
      });
    }

    // Manual Mode - pause only when queue is empty and at start
    if (
      isPaused === true &&
      auction.selectionMode === "manual" &&
      auction.manualPlayerQueue.length === 0 &&
      auction.currentQueuePosition === 0
    ) {
      auction.isPaused = true;
      await auction.save();

      // Emit immediate pause
      io.to(auctionId).emit("auction:paused", {
        message: "Auction paused successfully (manual, no queue)",
        auctionId,
      });

      return res.status(200).json({
        message: "Auction paused successfully",
        auction,
      });
    }

    // Resume (unpause) logic
    if (isPaused === false) {
      auction.isPaused = false;
      auction.pauseAfterCurrentPlayer = false; // cancel any pending pause
      await auction.save();

      // Emit resume event
      io.to(auctionId).emit("auction:resumed", {
        message: "Auction resumed successfully",
        auctionId,
      });

      return res.status(200).json({
        message: "Auction resumed successfully",
        auction,
      });
    }

    return res.status(400).json({
      message: "Cannot pause auction. First sell all players from queue.",
    });
  } catch (err) {
    console.error("Pause Auction Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get pause status (no emit needed; clients poll or can listen to events above)
router.get("/get-auction-pause-status/:id", auth, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const auction = await Auction.findById(auctionId).select("isPaused");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    return res.status(200).json({ isPaused: auction.isPaused });
  } catch (err) {
    console.error("Get Pause Status Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Mark current player as Unsold and move on
router.patch("/unsold/:auctionId", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId)
      .populate("currentPlayerOnBid")
      .populate("manualPlayerQueue.player");

    if (!auction || !auction.currentPlayerOnBid) {
      return res.status(400).json({ message: "No current player on bid." });
    }

    const player = await Player.findById(auction.currentPlayerOnBid._id);
    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }

    // Step 1: Mark player as Unsold
    player.availability = "Unsold";
    await player.save();

    // Step 2: Remove any accidental bid record
    auction.biddingHistory = auction.biddingHistory.filter(
      (bid) => String(bid.player) !== String(player._id)
    );

    // Step 3: Determine next player
    let nextPlayer = null;
    let newQueuePosition = auction.currentQueuePosition;

    if (auction.selectionMode === "manual") {
      const nextPosition = auction.currentQueuePosition + 1;
      const sortedQueue = auction.manualPlayerQueue.sort(
        (a, b) => a.position - b.position
      );
      if (sortedQueue.length > nextPosition) {
        nextPlayer = await Player.findById(sortedQueue[nextPosition].player);
        newQueuePosition = nextPosition;
      }
      // Do NOT push unsold player to end of queue
    } else {
      // Automatic mode
      const filterQuery =
        auction.automaticFilter === "All"
          ? { availability: "Available" }
          : {
              availability: "Available",
              role:
                auction.automaticFilter === "Wicket keeper batsman"
                  ? "Wicket keeper batsman"
                  : auction.automaticFilter,
            };

      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: player._id },
      });
    }

    // Step 4: Update auction state
    if (nextPlayer) {
      auction.currentPlayerOnBid = nextPlayer._id;
      auction.currentBid = { team: null, amount: 0 };
      auction.bidAmount = {
        player: nextPlayer._id,
        amount: nextPlayer.basePrice,
      };
      auction.currentQueuePosition = newQueuePosition;
      auction.biddingStarted = true;
    } else {
      auction.currentPlayerOnBid = null;
      auction.currentBid = { team: null, amount: 0 };
      auction.bidAmount = { player: null, amount: 0 };
      auction.biddingStarted = false;
    }

    await auction.save();

    const isLastPlayer = !nextPlayer;
    const remainingPlayers =
      auction.selectionMode === "manual"
        ? Math.max(0, auction.manualPlayerQueue.length - newQueuePosition - 1)
        : 0;

    // Emit Unsold event with next-player info
    {
      const io = req.app.get("io");
      io.to(auctionId).emit("player:unsold", {
        message: "Player marked as Unsold, moved to next",
        previousPlayer: player._id,
        nextPlayer: nextPlayer ? nextPlayer._id : null,
        isLastPlayer,
        currentQueuePosition: auction.currentQueuePosition,
        totalQueueLength: auction.manualPlayerQueue?.length || 0,
        remainingPlayers,
        // isPaused: auction.isPaused,
      });
    }

    return res.status(200).json({
      message: "Player marked as Unsold. Moved to next.",
      nextPlayer: nextPlayer || null,
      isLastPlayer,
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: auction.manualPlayerQueue?.length || 0,
      remainingPlayers,
      // isPaused: auction.isPaused,
    });
  } catch (err) {
    console.error("Unsold Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// End Auction: finalize and update teams
router.patch("/end-auction/:auctionId", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }
    if (auction.isPaused === false) {
      return res
        .status(404)
        .json({ message: "Sell or Unsold the Player first then End Auction" });
    }

    // Finalize auction
    auction.status = "completed";
    auction.currentPlayerOnBid = null;
    auction.currentBid = { team: null, amount: 0 };
    auction.bidAmount = { player: null, amount: 0 };
    auction.isPaused = true;

    // For each selected team, return remaining purse to purse and zero out remaining
    for (const teamEntry of auction.selectedTeams) {
      const team = await Team.findById(teamEntry.team);
      if (team) {
        const remainingAmount = team.remaining || 0;
        team.purse = remainingAmount;
        // team.remaining = remainingAmount;
        await team.save();
      }
    }

    await auction.save();

    // Emit auction ended event
    {
      const io = req.app.get("io");
      io.to(auctionId).emit("auction:ended", {
        message: "Auction ended successfully",
        auctionId,
      });
    }

    return res
      .status(200)
      .json({ message: "Auction ended successfully. Teams updated.", auction });
  } catch (err) {
    console.error("End Auction Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Get real-time bidding data (GET: no emit; clients call or subscribe to relevant events)
router.get("/get-bidding-data/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate("currentPlayerOnBid")
      .populate("currentBid.team")
      .populate({
        path: "biddingHistory",
        populate: { path: "player team" },
      });

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    res.json({
      currentPlayer: auction.currentPlayerOnBid,
      currentBid: auction.currentBid,
      biddingHistory: auction.biddingHistory,
      isPaused: auction.isPaused,
      status: auction.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/////////////////////////USER BIDDING ROUTES////////////////////////////

// Confirm join-auction: assign team & avatar
// router.post("/join-auction/:auctionId/confirm", auth, async (req, res) => {
//   try {
//     const { auctionId } = req.params;
//     const userId = req.user.id;
//     const { teamId, avatarUrl } = req.body;

//     if (!teamId || !avatarUrl) {
//       return res.status(400).json({ message: "Team and avatar are required." });
//     }

//     const auction = await Auction.findById(auctionId);
//     if (!auction) {
//       return res.status(404).json({ message: "Auction not found." });
//     }

//     // Check if user already a manager
//     const alreadyManager = auction.selectedTeams.find(
//       (entry) => entry && entry.manager && entry.manager.toString() === userId
//     );
//     if (alreadyManager) {
//       return res
//         .status(409)
//         .json({ message: "You have already selected a team and avatar." });
//     }

//     // Validate team selection
//     const teamEntry = auction.selectedTeams.find(
//       (t) => t?.team?.toString() === teamId
//     );
//     if (!teamEntry) {
//       return res.status(400).json({ message: "Invalid team selection." });
//     }
//     if (teamEntry.manager) {
//       return res
//         .status(409)
//         .json({ message: "Team already selected by another user." });
//     }

//     // Assign manager and avatar
//     teamEntry.manager = userId;
//     teamEntry.avatar = avatarUrl;

//     await auction.save();

//     // Emit that a new manager joined this auction
//     {
//       const io = req.app.get("io");
//       io.to(auctionId).emit("team:joined", {
//         message: "A manager joined the auction",
//         teamId,
//         managerId: userId,
//         avatarUrl,
//       });
//     }

//     res.status(200).json({ message: "Team and avatar selection successful." });
//   } catch (err) {
//     console.error("Error in join-auction/confirm:", err);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

router.post("/join-auction/:auctionId/confirm", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;
    const username = req.user.username;
    const { teamId, avatarUrl } = req.body;

    if (!teamId || !avatarUrl) {
      return res.status(400).json({ message: "Team and avatar are required." });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    // Check if user already a manager in auction
    const alreadyManager = auction.selectedTeams.find(
      (entry) => entry?.manager?.toString() === userId
    );
    if (alreadyManager) {
      return res.status(409).json({
        message: "You have already selected a team and avatar.",
      });
    }

    // Find which team this user is assigned to (via team.manager field)
    const userTeam = await Team.findOne({ manager: username });

    if (!userTeam) {
      return res.status(403).json({
        message: "You are not assigned to any team. Please contact the admin.",
      });
    }

    // If user is assigned to a team, ensure it's the one being selected
    if (userTeam._id.toString() !== teamId) {
      return res.status(403).json({
        message: `You are assigned to the team '${userTeam.teamName}'. Please select that team.`,
      });
    }

    // Validate that the team exists in auction list
    const teamEntry = auction.selectedTeams.find(
      (t) => t?.team?.toString() === teamId
    );
    if (!teamEntry) {
      return res.status(400).json({ message: "Invalid team selection." });
    }
    if (teamEntry.manager) {
      return res.status(409).json({
        message: "This team is already selected by another user.",
      });
    }

    // ✅ Everything passed — allow selection
    teamEntry.manager = userId;
    teamEntry.avatar = avatarUrl;

    await auction.save();

    const io = req.app.get("io");
    io.to(auctionId).emit("team:joined", {
      message: "A manager joined the auction",
      teamId,
      managerId: userId,
      avatarUrl,
    });

    res.status(200).json({ message: "Team and avatar selection successful." });
  } catch (err) {
    console.error("Error in join-auction/confirm:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch available teams for join-auction (GET: no emit)
router.get("/join-auction/:auctionId/teams", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;
    console.log("Fetching teams for auction:", auctionId);

    const auction = await Auction.findById(auctionId).populate(
      "selectedTeams.team"
    );
    if (auction.createdBy.toString() === userId) {
      return res.status(403).json({ message: "Access denied: Already the Host." });
    }

    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    const alreadyManagerEntry = auction.selectedTeams.find(
      (entry) => entry.manager?.toString() === userId
    );

    // Filter out teams that have no manager assigned and ensure t.team is not null
    const availableTeams = auction.selectedTeams
      .filter((t) => !t.manager && t.team) // skip if t.manager is set or t.team is undefined
      .map((t) => ({
        id: t.team._id,
        name: t.team.teamName,
        shortName: t.team.shortName,
        logoUrl: t.team.logoUrl,
      }));

    res.json({ teams: availableTeams, alreadyManager: !!alreadyManagerEntry });
    console.log(availableTeams);
  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ message: "Failed to fetch teams." });
  }
});

// Bidding portal data for a user (GET: no emit here)
router.get("/bidding-portal/:auctionId", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;

    const auction = await Auction.findById(auctionId)
      .populate("currentPlayerOnBid")
      .populate("bidAmount.player")
      .populate("currentBid.team")
      .populate("selectedTeams.team")
      .populate("selectedTeams.manager")
      .populate("biddingHistory.player")
      .populate("biddingHistory.team")
      .populate("selectedPlayers");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    if (auction.createdBy.toString() === userId.toString()) {
      return res.status(403).json({ message: "Access denied: Already the Host" });
    }

    // Find the user's team entry
    const matchedTeamEntry = auction.selectedTeams.find(
      (entry) =>
        entry.manager && entry.manager._id.toString() === userId.toString()
    );

    if (!matchedTeamEntry) {
      return res
        .status(403)
        .json({ message: "No team assigned to this user in the auction." });
    }

    // Fetch full team details (players, logo, purse, etc.)
    const fullTeamDetails = await Team.findById(
      matchedTeamEntry.team._id
    ).populate("players.player");

    // Last sold player
    const lastSold =
      auction.biddingHistory.length > 0
        ? auction.biddingHistory[auction.biddingHistory.length - 1]
        : null;

    // Most expensive player
    const mostExpensive = auction.biddingHistory.reduce((max, entry) => {
      return entry.bidAmount > (max?.bidAmount || 0) ? entry : max;
    }, null);

    const userTeam = {
      teamId: matchedTeamEntry.team._id,
      teamName: matchedTeamEntry.team.shortName,
      manager: matchedTeamEntry.manager,
      avatar: matchedTeamEntry.avatar,
      logoUrl: fullTeamDetails.logoUrl,
      rtmCount: matchedTeamEntry.rtmCount,
      purse: fullTeamDetails.purse,
      remaining: fullTeamDetails.remaining,
      playersBought: fullTeamDetails.players.map((p) => ({
        player: p.player,
        price: p.price,
      })),
    };

    return res.status(200).json({
      auctionId: auction._id,
      currentPlayer: auction.currentPlayerOnBid,
      currentBid: auction.currentBid,
      bidAmount: auction.bidAmount.amount,
      team: userTeam,
      isPaused: auction.isPaused,
      status: auction.status,
      biddingStarted: auction.biddingStarted,
      lastSoldPlayer: lastSold || null,
      mostExpensivePlayer: mostExpensive || null,
      status: auction.status,
      biddingHistory: auction.biddingHistory.map((entry) => ({
        player: entry.player,
        team: entry.team,
        bidAmount: entry.bidAmount,
        time: entry.time,
      })),
      selectedPlayers: auction.selectedPlayers || [],
      pendingRTMRequest: auction.pendingRTMRequest,
    });
  } catch (error) {
    console.error("Error fetching bidding data:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get('/auto-bid-settings/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    res.json({
      isEnabled: auction.autoBidEnabled || false,
      range: auction.autoBidRange || 10000
    });
  } catch (error) {
    console.error('Error fetching auto bid settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Update auto bid settings
router.post('/auto-bid-settings/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { isEnabled, range } = req.body;
    
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Update auction with auto bid settings
    auction.autoBidEnabled = isEnabled;
    auction.autoBidRange = range;
    await auction.save();
    
    // Get io instance from app
    const io = req.app.get('io');
    
    // Emit to all connected clients about the auto bid settings change
    io.to(`auction-${auctionId}`).emit('auto-bid:settings-updated', {
      isEnabled,
      range
    });
    
    res.json({ 
      success: true, 
      message: 'Auto bid settings updated successfully',
      settings: { isEnabled, range }
    });
    
  } catch (error) {
    console.error('Error updating auto bid settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.patch('/update-bid/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid bid amount' });
    }

    const auction = await Auction.findById(auctionId)
      .populate('currentPlayerOnBid')
      .populate('currentBid.team');

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (!auction.currentPlayerOnBid) {
      return res.status(400).json({ error: 'No player currently on bid' });
    }

    // Update bid amount
    auction.bidAmount = { amount };
    await auction.save();

    const io = req.app.get('io');

    // ✅ Correct room name formatting
    io.to(`${auctionId}`).emit('bid:updated', {
      auctionId,
      playerId: auction.currentPlayerOnBid._id,
      newBid: {
        amount,
        team: auction.currentBid?.team?.teamName || null,
        teamLogo: auction.currentBid?.team?.logoUrl || null,
      },
      timestamp: new Date(),
      systemGenerated: true,
    });

    res.json({
      message: 'Bid updated successfully',
      newBidAmount: amount,
      auctionId,
    });
  } catch (error) {
    console.error('Error updating bid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Place bid: add emit after saving new bid
// router.post("/place-bid/:auctionId", auth, async (req, res) => {
//   try {
//     const { playerId, teamId, bidAmount } = req.body;
//     const { auctionId } = req.params;

//     const auction = await Auction.findById(auctionId);
//     if (!auction) {
//       return res.status(404).json({ error: "Auction not found" });
//     }

//     if (auction.isPaused || auction.status !== "live") {
//       return res.status(400).json({ error: "Auction is not active" });
//     }

//     if (
//       auction.currentPlayerOnBid &&
//       auction.currentPlayerOnBid.toString() !== playerId.toString()
//     ) {
//       return res.status(400).json({
//         error: "Player on bid does not match the current bidding player.",
//       });
//     }

//     const isSameAmount =
//       Number(auction.currentBid?.amount) === Number(bidAmount);
//     const isSameTeam =
//       auction.currentBid?.team?.toString() === teamId.toString();

//     if (isSameAmount) {
//       if (isSameTeam) {
//         return res.status(400).json({
//           error: "You cannot place the same bid twice.",
//         });
//       } else {
//         // Fetch team name of the currentBid team
//         const existingTeam = await Team.findById(auction.currentBid.team);
//         const teamName = existingTeam?.shortName || "Another team";

//         return res.status(400).json({
//           error: `${teamName} already placed this bid. Wait for the amount to change.`,
//         });
//       }
//     } else {
//       if (isSameTeam) {
//         return res.status(400).json({
//           error:
//             "You already placed bid for the previous amount!! Give other team chance",
//         });
//       }
//     }

//     // Get bidding team data
//     const team = await Team.findById(teamId);
//     if (!team) return res.status(404).json({ error: "Team not found" });

//     if (team.remaining < bidAmount) {
//       return res.status(400).json({
//         error: "Insufficient balance to place this bid.",
//       });
//     }
//     // Place the bid
//     auction.currentBid = {
//       team: teamId,
//       amount: bidAmount,
//     };

//     await auction.save();

//     // Emit the new bid to all clients in room
//     {
//       const io = req.app.get("io");
//       io.to(auctionId).emit("bid:placed", {
//         currentPlayerOnBid: auction.currentPlayerOnBid,
//         newBid: {
//           team: team.shortName,
//           teamLogo: team.logoUrl,
//           amount: bidAmount,
//         },
//       });
//     }

//     res.status(200).json({ message: "Bid placed successfully" });
//   } catch (err) {
//     console.error("Place bid error:", err);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: err.message });
//   }
// });

router.post("/place-bid/:auctionId", auth, async (req, res) => {
  try {
    const { playerId, teamId, bidAmount } = req.body;
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId).populate("currentBid.team");
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    if (auction.isPaused || auction.status !== "live") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    if (
      auction.currentPlayerOnBid &&
      auction.currentPlayerOnBid.toString() !== playerId.toString()
    ) {
      return res.status(400).json({
        error: "Player on bid does not match the current bidding player.",
      });
    }

    const isSameAmount = Number(auction.currentBid?.amount) === Number(bidAmount);
    const isSameTeam =
      auction.currentBid?.team?._id?.toString() === teamId.toString();

    if (isSameAmount) {
      if (isSameTeam) {
        return res.status(400).json({
          error: "You cannot place the same bid twice.",
        });
      } else {
        return res.status(400).json({
          error: `${auction.currentBid?.team?.shortName || "Another team"} already placed this bid. Wait for the amount to change.`,
        });
      }
    } else {
      if (isSameTeam) {
        return res.status(400).json({
          error: "You already placed bid for the previous amount!! Give other team chance",
        });
      }
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.remaining < bidAmount) {
      return res.status(400).json({ error: "Insufficient balance to place this bid." });
    }

    // Atomic update (only if everything above passes)
    const updatedAuction = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        currentPlayerOnBid: playerId,
        isPaused: false,
        status: "live",
      },
      {
        $set: {
          "currentBid.amount": bidAmount,
          "currentBid.team": teamId,
        },
        $push: {
          biddingHistory: {
            player: playerId,
            team: teamId,
            bidAmount,
            time: new Date(),
          },
        },
      },
      { new: true }
    ).populate("currentPlayerOnBid");

    const io = req.app.get("io");
    io.to(auctionId).emit("bid:placed", {
      currentPlayerOnBid: updatedAuction.currentPlayerOnBid,
      newBid: {
        team: team.shortName,
        teamLogo: team.logoUrl,
        amount: bidAmount,
      },
    });

    return res.status(200).json({ message: "Bid placed successfully" });
  } catch (err) {
    console.error("Place bid error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});



router.post("/use-rtm/:auctionId", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { teamId } = req.body;
    const userId = req.user.id;

    const auction = await Auction.findById(auctionId)
      .populate("biddingHistory.player")
      .populate("biddingHistory.team")
      .populate("selectedTeams.team")
      .populate("selectedTeams.manager");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status === "completed") {
      return res.status(400).json({ message: "Auction completed" });
    }

    const selectedTeam = auction.selectedTeams.find(
      (entry) =>
        entry.team._id.toString() === teamId &&
        entry.manager?._id.toString() === userId
    );

    if (!selectedTeam) {
      return res
        .status(403)
        .json({ message: "Unauthorized or team not found" });
    }

    if (selectedTeam.rtmCount <= 0) {
      return res.status(400).json({ message: "No RTMs left" });
    }

    const lastBid =
      auction.biddingHistory.length > 0
        ? auction.biddingHistory[auction.biddingHistory.length - 1]
        : null;

    if (!lastBid) {
      return res.status(404).json({ message: "Player not found in history" });
    }

    const { bidAmount, team: previousTeam, player: previousPlayer } = lastBid;

    // ❌ Case 1: Requesting team already owns the player
    if (previousTeam._id.toString() === teamId) {
      return res
        .status(400)
        .json({ message: "Player is already in your team" });
    }


    if (
      auction.pendingRTMRequest &&
      auction.pendingRTMRequest.teamId &&
      auction.pendingRTMRequest.teamId.toString() !== teamId
    ) {
      console.log("❌ Rejected: Another team already made an RTM request.");
      return res.status(400).json({
        message:
          "Another team has already submitted an RTM request. Try again later.",
      });
    }

    if (previousPlayer.isRTM) {
      return res.status(400).json({ message: "Player has already been RTM'd" });
    }

    // ✅ All validations passed
    auction.pendingRTMRequest = {
      teamId: teamId,
      playerId: previousPlayer._id,
      playerName: previousPlayer.name,
      bidAmount: bidAmount,
      fromTeam: previousTeam._id,
      fromTeamName: previousTeam.shortName,
      teamName: selectedTeam.team.shortName,
      requestedAt: new Date(),
    };

    await auction.save();
    // await Auction.findByIdAndUpdate(auctionId, {
    //   $unset: { pendingRTMRequest: 1 }
    // });

    const io = req.app.get("io");
    io.to(auctionId).emit("rtm:request", {
      message: "RTM request pending approval",
      teamId: teamId,
      teamName: selectedTeam.team.shortName,
      playerId: previousPlayer._id,
      playerName: previousPlayer.name,
      bidAmount: bidAmount,
      fromTeam: previousTeam._id,
      fromTeamName: previousTeam.shortName,
    });

    res.status(200).json({
      message: "RTM request sent for approval",
      status: "pending",
    });
  } catch (error) {
    console.error("❌ RTM error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: error.stack, // <— very useful!
    });
  }
});

// Backend: Enhanced RTM Decision Handler with Better Error Handling
router.post("/rtm-decision/:auctionId", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { decision } = req.body; // 'approve' or 'reject'
    const userId = req.user.id;

    console.log("=== RTM DECISION DEBUG ===");
    console.log("Decision:", decision);
    console.log("Auction ID:", auctionId);
    console.log("User ID:", userId);

    const auction = await Auction.findById(auctionId)
      .populate("biddingHistory.player")
      .populate("biddingHistory.team")
      .populate("selectedTeams.team")
      .populate("selectedTeams.manager");

    if (!auction) {
      console.log("❌ Auction not found");
      return res.status(404).json({ message: "Auction not found" });
    }

    // Check if user is admin/creator of auction
    if (auction.createdBy.toString() !== userId) {
      console.log("❌ Unauthorized user");
      return res
        .status(403)
        .json({ message: "Only auction admin can make this decision" });
    }

    if (auction.pendingRTMRequest === null) {
      console.log("❌ No pending RTM request");
      return res.status(400).json({ message: "No pending RTM request" });
    }

    const rtmRequest = auction.pendingRTMRequest;
    console.log("RTM Request:", rtmRequest);

    const io = req.app.get("io");

    if (decision === "approve") {
      // Execute the RTM transfer
      const { teamId, playerId, bidAmount, fromTeam, playerName } = rtmRequest;

      console.log("✅ Approving RTM:");
      console.log("- Player:", playerName);
      console.log("- From team:", fromTeam);
      console.log("- To team:", teamId);
      console.log("- Amount:", bidAmount);

      // Add player to new team and deduct purse
      await Team.findByIdAndUpdate(teamId, {
        $push: { players: { player: playerId, price: bidAmount } },
        $inc: { remaining: -bidAmount, rtmCount: -1 },
      });

      // Mark player as RTM
      await Player.findByIdAndUpdate(playerId, {
        isRTM: true,
      });

      // Remove player from old team and add back the purse
      await Team.findByIdAndUpdate(fromTeam, {
        $pull: { players: { player: playerId } },
        $inc: { remaining: bidAmount },
      });

      // Update bidding history to reflect new team
      auction.biddingHistory = auction.biddingHistory.map((entry) => {
        if (entry.player._id.toString() === playerId.toString()) {
          return {
            ...entry._doc,
            team: teamId,
          };
        }
        return entry;
      });

      // Update RTM count in auction's selectedTeams
      await Auction.findOneAndUpdate(
        {
          _id: auctionId,
          "selectedTeams.team": teamId,
        },
        {
          $inc: { "selectedTeams.$.rtmCount": -1 },
        }
      );

      // Clear pending request
      auction.pendingRTMRequest = undefined;
      await auction.save();

      // Emit success with enhanced data
      io.to(auctionId).emit("rtm:approved", {
        message: "RTM approved and executed",
        playerId: playerId,
        playerName: playerName || "Unknown Player", // Fallback
        fromTeam: fromTeam,
        toTeam: teamId,
        bidAmount: bidAmount,
      });

      console.log("✅ RTM approved and emitted");
      res.status(200).json({
        message: "RTM approved and executed",
        playerName: playerName,
      });
    } else if (decision === "reject") {
      // Enhanced rejection handling
      const { teamId, playerId, playerName } = rtmRequest;

      console.log("❌ Rejecting RTM:");
      console.log("- Player:", playerName);
      console.log("- Team:", teamId);
      console.log("- Player ID:", playerId);

      // Clear pending request first
      auction.pendingRTMRequest = undefined;
      await auction.save();

      // Get additional player info if playerName is missing
      let finalPlayerName = playerName;
      if (!finalPlayerName) {
        try {
          const player = await Player.findById(playerId);
          finalPlayerName = player?.name || "Unknown Player";
          console.log("Retrieved player name from DB:", finalPlayerName);
        } catch (error) {
          console.log("Error retrieving player name:", error);
          finalPlayerName = "Unknown Player";
        }
      }

      // Emit rejection with enhanced data
      const rejectionPayload = {
        message: "RTM request rejected",
        playerId: playerId,
        playerName: finalPlayerName,
        teamId: teamId,
        // Add these for better debugging
        originalPlayerName: playerName,
        retrievedPlayerName: finalPlayerName,
      };

      console.log("Emitting rejection payload:", rejectionPayload);

      io.to(auctionId).emit("rtm:rejected", rejectionPayload);

      console.log("✅ RTM rejection emitted");
      res.status(200).json({
        message: "RTM request rejected",
        playerName: finalPlayerName,
      });
    } else {
      console.log("❌ Invalid decision");
      return res
        .status(400)
        .json({ message: "Invalid decision. Use 'approve' or 'reject'" });
    }
  } catch (error) {
    console.error("RTM decision error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
