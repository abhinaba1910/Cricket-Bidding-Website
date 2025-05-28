const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../Utils/cloudinary");
const upload = multer({ storage });

const authMiddleware = require("../Auth/Authentication");
const Team = require("../Models/team");

// Create team route
// routes/team.js
router.post(
  "/create-team",
  authMiddleware,
  upload.single("logoFile"),
  async (req, res) => {
    try {
      const { teamName, shortName, purse } = req.body;
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
    const team = await Team.findById(req.params.id).lean();

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

router.put('/update-team/:id', authMiddleware, upload.single('logoFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, shortName, purse } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.createdBy.toString() !== userId)
      return res.status(403).json({ error: 'Unauthorized to update this team' });

    team.teamName = teamName || team.teamName;
    team.shortName = shortName || team.shortName;
    team.purse = purse || team.purse;

    if (req.file && req.file.path) {
      team.logoUrl = req.file.path;
    }

    await team.save();
    res.json({ message: 'Team updated successfully', team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update team' });
  }
});


module.exports = router;
