const mongoose = require("mongoose");

// const playerSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     country: { type: String, required: true },
//     dob: { type: Date, required: true },
//     role: { type: String, required: true },
//     battingStyle: { type: String },
//     bowlingStyle: { type: String },
//     basePrice: { type: Number, required: true },
//     grade: { type: String },
//     points: { type: Number },
//     availability: { type: String, enum: ["Available", "Sold", "Retained", "Unsold"] },
//     playerId: { type: String },
//     matchesPlayed: { type: Number },
//     runs: { type: Number },
//     wickets: { type: Number },
//     strikeRate: { type: Number },
//     previousTeams: { type: String },
//     isCapped: { type: Boolean, default: false },
//     bio: { type: String },
//     playerPic: { type: String},
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Person",
//       required: true,
//     },
//     isRTM: {type: Boolean, default: false},
//   },
//   {
//     timestamps: true,
//   }
// );



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
    availability: {
      type: String,
      enum: ["Available", "Sold", "Retained", "Unsold"],
    },
    playerId: { type: String },
    previousTeams: { type: String },
    isCapped: { type: Boolean, default: false },
    bio: { type: String },
    playerPic: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    isRTM: { type: Boolean, default: false },

    performanceStats: {
      batting: {
        matches: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        highScore: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
        strikeRate: { type: Number, default: 0 },
        centuries: { type: Number, default: 0 },
        fifties: { type: Number, default: 0 },
      },
      bowling: {
        matches: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        bestBowling: { type: String, default: "0/0" }, // Format like "5/24"
        average: { type: Number, default: 0 },
        economy: { type: Number, default: 0 },
        fiveWicketHauls: { type: Number, default: 0 },
      },
      allRounder: {
        matches: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        highScore: { type: Number, default: 0 },
        battingAverage: { type: Number, default: 0 },
        battingStrikeRate: { type: Number, default: 0 },
        centuries: { type: Number, default: 0 },
        fifties: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        bestBowling: { type: String, default: "0/0" },
        bowlingAverage: { type: Number, default: 0 },
        economy: { type: Number, default: 0 },
        fiveWicketHauls: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Player", playerSchema);
