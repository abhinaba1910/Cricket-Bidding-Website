const express = require('express');
const router = express.Router();
const Auction = require('../Models/auction');
const AuthMiddleWare=require("../Auth/Authentication");
const multer = require('multer');
const { cloudinary, storage } = require('../Utils/cloudinary');
const upload = multer({ storage });

const Team = require('../Models/team');
const Player = require('../Models/player');

router.post('/create-auction', AuthMiddleWare, upload.single('auctionImage'), async (req, res) => {
  try {
    const { auctionName, shortName, startDate, description, selectedTeams, selectedPlayers } = req.body;

    // Ensure array fields are parsed
    const parsedTeams = JSON.parse(selectedTeams);
    const parsedPlayers = JSON.parse(selectedPlayers);

    // Ensure all teams and players belong to the current user
    const userId = req.user.id;

    const validTeams = await Team.find({ _id: { $in: parsedTeams }, createdBy: userId });
    const validPlayers = await Player.find({ _id: { $in: parsedPlayers }, createdBy: userId });

    if (validTeams.length !== parsedTeams.length || validPlayers.length !== parsedPlayers.length) {
      return res.status(403).json({ error: 'Unauthorized selection of teams or players' });
    }

    const newAuction = new Auction({
      createdBy: userId,
      auctionName,
      shortName,
      auctionImage: req.file?.path || '', // From Cloudinary
      startDate,
      description,
      selectedTeams: parsedTeams,
      selectedPlayers: parsedPlayers,
    });

    await newAuction.save();
    res.status(201).json({ message: 'Auction created successfully', auction: newAuction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating auction' });
  }
});

module.exports = router;
