const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../Utils/cloudinary');
const upload = multer({ storage });

const Player = require('../Models/player');
const Person = require('../Models/person');
const authMiddleware = require('../Auth/Authentication');

// POST /create-player
router.post('/create-player', authMiddleware, upload.single('playerPic'), async (req, res) => {
  try {
    const { name, basePrice, description, runs, wickets, fifties, hundreds, strikeRate } = req.body;
    const userId = req.user.id;

    // Fetch the current user
    const user = await Person.findById(userId);

    // Optional: check for access code logic (you can adjust this based on your logic)
    if (!user.accessCode || user.accessCode !== process.env.UNIQUE_ACCESS_CODE) {
      return res.status(403).json({ error: 'You are not authorized to create players.' });
    }

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
      createdBy: userId
    });

    await player.save();

    res.status(201).json({ message: 'Player created successfully.', player });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create player.' });
  }
});

// GET /get-player (all players created by the logged-in user)
router.get('/get-player', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const players = await Player.find({ createdBy: userId });

    res.status(200).json({ players });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players.' });
  }
});

module.exports = router;
