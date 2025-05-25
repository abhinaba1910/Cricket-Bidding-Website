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
    type: String, // URL from Cloudinary
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  selectedTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  selectedPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
