const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../Utils/cloudinary");
const upload = multer({ storage });

const authMiddleware = require("../Auth/Authentication");
const Team = require("../Models/team");
const Player=require("../Models/player");
const Auction =require("../Models/auction");

// Create team route
// routes/team.js
router.post(
  "/create-team",
  authMiddleware,
  upload.single("logoFile"),
  async (req, res) => {
    try {
      const { teamName, shortName, purse ,manager} = req.body;
      const logoUrl = req.file?.path;

      // Check for missing fields
      if (!teamName || !shortName || !purse || !logoUrl) {
        return res
          .status(400)
          .json({ error: "All fields are required including the logo." });
      }

      // Role-based access control
      if (req.user.role !== "admin" && req.user.role !== "temp-admin") {
        return res
          .status(403)
          .json({ error: "You do not have permission to create teams." });
      }

      // Check for duplicate team name or short name for same user
      const existingTeam = await Team.findOne({
        createdBy: req.user.id,
        $or: [
          { teamName: teamName.trim() },
          { shortName: shortName.trim().toUpperCase() },
        ],
      });

      if (existingTeam) {
        return res.status(409).json({
          error:
            "A team with the same name or short name already exists under your account. Please choose a different team.",
        });
      }

      // Create team
      const newTeam = new Team({
        teamName: teamName.trim(),
        shortName: shortName.trim().toUpperCase(),
        logoUrl,
        purse,
        manager: manager?.trim() || null,
        remaining:purse,
        createdBy: req.user.id,
      });

      await newTeam.save();
      res
        .status(201)
        .json({ message: "Team created successfully.", team: newTeam });
    } catch (err) {
      console.error("Create team error:", err);
      res
        .status(500)
        .json({ error: "Something went wrong while creating the team." });
    }
  }
);

router.get("/get-teams", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "temp-admin") {
      return res
        .status(403)
        .json({ error: "You do not have permission to create teams." });
    }

    const teams = await Team.find({ createdBy: req.user.id });
    res.status(200).json(teams);
  } catch (err) {
    console.error("Fetch teams error:", err);
    res.status(500).json({ error: "Failed to fetch teams." });
  }
});

router.get("/get-team/:id", authMiddleware, async (req, res) => {
  try {
    // const team = await Team.findById(req.params.id).lean();
    const team = await Team.findById(req.params.id)
      .populate("players.player") // populate player info
      .lean();

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Server error while fetching team" });
  }
});


router.put(
  "/update-team/:id",
  authMiddleware,
  upload.single("logoFile"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        teamName,
        shortName,
        purse,
        manager,
        retainedPlayers, // [{playerId, price}]
        releasedPlayers, // [playerId]
      } = req.body;
      const userId = req.user.id;

      const team = await Team.findById(id);
      if (!team) return res.status(404).json({ error: "Team not found" });
      if (team.createdBy.toString() !== userId)
        return res.status(403).json({ error: "Unauthorized to update this team" });

      // Basic updates
      team.teamName = teamName || team.teamName;
      team.shortName = shortName || team.shortName;
      team.purse = purse || team.purse;

      // Handle logo update
      if (req.file && req.file.path) {
        team.logoUrl = req.file.path;
      }
      if (manager !== undefined) {
        team.manager = manager?.trim() || null;
      }

      // Parse if sent as JSON strings
      const retained = typeof retainedPlayers === 'string' ? JSON.parse(retainedPlayers) : retainedPlayers || [];
      const released = typeof releasedPlayers === 'string' ? JSON.parse(releasedPlayers) : releasedPlayers || [];

      // Process released players
      for (const playerId of released) {
        team.players = team.players.filter(p => p.player.toString() !== playerId);
        await Player.findByIdAndUpdate(playerId, { availability: "Available" ,isRTM: false});
        await Team.findByIdAndDelete(playerId)
      }

      // Process retained players
      for (const { playerId, price } of retained) {
        const existing = team.players.find(p => p.player.toString() === playerId);
        if (!existing) {
          team.players.push({ player: playerId, price });
        } else {
          existing.price = price;
        }

        await Player.findByIdAndUpdate(playerId, { availability: "Retained" });
        team.purse -= price;
      }

      team.remaining = team.purse;
      await team.save();
      res.json({ message: "Team updated with players", team });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update team" });
    }
  }
);

// routes/teams.js (Express example)
router.delete('/delete-team/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id).populate('players.player');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Authorization check
    if (
      !['admin', 'temp-admin'].includes(req.user.role) ||
      team.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: 'Unauthorized to delete this team' });
    }

    // Step 1: Mark all players as Available
    for (const { player } of team.players) {
      if (player) {
        await Player.findByIdAndUpdate(player._id, { availability: 'Available' });
      }
    }

    // Step 2: Remove the full subdocument from selectedTeams in all auctions
    const auctions = await Auction.find({ 'selectedTeams.team': team._id });

    for (const auction of auctions) {
      auction.selectedTeams = auction.selectedTeams.filter(
        (entry) => entry.team.toString() !== team._id.toString()
      );
      await auction.save();
    }

    // Step 3: Delete the team
    await Team.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Team deleted, players released, and all auction references removed.',
    });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: 'Server error while deleting team' });
  }
});



module.exports = router;
