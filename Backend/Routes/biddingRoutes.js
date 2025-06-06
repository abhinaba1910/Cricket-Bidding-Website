const express = require("express");
const router = express.Router();
const auth = require("../Auth/Authentication");

const Auction = require("../Models/auction");
const Team = require("../Models/team");
const Player = require("../Models/player");

// 1. Set the current player for bidding
// router.post('/start-bidding/:auctionId', auth, async (req, res) => {
//   try {
//     const { playerId } = req.body;
//     const auction = await Auction.findByIdAndUpdate(
//       req.params.auctionId,
//       { currentPlayerOnBid: playerId, currentBid: { team: null, amount: 0 } },
//       { new: true }
//     );
//     res.json({ message: 'Bidding started', auction });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// 2. Start bidding timer (frontend will handle the timer logic)
router.post("/start-timer/:playerId", auth, async (req, res) => {
  try {
    // Just a placeholder route for timer start signal
    res.json({ message: "Timer started for player" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Manual Sell
// router.post('/manual-sell/:auctionId/:playerId', auth, async (req, res) => {
//   try {
//     const auction = await Auction.findById(req.params.auctionId);
//     const playerId = req.params.playerId;

//     if (!auction || !auction.currentBid.team) {
//       return res.status(400).json({ error: 'No bid to sell' });
//     }

//     const { team: teamId, amount } = auction.currentBid;

//     await Player.findByIdAndUpdate(playerId, {
//       availability: 'Sold',
//     });

//     await Team.findByIdAndUpdate(teamId, {
//       $push: { players: { player: playerId, price: amount } },
//       $inc: { remaining: -amount }
//     });

//     auction.biddingHistory.push({
//       player: playerId,
//       team: teamId,
//       bidAmount: amount
//     });

//     auction.currentBid = { team: null, amount: 0 };
//     auction.currentPlayerOnBid = null;

//     await auction.save();

//     res.json({ message: 'Player sold successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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
      currentQueuePosition: 0
    };

    if (selectionMode === "automatic" || (!selectionMode && auction.selectionMode === "automatic")) {
      // Automatic mode - get first available player based on filter
      const filterQuery = updateData.automaticFilter === "All"
        ? { availability: "Available" }
        : {
            availability: "Available",
            role: updateData.automaticFilter === "Wicket-keeper" 
              ? "Wicket-keeper" 
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
        const sortedQueue = auction.manualPlayerQueue.sort((a, b) => a.position - b.position);
        nextPlayer = await Player.findById(sortedQueue[0].player);
        updateData.currentQueuePosition = 0;
      }
    }

    if (!nextPlayer) {
      return res.status(400).json({ 
        error: selectionMode === "automatic" || (!selectionMode && auction.selectionMode === "automatic")
          ? "No players available matching the selected filter" 
          : "No players selected in manual queue" 
      });
    }

    // Update auction with current player and mark bidding as started
    updateData.currentPlayerOnBid = nextPlayer._id;
    updateData.currentBid = { team: null, amount: nextPlayer.basePrice || 0 };

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    ).populate("currentPlayerOnBid").populate("manualPlayerQueue.player");

    res.json({
      message: "Bidding started successfully",
      auction: updatedAuction,
      currentPlayer: nextPlayer,
      selectionMode: updateData.selectionMode
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

    // Get current bid details
    let teamId, amount;
    if (auction.currentBid && auction.currentBid.team) {
      teamId = auction.currentBid.team;
      amount = auction.currentBid.amount;
    } else {
      // Default fallback for testing
      if (!auction.selectedTeams || auction.selectedTeams.length === 0) {
        return res.status(400).json({ error: "No teams available for bidding" });
      }
      teamId = auction.selectedTeams[0]._id;
      const player = await Player.findById(playerId);
      amount = player?.basePrice || 1000000;
    }

    let nextPlayer = null;
    let newQueuePosition = auction.currentQueuePosition;

    if (auction.selectionMode === "automatic") {
      // Get next available player based on filter (excluding sold players)
      const filterQuery = auction.automaticFilter === "All"
        ? { availability: "Available" }
        : {
            availability: "Available",
            role: auction.automaticFilter === "Wicket-keeper" 
              ? "Wicket-keeper" 
              : auction.automaticFilter,
          };

      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: playerId },
      });
    } else {
      // Manual mode - get next player from queue
      const nextPosition = auction.currentQueuePosition + 1;
      const sortedQueue = auction.manualPlayerQueue.sort((a, b) => a.position - b.position);
      
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

    // Add to bidding history
    auction.biddingHistory.push({
      player: playerId,
      team: teamId,
      bidAmount: amount,
    });

    // Update lastSoldPlayer and mostExpensivePlayer
    auction.lastSoldPlayer = {
      player: playerId,
      team: teamId,
      bidAmount: amount,
    };

    if (!auction.mostExpensivePlayer || amount > auction.mostExpensivePlayer.bidAmount) {
      auction.mostExpensivePlayer = {
        player: playerId,
        team: teamId,
        bidAmount: amount,
      };
    }

    // Update auction with next player
    if (nextPlayer) {
      auction.currentPlayerOnBid = nextPlayer._id;
      auction.currentBid = { team: null, amount: nextPlayer.basePrice || 0 };
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
    const remainingPlayers = auction.selectionMode === "manual" 
      ? Math.max(0, auction.manualPlayerQueue.length - newQueuePosition - 1)
      : 0; // For auto mode, we don't know exact count

    res.json({
      message: "Player sold successfully",
      soldTo: teamId,
      amount: amount,
      nextPlayer: nextPlayer,
      isLastPlayer: isLastPlayer,
      currentQueuePosition: newQueuePosition,
      totalQueueLength: auction.manualPlayerQueue.length,
      remainingPlayers: remainingPlayers,
      biddingEnded: !nextPlayer
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
      canChangeMode: true
    });
  } catch (err) {
    console.error("Update selection mode error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/set-manual-queue/:auctionId", auth, async (req, res) => {
  try {
    const { playerQueue } = req.body; // Array of {player: playerId, position: number}
    const auction = await Auction.findById(req.params.auctionId);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Sort the queue by position to ensure correct order
    const sortedQueue = playerQueue.sort((a, b) => a.position - b.position);

    let updateData = {
      manualPlayerQueue: sortedQueue,
    };

    // Handle queue position based on current state
    if (!auction.biddingStarted) {
      // Bidding not started - reset to beginning
      updateData.currentQueuePosition = 0;
    } else if (auction.selectionMode === "automatic" && sortedQueue.length > 0) {
      // Switching from auto to manual mid-bidding - set to -1 so next will be 0
      updateData.currentQueuePosition = -1;
    } else if (auction.selectionMode === "manual") {
      // Already in manual mode - handle adding players to existing queue
      const currentPos = auction.currentQueuePosition;
      
      // If we're adding more players and current position is beyond new queue
      if (currentPos >= sortedQueue.length) {
        updateData.currentQueuePosition = Math.max(0, sortedQueue.length - 1);
      }
      // If we're still within the queue, keep current position
      // New players will be added after current ones
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    ).populate("manualPlayerQueue.player");

    // Check if we need to start the next player immediately
    let nextPlayerInfo = null;
    if (auction.biddingStarted && auction.selectionMode === "manual" && !auction.currentPlayerOnBid) {
      // No current player but bidding started - get first from new queue
      if (sortedQueue.length > 0) {
        const nextPlayer = await Player.findById(sortedQueue[0].player);
        nextPlayerInfo = {
          nextPlayer: nextPlayer,
          shouldStartNext: true
        };
      }
    }

    res.json({ 
      message: "Manual queue updated successfully", 
      auction: updatedAuction,
      ...nextPlayerInfo
    });
  } catch (err) {
    console.error("Set manual queue error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Updated queue status route
router.get("/queue-status/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate("manualPlayerQueue.player")
      .populate("currentPlayerOnBid");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Calculate remaining players
    let remainingPlayers = 0;
    let isLastPlayer = false;

    if (auction.selectionMode === "manual") {
      remainingPlayers = Math.max(0, auction.manualPlayerQueue.length - auction.currentQueuePosition - 1);
      isLastPlayer = remainingPlayers === 0 && auction.biddingStarted;
    } else {
      // For automatic mode, count available players matching filter
      const filterQuery = auction.automaticFilter === "All"
        ? { availability: "Available" }
        : {
            availability: "Available",
            role: auction.automaticFilter === "Wicket-keeper" 
              ? "Wicket-keeper" 
              : auction.automaticFilter,
          };
      
      const availablePlayers = await Player.countDocuments({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: auction.currentPlayerOnBid },
      });
      
      remainingPlayers = availablePlayers;
      isLastPlayer = remainingPlayers === 0 && auction.biddingStarted;
    }

    // Mode can always be changed now
    const canChangeMode = true;

    res.json({
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: auction.manualPlayerQueue.length,
      remainingPlayers: remainingPlayers,
      isLastPlayer: isLastPlayer,
      canChangeMode: canChangeMode,
      selectionMode: auction.selectionMode,
      biddingStarted: auction.biddingStarted,
      automaticFilter: auction.automaticFilter,
      hasCurrentPlayer: !!auction.currentPlayerOnBid,
      currentPlayer: auction.currentPlayerOnBid,
      manualPlayerQueue: auction.manualPlayerQueue
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

    let nextPlayer = null;
    let nextPosition = null;
    let remainingCount = 0;

    if (auction.selectionMode === "manual") {
      const nextPos = auction.currentQueuePosition + 1;
      const sortedQueue = auction.manualPlayerQueue.sort((a, b) => a.position - b.position);
      
      if (sortedQueue.length > nextPos) {
        nextPlayer = sortedQueue[nextPos].player;
        nextPosition = nextPos;
        remainingCount = sortedQueue.length - nextPos;
      }
    } else {
      // Automatic mode
      const filterQuery = auction.automaticFilter === "All"
        ? { availability: "Available" }
        : {
            availability: "Available",
            role: auction.automaticFilter === "Wicket-keeper" 
              ? "Wicket-keeper" 
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
      selectionMode: auction.selectionMode
    });
  } catch (err) {
    console.error("Next player error:", err);
    res.status(500).json({ error: err.message });
  }
});

// New route to handle automatic filter popup and start bidding
router.post("/start-automatic-bidding/:auctionId", auth, async (req, res) => {
  try {
    const { automaticFilter } = req.body;
    const auction = await Auction.findById(req.params.auctionId)
      .populate("selectedPlayers");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    if (auction.biddingStarted) {
      return res.status(400).json({ error: "Bidding has already started" });
    }

    // Update to automatic mode with selected filter
    const filterQuery = automaticFilter === "All"
      ? { availability: "Available" }
      : {
          availability: "Available",
          role: automaticFilter === "Wicket-keeper" ? "Wicket-keeper" : automaticFilter,
        };

    const firstPlayer = await Player.findOne({
      ...filterQuery,
      _id: { $in: auction.selectedPlayers },
    });

    if (!firstPlayer) {
      return res.status(400).json({ 
        error: "No players available matching the selected filter" 
      });
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      {
        selectionMode: "automatic",
        automaticFilter: automaticFilter,
        biddingStarted: true,
        currentPlayerOnBid: firstPlayer._id,
        currentBid: { team: null, amount: firstPlayer.basePrice || 0 },
        currentQueuePosition: 0
      },
      { new: true }
    ).populate("currentPlayerOnBid");

    res.json({
      message: "Automatic bidding started successfully",
      auction: updatedAuction,
      currentPlayer: firstPlayer,
      selectionMode: "automatic",
      automaticFilter: automaticFilter
    });
  } catch (err) {
    console.error("Start automatic bidding error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Place bid
router.post("/place-bid", auth, async (req, res) => {
  try {
    const { auctionId, playerId, teamId, bidAmount } = req.body;

    const auction = await Auction.findById(auctionId);

    if (auction.isPaused || auction.status !== "started") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    auction.currentBid = { team: teamId, amount: bidAmount };
    auction.biddingHistory.push({
      player: playerId,
      team: teamId,
      bidAmount,
    });

    await auction.save();

    res.json({ message: "Bid placed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Pause auction
router.patch("/pause-auction/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      { isPaused: true },
      { new: true }
    );
    res.json({ message: "Auction paused", auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Resume auction
router.patch("/resume-auction/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      { isPaused: false },
      { new: true }
    );
    res.json({ message: "Auction resumed", auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. End auction
router.post("/end-auction/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      {
        status: "completed",
        currentBid: { team: null, amount: 0 },
        currentPlayerOnBid: null,
      },
      { new: true }
    );
    res.json({ message: "Auction ended", auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = router;
