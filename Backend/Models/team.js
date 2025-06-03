const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    required: true,
  },
  purse: {
    type: Number,
    required: true,
    min: 0,
  },
  remaining:{
    type:Number,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
  },
  players: [
    {
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      price: { type: Number, required: true },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
