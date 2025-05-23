const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../Utils/cloudinary");
const upload = multer({ storage });

const Player = require("../Models/player");
const Person = require("../Models/person");
const authMiddleware = require("../Auth/Authentication");

router.post(
    "/create-player",
    authMiddleware,
    upload.single("playerPic"),
    async (req, res) => {
      try {
        const {
          name,
          basePrice,
          description,
          runs,
          wickets,
          fifties,
          hundreds,
          strikeRate,
        } = req.body;
  
        const userId = req.user.id;
  
        // Fetch the current user
        const user = await Person.findById(userId);
  
        // Allow only admin or temp-admin to add players
        if (!user || (user.role !== "admin" && user.role !== "temp-admin")) {
          return res
            .status(403)
            .json({ error: "Only admin or temp-admin can create players." });
        }
  
        // Create new player
        const player = new Player({
          name,
          playerPic: req.file.path,
          basePrice,
          description,
          runs,
          wickets,
          fifties,
          hundreds,
          strikeRate,
          createdBy: userId,
        });
  
        await player.save();
  
        res.status(201).json({ message: "Player created successfully.", player });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create player." });
      }
    }
  );

// GET /get-player (all players created by the logged-in user)
router.get("/get-player", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user to check role
    const user = await Person.findById(userId);

    if (!user || (user.role !== "admin" && user.role !== "temp-admin")) {
      return res
        .status(403)
        .json({
          error: "Access denied. Only admins and temp-admins can view players.",
        });
    }

    // Find players created by the current user
    const players = await Player.find({ createdBy: userId });

    res.status(200).json({ players });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch players." });
  }
});

module.exports = router;
