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

      // Check for duplicate player name for the same user
      const existingPlayer = await Player.findOne({
        createdBy: userId,
        name: name.trim().toLowerCase(),
      });

      if (existingPlayer) {
        return res.status(409).json({
          error: "A player with this name already exists under your account. Please use a different name.",
        });
      }

      // const player = new Player({
      //   name: name.trim(),
      //   country,
      //   dob,
      //   role,
      //   battingStyle,
      //   bowlingStyle,
      //   basePrice,
      //   grade,
      //   points,
      //   availability,
      //   playerId,
      //   matchesPlayed,
      //   runs,
      //   wickets,
      //   strikeRate,
      //   previousTeams,
      //   isCapped: isCapped === "true", // convert checkbox string to boolean
      //   bio,
      //   playerPic: req.file?.path || "",
      //   createdBy: userId,
      // });


      const player = new Player({
        name: name.trim(),
        country,
        dob,
        role,
        battingStyle,
        bowlingStyle,
        basePrice: parseFloat(basePrice) || 0,
        grade,
        points: parseFloat(points) || 0,
        availability,
        playerId,
        matchesPlayed: parseInt(matchesPlayed) || 0,
        runs: parseInt(runs) || 0,
        wickets: parseInt(wickets) || 0,
        strikeRate: parseFloat(strikeRate) || 0,
        previousTeams,
        isCapped: isCapped === "true",
        bio,
        playerPic: req.file?.path || "",
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

router.get("/get-player/available", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Person.findById(userId);

    if (!user || (user.role !== "admin" && user.role !== "temp-admin")) {
      return res.status(403).json({
        error: "Access denied. Only admins and temp-admins can view players.",
      });
    }

    const players = await Player.find({
      createdBy: userId,
      availability: { $in: ["Available", "Unsold"] },
    }).sort({ createdAt: -1 });

    res.status(200).json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch players." });
  }
});






// GET /get-player/:id
router.get('/get-player/:id', authMiddleware, async (req, res) => {
  try {
    // Only allow admins and temp-admins to view specific player
    // if (req.user.role !== 'admin' && req.user.role !== 'temp-admin') {
    //   return res.status(403).json({ error: 'Access denied. Only admins can view player details.' });
    // }

    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    res.status(200).json(player);
  } catch (err) {
    console.error('Error fetching player:', err);
    res.status(500).json({ error: 'Server error while fetching player.' });
  }
});


router.put(
  "/update-player/:id",
  authMiddleware,
  upload.single("photoFile"),
  async (req, res) => {
    try {
      const playerId = req.params.id;

      // Validate player existence
      const player = await Player.findById(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Only allow the creator (admin or temp-admin) to update
      if (player.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to edit this player" });
      }

      // Build update object
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
        playerId: customPlayerId,
        matchesPlayed,
        runs,
        wickets,
        strikeRate,
        previousTeams,
        isCapped,
        bio,
      } = req.body;

      const updateFields = {
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
        playerId: customPlayerId,
        matchesPlayed,
        runs,
        wickets,
        strikeRate,
        previousTeams,
        isCapped: isCapped === "true", // convert from string
        bio,
      };

      // Handle new photo upload
      if (req.file && req.file.path) {
        updateFields.playerPic = req.file.path;
      }

      const updatedPlayer = await Player.findByIdAndUpdate(playerId, updateFields, {
        new: true,
      });

      res.json(updatedPlayer);
    } catch (err) {
      console.error("Update player error:", err);
      res.status(500).json({ error: "Server error while updating player" });
    }
  }
);


router.delete('/delete-player/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Player.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.status(204).end(); // No content
  } catch (err) {
    console.error("Error deleting player:", err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;
