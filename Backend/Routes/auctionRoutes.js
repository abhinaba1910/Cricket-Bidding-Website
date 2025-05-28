const express = require("express");
const router = express.Router();
const Auction = require("../Models/auction");
const AuthMiddleWare = require("../Auth/Authentication");
const multer = require("multer");
const { cloudinary, storage } = require("../Utils/cloudinary");
const upload = multer({ storage });

const Team = require("../Models/team");
const Player = require("../Models/player");
const Person =require("../Models/person");

router.post(
  "/create-auction",
  AuthMiddleWare,
  upload.single("auctionImage"),
  async (req, res) => {
    try {
      const {
        auctionName,
        shortName,
        startDate,
        description,
        selectedTeams,
        selectedPlayers,
      } = req.body;

      // Ensure array fields are parsed
      // const parsedTeams = JSON.parse(selectedTeams);
      // const parsedPlayers = JSON.parse(selectedPlayers);

      const parsedTeams = selectedTeams ? JSON.parse(selectedTeams) : [];
      const parsedPlayers = selectedPlayers ? JSON.parse(selectedPlayers) : [];

      // Ensure all teams and players belong to the current user
      const userId = req.user.id;
      const role=req.user.role;

      if (role !== 'admin' && role !== 'temp-admin') {
        return res.status(403).json({ error: 'Access denied. Not authorized.' });
      }

      const validTeams = await Team.find({
        _id: { $in: parsedTeams },
        createdBy: userId,
      });
      const validPlayers = await Player.find({
        _id: { $in: parsedPlayers },
        createdBy: userId,
      });

      if (
        validTeams.length !== parsedTeams.length ||
        validPlayers.length !== parsedPlayers.length
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized selection of teams or players" });
      }

      const newAuction = new Auction({
        createdBy: userId,
        auctionName,
        shortName,
        auctionImage: req.file?.path || "", // From Cloudinary
        startDate,
        description,
        selectedTeams: parsedTeams,
        selectedPlayers: parsedPlayers,
      });

      console.log(newAuction);
      await newAuction.save();
      res
        .status(201)
        .json({ message: "Auction created successfully", auction: newAuction });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error while creating auction" });
    }
  }
);



router.get('/get-auction', AuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Person.findById(userId);

    if (!user || !['admin', 'temp-admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. Only admins or temp-admins allowed.' });
    }

    const auctions = await Auction.find({ createdBy: userId })
      .populate('selectedTeams', 'name logo')
      .populate('selectedPlayers', 'name photo')
      .sort({ createdAt: -1 });

    const normalizedAuctions = auctions.map(a => {
      const start = new Date(a.startDate);
      const date = start.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      const time = start.toTimeString().split(':').slice(0, 2).join(':'); // 'HH:mm'

      return {
        id: a._id,
        name: a.auctionName || '',
        shortName: a.shortName || '',
        logo: a.auctionImage || '',
        description: a.description || '',
        date,
        time,
        selectedTeams: a.selectedTeams || [],
        selectedPlayers: a.selectedPlayers || [],
        joinCode: a.shortName || '', // You can rename this if needed
        createdAt: a.createdAt,
      };
    });

    res.json({ auctions: normalizedAuctions });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Server error fetching auctions' });
  }
});



router.get('/get-all-auctions', AuthMiddleWare, async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('selectedPlayers')
      .populate('selectedTeams')
      .sort({ startDate: -1 });

    const now = new Date();

    const processedAuctions = auctions.map(auction => {
      const playerCount = auction.selectedPlayers.length;
      const teamCount = auction.selectedTeams.length;

      const auctionDate = new Date(auction.startDate);
      const auctionDateOnly = new Date(auctionDate.toDateString());
      const nowDateOnly = new Date(now.toDateString());

      let status = '';
      if (auctionDateOnly > nowDateOnly) {
        status = 'upcoming';
      } else if (auctionDateOnly.getTime() === nowDateOnly.getTime()) {
        status = 'live';
      } else {
        status = 'completed';
      }

      return {
        id: auction._id,
        name: auction.auctionName,
        logo: auction.auctionImage,
        date: auctionDate.toISOString().split('T')[0],
        time: auctionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        players: playerCount,
        teams: teamCount,
        // joinCode: auction.shortName,
        status
      };
    });

    res.json({ auctions: processedAuctions });
  } catch (err) {
    console.error('Error fetching all auctions:', err);
    res.status(500).json({ error: 'Failed to fetch auctions.' });
  }
});


module.exports = router;
