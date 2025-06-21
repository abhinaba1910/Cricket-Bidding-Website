const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../Utils/cloudinary");
const upload = multer({ storage });
const Player = require("../Models/player");
const Person = require("../Models/person");
const Team = require("../Models/team");
const authMiddleware = require("../Auth/Authentication");
const parseNum = (val) => (val !== undefined ? parseFloat(val) || 0 : 0);
const parseStr = (val, fallback = "") => (val ? val.toString() : fallback);

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
        previousTeams,
        isCapped,
        bio,
      } = req.body;

      // Check for duplicate player name
      const existingPlayer = await Player.findOne({
        createdBy: userId,
        name: name.trim().toLowerCase(),
      });

      if (existingPlayer) {
        return res.status(409).json({
          error:
            "A player with this name already exists under your account. Please use a different name.",
        });
      }

      // Parse nested stats
      const stats = {
        batting: {
          matches: req.body["performanceStats.batting.matches"],
          runs: req.body["performanceStats.batting.runs"],
          highScore: req.body["performanceStats.batting.highScore"],
          average: req.body["performanceStats.batting.average"],
          strikeRate: req.body["performanceStats.batting.strikeRate"],
          centuries: req.body["performanceStats.batting.centuries"],
          fifties: req.body["performanceStats.batting.fifties"],
        },
        bowling: {
          matches: req.body["performanceStats.bowling.matches"],
          wickets: req.body["performanceStats.bowling.wickets"],
          bestBowling: req.body["performanceStats.bowling.bestBowling"],
          average: req.body["performanceStats.bowling.average"],
          economy: req.body["performanceStats.bowling.economy"],
          fiveWicketHauls: req.body["performanceStats.bowling.fiveWicketHauls"],
        },
        allRounder: {
          matches: req.body["performanceStats.allRounder.matches"],
          runs: req.body["performanceStats.allRounder.runs"],
          highScore: req.body["performanceStats.allRounder.highScore"],
          battingAverage: req.body["performanceStats.allRounder.battingAverage"],
          battingStrikeRate: req.body["performanceStats.allRounder.battingStrikeRate"],
          centuries: req.body["performanceStats.allRounder.centuries"],
          fifties: req.body["performanceStats.allRounder.fifties"],
          wickets: req.body["performanceStats.allRounder.wickets"],
          bestBowling: req.body["performanceStats.allRounder.bestBowling"],
          bowlingAverage: req.body["performanceStats.allRounder.bowlingAverage"],
          economy: req.body["performanceStats.allRounder.economy"],
          fiveWicketHauls: req.body["performanceStats.allRounder.fiveWicketHauls"],
        },
      };
      

      const player = new Player({
        name: name.trim(),
        country,
        dob,
        role,
        battingStyle,
        bowlingStyle,
        basePrice: parseNum(basePrice),
        grade,
        points: parseNum(points),
        availability,
        playerId,
        previousTeams,
        isCapped: isCapped === "true",
        bio,
        playerPic: req.file?.path || "",
        createdBy: userId,

        performanceStats: {
          batting: {
            matches: parseNum(stats?.batting?.matches),
            runs: parseNum(stats?.batting?.runs),
            highScore: parseNum(stats?.batting?.highScore),
            average: parseNum(stats?.batting?.average),
            strikeRate: parseNum(stats?.batting?.strikeRate),
            centuries: parseNum(stats?.batting?.centuries),
            fifties: parseNum(stats?.batting?.fifties),
          },
          bowling: {
            matches: parseNum(stats?.bowling?.matches),
            wickets: parseNum(stats?.bowling?.wickets),
            bestBowling: parseStr(stats?.bowling?.bestBowling, "0/0"),
            average: parseNum(stats?.bowling?.average),
            economy: parseNum(stats?.bowling?.economy),
            fiveWicketHauls: parseNum(stats?.bowling?.fiveWicketHauls),
          },
          allRounder: {
            matches: parseNum(stats?.allRounder?.matches),
            runs: parseNum(stats?.allRounder?.runs),
            highScore: parseNum(stats?.allRounder?.highScore),
            battingAverage: parseNum(stats?.allRounder?.battingAverage),
            battingStrikeRate: parseNum(stats?.allRounder?.battingStrikeRate),
            centuries: parseNum(stats?.allRounder?.centuries),
            fifties: parseNum(stats?.allRounder?.fifties),
            wickets: parseNum(stats?.allRounder?.wickets),
            bestBowling: parseStr(stats?.allRounder?.bestBowling, "0/0"),
            bowlingAverage: parseNum(stats?.allRounder?.bowlingAverage),
            economy: parseNum(stats?.allRounder?.economy),
            fiveWicketHauls: parseNum(stats?.allRounder?.fiveWicketHauls),
          },
        },
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
      const player = await Player.findById(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      if (player.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to edit this player" });
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
        isCapped: isCapped === "true",
        bio,
      };

      // ➕ Add performanceStats handling
      const parseStats = (prefix) => {
        const statKeys = Object.keys(req.body).filter((key) =>
          key.startsWith(`performanceStats.${prefix}.`)
        );
        if (statKeys.length === 0) return undefined;
        const result = {};
        statKeys.forEach((key) => {
          const shortKey = key.replace(`performanceStats.${prefix}.`, "");
          const val = req.body[key];
          result[shortKey] = isNaN(val) ? val : Number(val);
        });
        return result;
      };

      const battingStats = parseStats("batting");
      const bowlingStats = parseStats("bowling");
      const allRounderStats = parseStats("allRounder");

      updateFields.performanceStats = {};
      if (battingStats) updateFields.performanceStats.batting = battingStats;
      if (bowlingStats) updateFields.performanceStats.bowling = bowlingStats;
      if (allRounderStats) updateFields.performanceStats.allRounder = allRounderStats;

      // 📷 Handle image
      if (req.file?.path) {
        updateFields.playerPic = req.file.path;
      }

      const updated = await Player.findByIdAndUpdate(playerId, updateFields, {
        new: true,
      });

      res.json(updated);
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

router.post("/transfer-player/:playerId", authMiddleware, async (req, res) => {
  try {
    const { playerId } = req.params;
    const { teamId, price } = req.body;

    if (req.user.role !== "admin" && req.user.role !== "temp-admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: "Player not found" });
    
    if (player.availability === "Sold") {
      return res.status(400).json({ error: "Player is already sold to another team" });
    }

    if (String(player.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ error: "You can only transfer players you created." });
    }

    const team = await Team.findOne({
      _id: teamId,
      createdBy: req.user.id,
    });

    if (!team) return res.status(404).json({ error: "Team not found or unauthorized." });

    const transferPrice = price ?? player.basePrice ?? 0;

    // Initialize remaining amount if not set (for backward compatibility)
    if (team.remaining === undefined || team.remaining === null) {
      team.remaining = team.purse;
    }

    // Check if team has sufficient funds
    if (team.remaining < transferPrice) {
      return res.status(400).json({ 
        error: `Insufficient funds. Team has ₹${team.remaining} remaining, but transfer price is ₹${transferPrice}` 
      });
    }

    // Deduct transfer price from team's remaining amount
    team.remaining -= transferPrice;

    // Add player to team
    team.players.push({
      player: player._id,
      price: transferPrice,
    });

    await team.save();

    // Mark player as Sold
    player.availability = "Sold";
    await player.save();

    res.status(200).json({
      message: "Player transferred successfully",
      playerId: player._id,
      teamId: team._id,
      transferPrice,
      teamRemainingAmount: team.remaining,
    });

  } catch (err) {
    console.error("Direct transfer error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
