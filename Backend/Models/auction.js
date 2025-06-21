const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
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
      enum: ["upcoming", "live", "started", "completed"],
      default: "upcoming",
    },
    countdownStartedAt: {
      type: Date,
      default: null,
    },
    currentPlayerOnBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    pauseAfterCurrentPlayer: {
      type: Boolean,
      default: false,
    },    
    currentBid: {
      team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      amount: { type: Number, default: 0 },
    },
    selectedTeams: [
      {
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: "Person", default: null },
        avatar: { type: String, default: null },
        rtmCount: { type: Number, default: 0 } 
      }
    ],    
    
    selectedPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    selectionMode: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },

    // For automatic mode filtering
    automaticFilter: {
      type: String,
      enum: ["All", "Batsman", "Fast all-rounder", "Spin all-rounder", "Wicket keeper batsman","Spin bowler","Fast bowler"],
      default: "All",
    },

    // For manual mode - pre-selected players queue
    manualPlayerQueue: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        position: { type: Number }, // 1, 2, 3, 4
      },
    ],

    // Track if bidding has been started (to prevent re-clicking start bidding)
    biddingStarted: {
      type: Boolean,
      default: false,
    },
    
    bidAmount: {
      player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      amount: { type: Number, default: 0 },
    },    

    // Current queue position for manual mode
    currentQueuePosition: {
      player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      type: Number,
      default: 0,
    },

    biddingHistory: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        bidAmount: Number,
        time: { type: Date, default: Date.now },
      },
    ], 
    
    pendingRTMRequest: {
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      playerName: { type: String },
      bidAmount: { type: Number },
      fromTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      requestedAt: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
