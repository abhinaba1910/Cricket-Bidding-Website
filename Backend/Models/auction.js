const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  auctionName: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
    unique: true,
  },
  auctionImage: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'live','started', 'completed'],
    default: 'upcoming',
  },
  countdownStartedAt: {
    type: Date,
    default: null,
  },
  currentPlayerOnBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null,
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  currentBid: {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    amount: { type: Number, default: 0 }
  },  
  selectedTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  selectedPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  biddingHistory: [
    {
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      bidAmount: Number,
      time: { type: Date, default: Date.now },
    }
  ],  
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
