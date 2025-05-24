const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../Utils/cloudinary");
const upload = multer({ storage });

const Player = require("../Models/player");
const Person = require("../Models/person");
const authMiddleware = require("../Auth/Authentication");

router.post(
  "/add-player",
  authMiddleware,
  upload.single("photoFile"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await Person.findById(userId);
      if (!user || (user.role !== "admin" && user.role !== "temp-admin")) {
        return res.status(403).json({
          error: "Only admin or temp-admin can create players.",
        });
      }

      const {
        name,
        country,
        dob,
        role,
        battingStyle,
        bowlingStyle,
        basePrice,
        grade,
        points,
        availability,
        playerId,
        matchesPlayed,
        runs,
        wickets,
        strikeRate,
        previousTeams,
        isCapped,
        bio,
      } = req.body;

      const player = new Player({
        name,
        country,
        dob,
        role,
        battingStyle,
        bowlingStyle,
        basePrice,
        grade,
        points,
        availability,
        playerId,
        matchesPlayed,
        runs,
        wickets,
        strikeRate,
        previousTeams,
        isCapped: isCapped === "true", // HTML form checkboxes return strings
        bio,
        playerPic: req.file?.path || "", // Make sure multer sends this
        createdBy: userId,
      });

      await player.save();

      res.status(201).json({ message: "Player created successfully", player });
    } catch (err) {
      console.error("Add player error:", err);
      res.status(500).json({ error: "Failed to create player." });
    }
  }
);

// GET /get-player (all players created by the logged-in user)
router.get("/get-player", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Person.findById(userId);

    if (!user || (user.role !== "admin" && user.role !== "temp-admin")) {
      return res.status(403).json({
        error: "Access denied. Only admins and temp-admins can view players.",
      });
    }

    const players = await Player.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.status(200).json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch players." });
  }
});

module.exports = router;
