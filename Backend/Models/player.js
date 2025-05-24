const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true },
    dob: { type: Date, required: true },
    role: { type: String, required: true },
    battingStyle: { type: String },
    bowlingStyle: { type: String },
    basePrice: { type: Number, required: true },
    grade: { type: String },
    points: { type: Number },
    availability: { type: String, enum: ["Available", "Sold", "Retained"] },
    playerId: { type: String },
    matchesPlayed: { type: Number },
    runs: { type: Number },
    wickets: { type: Number },
    strikeRate: { type: Number },
    previousTeams: { type: String },
    isCapped: { type: Boolean, default: false },
    bio: { type: String },
    playerPic: { type: String},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Player", playerSchema);
