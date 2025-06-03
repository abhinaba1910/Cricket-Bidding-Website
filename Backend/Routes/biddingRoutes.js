const express = require('express');
const router = express.Router();
const auth = require("../Auth/Authentication");

const Auction = require("../Models/auction");
const Team = require('../Models/team');
const Player = require('../Models/player');

// 1. Set the current player for bidding
router.post('/start-bidding/:auctionId', auth, async (req, res) => {
  try {
    const { playerId } = req.body;
    const auction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      { currentPlayerOnBid: playerId, currentBid: { team: null, amount: 0 } },
      { new: true }
    );
    res.json({ message: 'Bidding started', auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Start bidding timer (frontend will handle the timer logic)
router.post('/start-timer/:playerId', auth, async (req, res) => {
  try {
    // Just a placeholder route for timer start signal
    res.json({ message: 'Timer started for player' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Manual Sell
router.post('/manual-sell/:auctionId/:playerId', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    const playerId = req.params.playerId;

    if (!auction || !auction.currentBid.team) {
      return res.status(400).json({ error: 'No bid to sell' });
    }

    const { team: teamId, amount } = auction.currentBid;

    await Player.findByIdAndUpdate(playerId, {
      availability: 'Sold',
    });

    await Team.findByIdAndUpdate(teamId, {
      $push: { players: { player: playerId, price: amount } },
      $inc: { purse: -amount }
    });

    auction.biddingHistory.push({
      player: playerId,
      team: teamId,
      bidAmount: amount
    });

    auction.currentBid = { team: null, amount: 0 };
    auction.currentPlayerOnBid = null;

    await auction.save();

    res.json({ message: 'Player sold successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Place bid
router.post('/place-bid', auth, async (req, res) => {
  try {
    const { auctionId, playerId, teamId, bidAmount } = req.body;

    const auction = await Auction.findById(auctionId);

    if (auction.isPaused || auction.status !== 'started') {
      return res.status(400).json({ error: 'Auction is not active' });
    }

    auction.currentBid = { team: teamId, amount: bidAmount };
    auction.biddingHistory.push({
      player: playerId,
      team: teamId,
      bidAmount
    });

    await auction.save();

    res.json({ message: 'Bid placed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Pause auction
router.patch('/pause-auction/:auctionId', auth, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      { isPaused: true },
      { new: true }
    );
    res.json({ message: 'Auction paused', auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Resume auction
router.patch('/resume-auction/:auctionId', auth, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      { isPaused: false },
      { new: true }
    );
    res.json({ message: 'Auction resumed', auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. End auction
router.post('/end-auction/:auctionId', auth, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.auctionId,
      { status: 'completed', currentBid: { team: null, amount: 0 }, currentPlayerOnBid: null },
      { new: true }
    );
    res.json({ message: 'Auction ended', auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get real-time bidding data
router.get('/get-bidding-data/:auctionId', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate('currentPlayerOnBid')
      .populate('currentBid.team')
      .populate({
        path: 'biddingHistory',
        populate: { path: 'player team' }
      });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
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
