const express = require("express");
const router = express.Router();
const auth = require("../Auth/Authentication");

const Auction = require("../Models/auction");
const Team = require("../Models/team");
const Player = require("../Models/player");

// 2. Start bidding timer (frontend will handle the timer logic)
router.post("/start-timer/:playerId", auth, async (req, res) => {
  try {
    // Just a placeholder route for timer start signal
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

    // ✅ Handle pauseAfterCurrentPlayer in automatic mode
    // if (auction.pauseAfterCurrentPlayer) {
    //   auction.isPaused = true;
    //   auction.pauseAfterCurrentPlayer = false;
    //   auction.currentPlayerOnBid = null;
    //   auction.biddingStarted = false;

    //   await auction.save();

    //   return res.status(200).json({
    //     message: "Auction paused after current player (automatic mode)",
    //     auctionPaused: true,
    //   });
    // }

    if (auction.pauseAfterCurrentPlayer) {
      auction.isPaused = true;
      auction.pauseAfterCurrentPlayer = false;
      auction.currentPlayerOnBid = null;
      auction.biddingStarted = false;

      // Save and return full response so frontend doesn't throw error
      await auction.save();

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

    auction.biddingHistory.push({
      player: playerId,
      team: teamId,
      bidAmount: amount,
      time: new Date(),
    });

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

    // Update auction with next player
    if (nextPlayer) {
      auction.currentPlayerOnBid = nextPlayer._id;
      auction.currentBid = { team: null, amount: 0 };
      auction.currentQueuePosition = newQueuePosition;
    } else {
      // No more players available - end bidding
      auction.currentPlayerOnBid = null;
      auction.currentBid = { team: null, amount: 0 };
      auction.biddingStarted = false; // End bidding when no more players
    }

    await auction.save();

    // Check if this was the last player
    const isLastPlayer = !nextPlayer;
    const remainingPlayers =
      auction.selectionMode === "manual"
        ? Math.max(0, auction.manualPlayerQueue.length - newQueuePosition - 1)
        : 0; // For auto mode, we don't know exact count

    return res.status(200).json({
      message: "Player sold successfully, auction paused after current player",
      soldTo: teamId,
      amount: amount,
      nextPlayer: null,
      isLastPlayer: true,
      biddingEnded: true,
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: auction.manualPlayerQueue.length,
      remainingPlayers: 0,
      isPaused: true,
    });
  } catch (err) {
    console.error("Manual sell error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /update-bid/:auctionId
router.patch("/update-bid/:auctionId", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { amount } = req.body;

    const auction = await Auction.findById(auctionId);

    if (!auction || !auction.currentPlayerOnBid) {
      return res
        .status(404)
        .json({ error: "Auction or current player not found." });
    }

    // ✅ Only update bidAmount, NOT currentBid
    auction.bidAmount = {
      player: auction.currentPlayerOnBid,
      amount: amount,
    };

    await auction.save();

    res.json({ message: "Bid updated successfully", bidAmount: amount });
  } catch (err) {
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
        // Next player will be determined by filter
      } else if (selectionMode === "manual") {
        // Switching to manual - set position to -1 so next player starts from position 0
        // This ensures that when current player is sold, it moves to first manual player
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
    const { playerQueue, newPlayers, existingQueue } = req.body;
    const auction = await Auction.findById(req.params.auctionId);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    let finalQueue = [];
    let updateData = {};

    // Utility: Ensure no duplicate player entries — override older ones with latest position
    const mergeAndDeduplicateQueue = (baseQueue, addedPlayers) => {
      const playerMap = new Map();

      // First add existing queue
      for (const item of baseQueue) {
        playerMap.set(String(item.player), { ...item });
      }

      // Then add new players — overwrite if already exists
      for (const item of addedPlayers) {
        playerMap.set(String(item.player), { ...item }); // Update to new position
      }

      // Convert map back to array
      return Array.from(playerMap.values()).sort(
        (a, b) => a.position - b.position
      );
    };

    // CASE 1: Adding more players to existing queue
    if (newPlayers && existingQueue) {
      console.log("Adding to existing queue");

      // Merge and deduplicate by player ID
      finalQueue = mergeAndDeduplicateQueue(existingQueue, newPlayers);

      updateData = {
        manualPlayerQueue: finalQueue,
      };

      // CASE 2: Replacing entire queue
    } else if (playerQueue) {
      console.log("Creating new queue");

      // Ensure no duplicates within the new queue itself
      finalQueue = mergeAndDeduplicateQueue([], playerQueue);

      updateData = {
        manualPlayerQueue: finalQueue,
      };

      if (!auction.biddingStarted) {
        updateData.currentQueuePosition = 0;
      } else if (
        auction.selectionMode === "automatic" &&
        finalQueue.length > 0
      ) {
        updateData.currentQueuePosition = -1;
      }
    } else {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Save the updated auction
    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    ).populate("manualPlayerQueue.player");

    // Trigger next player if needed
    let nextPlayerInfo = null;
    if (
      auction.biddingStarted &&
      auction.selectionMode === "manual" &&
      !auction.currentPlayerOnBid
    ) {
      const currentPos = updatedAuction.currentQueuePosition;
      if (finalQueue.length > currentPos + 1) {
        const nextPlayerData = finalQueue[currentPos + 1];
        const nextPlayer = await Player.findById(nextPlayerData.player);
        nextPlayerInfo = {
          nextPlayer: nextPlayer,
          shouldStartNext: true,
        };
      }
    }

    res.json({
      message: newPlayers
        ? "Players added to queue successfully"
        : "Manual queue updated successfully",
      auction: updatedAuction,
      totalQueueLength: finalQueue.length,
      currentPosition: updatedAuction.currentQueuePosition,
      ...nextPlayerInfo,
    });
  } catch (err) {
    console.error("Set manual queue error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/queue-status/:auctionId", auth, async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.auctionId)
      .populate("manualPlayerQueue.player")
      .populate("currentPlayerOnBid");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // 🧹 Remove any deleted players
    let validQueue = auction.manualPlayerQueue.filter((q) => q.player !== null);

    if (validQueue.length > 0) {
      // const lastPlayerId = validQueue[validQueue.length - 1].player._id;

      // const lastPlayer = await Player.findById(lastPlayerId);
      // const lastSold = auction.biddingHistory.find(
      //   (entry) => String(entry.player) === String(lastPlayerId)
      // );

      // if (lastPlayer?.availability === "Sold" && lastSold) {
      //   await Auction.findByIdAndUpdate(auction._id, {
      //     manualPlayerQueue: [],
      //     currentQueuePosition: 0,
      //   });
      //   validQueue = [];

      //   console.log(
      //     "✅ Manual queue cleared automatically after last player was sold (based on bidding history check)."
      //   );
      // }

      const lastPlayerId = validQueue[validQueue.length - 1].player._id;
      const lastPlayer = await Player.findById(lastPlayerId);

      const lastSold = auction.biddingHistory.find(
        (entry) => String(entry.player) === String(lastPlayerId)
      );

      // ✅ Clear queue if player was sold or explicitly marked unsold
      if (
        (lastPlayer?.availability === "Sold" && lastSold) ||
        lastPlayer?.availability === "Unsold"
      ) {
        await Auction.findByIdAndUpdate(auction._id, {
          manualPlayerQueue: [],
          currentQueuePosition: 0,
        });
        validQueue = [];

        console.log(
          "✅ Manual queue cleared: last player was either sold or marked unsold."
        );
      }
    }

    // Update auction if any deleted player was removed
    if (validQueue.length !== auction.manualPlayerQueue.length) {
      await Auction.findByIdAndUpdate(auction._id, {
        manualPlayerQueue: validQueue,
      });
    }

    // Calculate remaining players (manual mode)
    let remainingPlayers = 0;
    let isLastPlayer = false;

    if (auction.selectionMode === "manual") {
      remainingPlayers = Math.max(
        0,
        validQueue.length - auction.currentQueuePosition - 1
      );
      isLastPlayer = remainingPlayers === 0 && auction.biddingStarted;
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

      const availablePlayers = await Player.countDocuments({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: auction.currentPlayerOnBid },
      });

      remainingPlayers = availablePlayers;
      isLastPlayer = remainingPlayers === 0 && auction.biddingStarted;
    }

    res.json({
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: validQueue.length,
      remainingPlayers,
      isLastPlayer,
      canChangeMode: true,
      selectionMode: auction.selectionMode,
      biddingStarted: auction.biddingStarted,
      automaticFilter: auction.automaticFilter,
      hasCurrentPlayer: !!auction.currentPlayerOnBid,
      currentPlayer: auction.currentPlayerOnBid,
      manualPlayerQueue: validQueue,
    });
  } catch (err) {
    console.error("Queue status error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Enhanced next-player route
router.get("/next-player/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate("manualPlayerQueue.player")
      .populate("currentPlayerOnBid");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    if (auction.pauseAfterCurrentPlayer === true) {
      auction.isPaused = true;
      auction.pauseAfterCurrentPlayer = false;
      auction.currentPlayerOnBid = null; // make sure current bid ends
      await auction.save();

      return res.status(200).json({
        message: "Auction paused after current player",
        nextPlayer: null,
        hasNextPlayer: false,
        remainingCount: 0,
        selectionMode: auction.selectionMode,
        auctionPaused: true,
      });
    }

    let nextPlayer = null;
    let nextPosition = null;
    let remainingCount = 0;

    if (auction.selectionMode === "manual") {
      const nextPos = auction.currentQueuePosition + 1;
      const sortedQueue = auction.manualPlayerQueue.sort(
        (a, b) => a.position - b.position
      );

      if (sortedQueue.length > nextPos) {
        nextPlayer = sortedQueue[nextPos].player;
        nextPosition = nextPos;
        remainingCount = sortedQueue.length - nextPos;
      }
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
      nextPosition: nextPosition,
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
        automaticFilter === "Wicket keeper batsman" ? "Wicket keeper batsman" : automaticFilter;
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

router.patch("/pause-auction/:id", auth, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const { isPaused } = req.body;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // ✅ Automatic Mode - set pending pause if player is still on bid
    if (
      isPaused === true &&
      auction.selectionMode === "automatic" &&
      auction.currentPlayerOnBid
    ) {
      auction.pauseAfterCurrentPlayer = true;
      await auction.save();
      return res.status(200).json({
        message:
          "Pause will activate after current player is sold (automatic mode)",
        auction,
      });
    }

    // ✅ Manual Mode - pause only when queue is empty
    if (
      isPaused === true &&
      auction.selectionMode === "manual" &&
      auction.manualPlayerQueue.length === 0 &&
      auction.currentQueuePosition === 0
    ) {
      auction.isPaused = true;
      await auction.save();
      return res.status(200).json({
        message: "Auction paused successfully",
        auction,
      });
    }

    // ✅ Resume (unpause) logic
    if (isPaused === false) {
      auction.isPaused = false;
      auction.pauseAfterCurrentPlayer = false; // cancel pending pause too
      await auction.save();
      return res.status(200).json({
        message: "Auction resumed successfully",
        auction,
      });
    }

    return res.status(400).json({
      message: "Cannot pause auction First Sell All the Player From Queue.",
    });
  } catch (err) {
    console.error("Pause Auction Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

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

// router.patch("/unsold/:auctionId", auth, async (req, res) => {
//   try {
//     const { auctionId } = req.params;

//     const auction = await Auction.findById(auctionId)
//       .populate("currentPlayerOnBid")
//       .populate("manualPlayerQueue.player");

//     if (!auction || !auction.currentPlayerOnBid) {
//       return res.status(400).json({ message: "No current player on bid." });
//     }

//     const player = await Player.findById(auction.currentPlayerOnBid._id);
//     if (!player) {
//       return res.status(404).json({ message: "Player not found." });
//     }

//     // ✅ Step 1: Mark player as Unsold
//     player.availability = "Unsold";
//     await player.save();

//     // ✅ Step 2: Remove any accidental bid record (safety)
//     auction.biddingHistory = auction.biddingHistory.filter(
//       (bid) => String(bid.player) !== String(player._id)
//     );

//     // ✅ Step 3: Find next player (manual or automatic)
//     let nextPlayer = null;
//     let newQueuePosition = auction.currentQueuePosition;

//     if (auction.selectionMode === "manual") {
//       const nextPosition = auction.currentQueuePosition + 1;
//       const sortedQueue = auction.manualPlayerQueue.sort(
//         (a, b) => a.position - b.position
//       );

//       if (sortedQueue.length > nextPosition) {
//         nextPlayer = await Player.findById(sortedQueue[nextPosition].player);
//         newQueuePosition = nextPosition;
//       }

//       // Push unsold player to the end of queue
//       const maxPos = sortedQueue.reduce(
//         (max, q) => Math.max(max, q.position || 0),
//         0
//       );
//       auction.manualPlayerQueue.push({
//         player: player._id,
//         position: maxPos + 1,
//       });

//     } else {
//       // Automatic mode
//       const filterQuery =
//         auction.automaticFilter === "All"
//           ? { availability: "Available" }
//           : {
//               availability: "Available",
//               role:
//                 auction.automaticFilter === "Wicket-keeper"
//                   ? "Wicket-keeper"
//                   : auction.automaticFilter,
//             };

//       nextPlayer = await Player.findOne({
//         ...filterQuery,
//         _id: { $in: auction.selectedPlayers, $ne: player._id },
//       });
//     }

//     // ✅ Step 4: Update auction state
//     if (nextPlayer) {
//       auction.currentPlayerOnBid = nextPlayer._id;
//       auction.currentBid = { team: null, amount: 0 };
//       auction.bidAmount = {
//         player: nextPlayer._id,
//         amount: nextPlayer.basePrice,
//       };
//       auction.currentQueuePosition = newQueuePosition;
//       auction.biddingStarted = true;
//     } else {
//       // No next player
//       auction.currentPlayerOnBid = null;
//       auction.currentBid = { team: null, amount: 0 };
//       auction.bidAmount = { player: null, amount: 0 };
//       auction.biddingStarted = false;
//     }

//     await auction.save();

//     const isLastPlayer = !nextPlayer;
//     const remainingPlayers =
//       auction.selectionMode === "manual"
//         ? Math.max(0, auction.manualPlayerQueue.length - newQueuePosition - 1)
//         : 0;

//     return res.status(200).json({
//       message: "Player marked as Unsold. Moved to next.",
//       nextPlayer: nextPlayer || null,
//       isLastPlayer,
//       currentQueuePosition: auction.currentQueuePosition,
//       totalQueueLength: auction.manualPlayerQueue?.length || 0,
//       remainingPlayers,
//       isPaused: auction.isPaused,
//     });
//   } catch (err) {
//     console.error("Unsold Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

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

    // ✅ Step 1: Mark player as Unsold
    player.availability = "Unsold";
    await player.save();

    // ✅ Step 2: Remove any accidental bid record
    auction.biddingHistory = auction.biddingHistory.filter(
      (bid) => String(bid.player) !== String(player._id)
    );

    // ✅ Step 3: Move to next player
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

      // ❌ Do NOT push unsold player to end of queue
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

    // ✅ Step 4: Update auction state
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

    return res.status(200).json({
      message: "Player marked as Unsold. Moved to next.",
      nextPlayer: nextPlayer || null,
      isLastPlayer,
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: auction.manualPlayerQueue?.length || 0,
      remainingPlayers,
      isPaused: auction.isPaused,
    });
  } catch (err) {
    console.error("Unsold Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

router.patch("/end-auction/:auctionId", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    auction.status = "completed";
    auction.currentPlayerOnBid = null;
    auction.currentBid = { team: null, amount: 0 };
    auction.bidAmount = { player: null, amount: 0 };
    auction.isPaused = true;

    await auction.save();

    return res
      .status(200)
      .json({ message: "Auction ended successfully.", auction });
  } catch (err) {
    console.error("End Auction Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// 8. Get real-time bidding data
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

// routes/auction.js
router.post("/join-auction/:auctionId/confirm", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;
    const { teamId, avatarUrl } = req.body;

    if (!teamId || !avatarUrl) {
      return res.status(400).json({ message: "Team and avatar are required." });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    // ✅ NEW CHECK: Is the user already a manager in this auction?
    const alreadyManager = auction.selectedTeams.find(
      (entry) => entry.manager && entry.manager.toString() === userId
    );
    if (alreadyManager) {
      return res
        .status(409)
        .json({ message: "You have already selected a team and avatar." });
    }

    // Check if the selected team is valid and available
    const teamEntry = auction.selectedTeams.find(
      (t) => t.team.toString() === teamId
    );
    if (!teamEntry) {
      return res.status(400).json({ message: "Invalid team selection." });
    }
    if (teamEntry.manager) {
      return res
        .status(409)
        .json({ message: "Team already selected by another user." });
    }

    // Assign manager and avatar
    teamEntry.manager = userId;
    teamEntry.avatar = avatarUrl;

    await auction.save();
    res.status(200).json({ message: "Team and avatar selection successful." });
  } catch (err) {
    console.error("Error in join-auction/confirm:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// routes/auction.js
router.get("/join-auction/:auctionId/teams", auth, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;
    console.log("Fetching teams for auction:", auctionId);

    const auction = await Auction.findById(auctionId).populate(
      "selectedTeams.team"
    );

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
      .populate("isPaused")
      .populate("selectedTeams.rtmCount")
      .populate("selectedPlayers");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
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
    });
  } catch (error) {
    console.error("Error fetching bidding data:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/place-bid/:auctionId", auth, async (req, res) => {
  try {
    const { playerId, teamId, bidAmount } = req.body;
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId);
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

    const isSameAmount =
      Number(auction.currentBid?.amount) === Number(bidAmount);
    const isSameTeam =
      auction.currentBid?.team?.toString() === teamId.toString();

    if (isSameAmount) {
      if (isSameTeam) {
        return res.status(400).json({
          error: "You cannot place the same bid twice.",
        });
      } else {
        // Fetch team name of the currentBid team
        const existingTeam = await Team.findById(auction.currentBid.team);
        const teamName = existingTeam?.shortName || "Another team";

        return res.status(400).json({
          error: `${teamName} already placed this bid. Wait for the amount to change.`,
        });
      }
    } else {
      if (isSameTeam) {
        return res.status(400).json({
          error:
            "You already place bid for the previous amount!! Give other team chance",
        });
      }
    }

    // Get bidding team data
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.remaining < bidAmount) {
      return res.status(400).json({
        error: "Insufficient balance to place this bid.",
      });
    }
    // ✅ Place the bid
    auction.currentBid = {
      team: teamId,
      amount: bidAmount,
    };

    await auction.save();

    res.status(200).json({ message: "Bid placed successfully" });
  } catch (err) {
    console.error("Place bid error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});


const activeRTMWindow = new Map(); 

// routes/auction.js
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

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    // Find the selected team & manager
    const selectedTeam = auction.selectedTeams.find(
      (entry) =>
        entry.team._id.toString() === teamId &&
        entry.manager?._id.toString() === userId
    );

    if (!selectedTeam)
      return res
        .status(403)
        .json({ message: "Unauthorized or team not found" });

    if (selectedTeam.rtmCount <= 0)
      return res.status(400).json({ message: "No RTMs left" });

    // Find the last sold player from bidding history
    const lastBid =
      auction.biddingHistory.length > 0
        ? auction.biddingHistory[auction.biddingHistory.length - 1]
        : null;

    if (!lastBid)
      return res.status(404).json({ message: "Player not found in history" });

    const { bidAmount, team: previousTeam, player: previousPlayer } = lastBid;

    // Prevent RTM if original team is same
    if (previousTeam._id.toString() === teamId)
      return res.status(400).json({ message: "Player already in your team" });

    if (previousPlayer.isRTM)
      return res.status(400).json({ message: "Player is Already RTM once" });
    // Attach player to new team and deduct purse
    await Team.findByIdAndUpdate(teamId, {
      $push: { players: { player: previousPlayer, price: bidAmount } },
      $inc: { remaining: -bidAmount },
    });
    await Player.findByIdAndUpdate(previousPlayer._id, {
      isRTM: true,
    });

    // Remove player from old team
    await Team.findByIdAndUpdate(previousTeam._id, {
      $pull: { players: { player: previousPlayer } },
      $inc: { remaining: bidAmount },
    });

    // Update bidding history to reflect new team
    auction.biddingHistory = auction.biddingHistory.map((entry) => {
      if (entry.player._id.toString() === previousPlayer._id.toString()) {
        return {
          ...entry._doc,
          team: teamId, // replace team ID
        };
      }
      return entry;
    });

    // Decrease RTM count
    selectedTeam.rtmCount -= 1;

    await auction.save();

    res.status(200).json({ message: "RTM successful", newTeam: teamId });
  } catch (error) {
    console.error("RTM error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
