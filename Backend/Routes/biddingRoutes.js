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
    const auction = await Auction.findById(req.params.auctionId)
      .populate("selectedPlayers")
      .populate("manualPlayerQueue.player");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    let nextPlayer = null;

    if (auction.selectionMode === "automatic") {
      // Get next available player based on filter
      const filterQuery =
        auction.automaticFilter === "All"
          ? { availability: "Available" }
          : {
              availability: "Available",
              role:
                auction.automaticFilter === "Wicket-keeper"
                  ? "Wicket-keeper"
                  : auction.automaticFilter,
            };

      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers },
      });
    } else {
      // Manual mode - get first player from queue (position 0)
      if (auction.manualPlayerQueue.length > 0) {
        nextPlayer = await Player.findById(auction.manualPlayerQueue[0].player);
        // Set current queue position to 0 for first player
        auction.currentQueuePosition = 0;
      }
    }

    if (!nextPlayer) {
      return res
        .status(400)
        .json({ error: "No players available for bidding" });
    }

    // Update auction with current player and mark bidding as started
    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      {
        currentPlayerOnBid: nextPlayer._id,
        currentBid: { team: null, amount: nextPlayer.basePrice || 0 },
        biddingStarted: true,
        currentQueuePosition:
          auction.selectionMode === "manual" ? 0 : auction.currentQueuePosition,
      },
      { new: true }
    );

    res.json({
      message: "Bidding started",
      auction: updatedAuction,
      currentPlayer: nextPlayer,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/manual-sell/:auctionId/:playerId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate(
      "selectedTeams"
    );
    const playerId = req.params.playerId;

    if (!auction) {
      return res.status(400).json({ error: "Auction not found" });
    }

    // For testing: if no current bid, create one with first selected team
    let teamId, amount;

    if (auction.currentBid && auction.currentBid.team) {
      teamId = auction.currentBid.team;
      amount = auction.currentBid.amount;
    } else {
      // For testing: use first selected team and current bid amount from frontend
      if (!auction.selectedTeams || auction.selectedTeams.length === 0) {
        return res
          .status(400)
          .json({ error: "No teams available for bidding" });
      }

      teamId = auction.selectedTeams[0]._id;

      // Get current player's base price or use a default amount
      const player = await Player.findById(playerId);
      amount = player?.basePrice || 1000000; // Default amount if base price not found
    }

    let nextPlayer = null;
    let newQueuePosition = auction.currentQueuePosition;

    if (auction.selectionMode === "automatic") {
      // Get next available player based on filter (excluding already sold players)
      const filterQuery =
        auction.automaticFilter === "All"
          ? { availability: "Available" }
          : {
              availability: "Available",
              role:
                auction.automaticFilter === "Wicket-keeper"
                  ? "Wicket-keeper"
                  : auction.automaticFilter,
            };

      // Exclude the player that just got sold
      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: playerId },
      });
    } else {
      // Manual mode - get next player from queue
      const nextPosition = auction.currentQueuePosition + 1;
      if (auction.manualPlayerQueue.length > nextPosition) {
        nextPlayer = await Player.findById(
          auction.manualPlayerQueue[nextPosition].player
        );
        // Update the current queue position
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

    // Update auction with next player and position
    if (nextPlayer) {
      auction.currentPlayerOnBid = nextPlayer._id;
      auction.currentBid = { team: null, amount: nextPlayer.basePrice || 0 };
    } else {
      // No more players available
      auction.currentPlayerOnBid = null;
      auction.currentBid = { team: null, amount: 0 };
    }
    
    // Update queue position
    auction.currentQueuePosition = newQueuePosition;

    await auction.save();

    // Check if this was the last player in manual mode
    const isLastPlayer =
      auction.selectionMode === "manual" &&
      newQueuePosition >= auction.manualPlayerQueue.length - 1;

    res.json({
      message: "Player sold successfully",
      soldTo: teamId,
      amount: amount,
      nextPlayer: nextPlayer,
      isLastPlayer: isLastPlayer,
      currentQueuePosition: newQueuePosition,
      totalQueueLength: auction.manualPlayerQueue.length,
    });
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

    // Check if mode change is allowed
    const isLastPlayerInManualMode =
      auction.selectionMode === "manual" &&
      auction.currentQueuePosition >= auction.manualPlayerQueue.length - 1;

    const canChangeMode =
      !auction.biddingStarted ||
      auction.selectionMode === "automatic" ||
      (auction.selectionMode === "manual" && (isLastPlayerInManualMode || !auction.currentPlayerOnBid));

    if (auction.biddingStarted && !canChangeMode) {
      return res.status(400).json({ 
        error: "Cannot change selection mode while bidding is in progress in manual mode" 
      });
    }

    let updateData = {
      selectionMode,
      automaticFilter: automaticFilter || auction.automaticFilter || "All",
    };

    // If switching to automatic mode, don't reset queue position if bidding started
    if (selectionMode === "automatic") {
      // Only reset if bidding hasn't started
      if (!auction.biddingStarted) {
        updateData.currentQueuePosition = 0;
      }
    }
    // If switching to manual mode
    else if (selectionMode === "manual") {
      if (!auction.biddingStarted) {
        updateData.currentQueuePosition = 0;
      }
      // If switching from auto to manual mid-bidding, set to -1 so next player will be at position 0
      else if (auction.selectionMode === "automatic") {
        updateData.currentQueuePosition = -1;
      }
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    );

    res.json({ 
      message: "Selection mode updated", 
      auction: updatedAuction,
      canChangeMode: true
    });
  } catch (err) {
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

    let updateData = {
      manualPlayerQueue: playerQueue,
    };

    // If bidding hasn't started yet, reset position to 0
    if (!auction.biddingStarted) {
      updateData.currentQueuePosition = 0;
    }
    // If switching from auto to manual mid-bidding, set position to -1 so next will be 0
    else if (auction.selectionMode === "automatic") {
      updateData.currentQueuePosition = -1;
    }
    // If already in manual mode and bidding started, keep current position
    // but ensure it doesn't exceed the new queue length
    else if (auction.currentQueuePosition >= playerQueue.length) {
      updateData.currentQueuePosition = Math.max(0, playerQueue.length - 1);
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      updateData,
      { new: true }
    );

    res.json({ message: "Manual queue set", auction: updatedAuction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Updated queue status route
router.get("/queue-status/:auctionId", auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate(
      "manualPlayerQueue.player"
    );

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Check if we're at the last player in manual mode
    const isLastPlayer =
      auction.selectionMode === "manual" &&
      auction.biddingStarted &&
      auction.currentQueuePosition >= auction.manualPlayerQueue.length - 1;

    // Can change mode if:
    // 1. Bidding hasn't started, OR
    // 2. Currently in automatic mode (can always change), OR  
    // 3. Currently in manual mode and it's the last player OR no current player on bid
    const canChangeMode =
      !auction.biddingStarted ||
      auction.selectionMode === "automatic" ||
      (auction.selectionMode === "manual" && (isLastPlayer || !auction.currentPlayerOnBid));

    res.json({
      currentQueuePosition: auction.currentQueuePosition,
      totalQueueLength: auction.manualPlayerQueue.length,
      isLastPlayer: isLastPlayer,
      canChangeMode: canChangeMode,
      selectionMode: auction.selectionMode,
      biddingStarted: auction.biddingStarted,
      automaticFilter: auction.automaticFilter,
      hasCurrentPlayer: !!auction.currentPlayerOnBid,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add a new route to get the next player in queue for manual mode
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

    if (auction.selectionMode === "manual") {
      const nextPos = auction.currentQueuePosition + 1;
      if (auction.manualPlayerQueue.length > nextPos) {
        nextPlayer = auction.manualPlayerQueue[nextPos].player;
        nextPosition = nextPos;
      }
    } else if (auction.selectionMode === "automatic") {
      const filterQuery =
        auction.automaticFilter === "All"
          ? { availability: "Available" }
          : {
              availability: "Available",
              role:
                auction.automaticFilter === "Wicket-keeper"
                  ? "Wicket-keeper"
                  : auction.automaticFilter,
            };

      // Get current player ID to exclude it
      const currentPlayerId = auction.currentPlayerOnBid;
      nextPlayer = await Player.findOne({
        ...filterQuery,
        _id: { $in: auction.selectedPlayers, $ne: currentPlayerId },
      });
    }

    res.json({
      nextPlayer: nextPlayer,
      nextPosition: nextPosition,
      hasNextPlayer: !!nextPlayer,
    });
  } catch (err) {
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
