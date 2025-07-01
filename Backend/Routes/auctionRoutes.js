const express = require("express");
const router = express.Router();

const Auction = require("../Models/auction");
const AuthMiddleWare = require("../Auth/Authentication");
const multer = require("multer");
const { cloudinary, storage } = require("../Utils/cloudinary");
const upload = multer({ storage });

const Team = require("../Models/team");
const Player = require("../Models/player");
const Person = require("../Models/person");


router.post(
  "/create-auction",
  AuthMiddleWare,
  upload.single("auctionImage"),
  async (req, res) => {
    try {
      const {
        auctionName,
        shortName,
        description,
        selectedTeams,
        selectedPlayers,
        startDate,
        rtmCount,
      } = req.body;
      
      const parsedStartDate = new Date(startDate); // already in UTC from frontend
      

      const parsedRTMCount = parseInt(rtmCount) || 0;
      const parsedTeams = selectedTeams ? JSON.parse(selectedTeams) : [];
      const parsedPlayers = selectedPlayers ? JSON.parse(selectedPlayers) : [];

      const userId = req.user.id;
      const role = req.user.role;

      // const [hours, minutes] = startTimeRaw.split(":");
      // startDate.setUTCHours(Number(hours));
      // startDate.setUTCMinutes(Number(minutes));
      // startDate.setUTCSeconds(0);
      // startDate.setUTCMilliseconds(0);

      if (role !== "admin" && role !== "temp-admin") {
        return res.status(403).json({ error: "Access denied. Not authorized." });
      }

      const validTeams = await Team.find({ _id: { $in: parsedTeams }, createdBy: userId });
      const validPlayers = await Player.find({ _id: { $in: parsedPlayers }, createdBy: userId });

      if (validTeams.length !== parsedTeams.length || validPlayers.length !== parsedPlayers.length) {
        return res.status(403).json({ error: "Unauthorized selection of teams or players" });
      }

      const newAuction = new Auction({
        createdBy: userId,
        auctionName,
        shortName,
        auctionImage: req.file?.path || "",
        startDate,
        description,
        selectedTeams: parsedTeams.map(teamId => ({
          team: teamId,
          rtmCount: parsedRTMCount,
        })),
        selectedPlayers: parsedPlayers,
        pendingRTMRequest:null,
      });

      await newAuction.save();

      const io = req.app.get("io");
      io.emit("auction:update", {
        type: "auction-created",
        payload: newAuction,
      });

      return res.status(201).json({ message: "Auction created successfully", auction: newAuction });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error while creating auction" });
    }
  }
);


// Updated backend route with timer functionality
router.get("/get-auction", AuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Person.findById(userId);

    if (!user || !["admin", "temp-admin"].includes(user.role)) {
      return res.status(403).json({ error: "Access denied. Only admins or temp-admins allowed." });
    }

    const auctions = await Auction.find({ createdBy: userId })
      .populate("selectedTeams.team", "name logo")
      .populate("selectedPlayers", "name photo")
      .sort({ createdAt: -1 });

    const io = req.app.get("io");
    const now = new Date();

    // Process each auction to handle timer logic
    const processedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const startTime = new Date(auction.startDate);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window

        // If auction is upcoming and start time has passed
        if (auction.status === "upcoming" && now >= startTime) {
          // Start countdown if not already started
          if (!auction.countdownStartedAt) {
            auction.countdownStartedAt = startTime;
            await auction.save();

            // Emit timer started event
            io.to(auction._id.toString()).emit("auction:timer-started", {
              auctionId: auction._id,
              countdownStartedAt: auction.countdownStartedAt,
              endTime: endTime
            });
          }

          // Check if the 1-hour window has expired and auction hasn't started
          if (now >= endTime && auction.status === "upcoming") {
            auction.status = "completed";
            await auction.save();

            // Emit auction auto-completed event
            io.to(auction._id.toString()).emit("auction:auto-completed", {
              auctionId: auction._id,
              message: "Auction automatically completed - host didn't start in time"
            });
          }
        }

        return auction;
      })
    );

    const normalized = processedAuctions.map(a => ({
      id: a._id,
      name: a.auctionName,
      shortName: a.shortName,
      logo: a.auctionImage,
      description: a.description,
      startDate: a.startDate, // Full ISO string in UTC
      status: a.status,
      selectedTeams: a.selectedTeams,
      selectedPlayers: a.selectedPlayers,
      joinCode: a.shortName,
      createdAt: a.createdAt,
      countdownStartedAt: a.countdownStartedAt, // Include countdown start time
    }));

    res.json({ auctions: normalized });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ error: "Server error fetching auctions" });
  }
});

// Updated start auction route
router.patch("/start-auction/:id", AuthMiddleWare, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });

    const userId = req.user.id;
    const userRole = req.user.role;

    const isOwner = auction.createdBy.toString() === userId.toString();
    const isAdmin = ["admin", "temp-admin"].includes(userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You are not authorized to start this auction" });
    }

    if (auction.status !== "upcoming") {
      return res.status(400).json({ error: `Cannot start auction. Current status is '${auction.status}'.` });
    }

    const now = new Date();
    const startTime = new Date(auction.startDate);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window

    // Check if we're within the allowed time window
    if (now >= startTime && now <= endTime) {
      auction.status = "live";
      await auction.save();

      const io = req.app.get("io");
      io.to(req.params.id).emit("auction:update", {
        type: "auction-started",
        payload: { 
          status: auction.status,
          startedAt: now 
        },
      });

      return res.json({ message: "Auction started successfully", status: auction.status });
    } else if (now < startTime) {
      return res.status(400).json({ error: "Auction cannot be started yet. Too early." });
    } else {
      // Time window has expired, mark as completed
      auction.status = "completed";
      await auction.save();

      const io = req.app.get("io");
      io.to(req.params.id).emit("auction:auto-completed", {
        auctionId: req.params.id,
        message: "Auction window expired - cannot start anymore"
      });

      return res.status(400).json({ error: "Auction window has expired. Auction marked as completed." });
    }
  } catch (err) {
    console.error("Start auction error:", err);
    res.status(500).json({ error: "Server error starting auction" });
  }
});

// Add a new route to get timer status for a specific auction
router.get("/auction-timer/:id", AuthMiddleWare, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });

    const startTime = new Date(auction.startDate);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const now = new Date();

    const timerData = {
      auctionId: auction._id,
      status: auction.status,
      startDate: auction.startDate,
      countdownStartedAt: auction.countdownStartedAt,
      timeRemaining: auction.status === "upcoming" && auction.countdownStartedAt ? 
        Math.max(0, endTime.getTime() - now.getTime()) : 0,
      canStart: now >= startTime && now <= endTime && auction.status === "upcoming",
      hasExpired: now > endTime && auction.status === "upcoming"
    };

    res.json(timerData);
  } catch (error) {
    console.error("Error fetching timer data:", error);
    res.status(500).json({ error: "Server error fetching timer data" });
  }
});

//vinay working
router.get("/get-auction/:id", AuthMiddleWare, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const user = req.user;

    if (user.role !== "admin" && user.role !== "temp-admin") {
      return res.status(403).json({ message: "Access denied: Unauthorized role." });
    }

    const auction = await Auction.findById(auctionId)
      .populate({
        path: "selectedTeams.team",
        populate: {
          path: "players.player", // ✅ Populate players in each team
          model: "Player",
        },
      })
      .populate("selectedPlayers")
      .populate("currentPlayerOnBid")
      .populate("currentBid.team")
      .populate("biddingHistory.player")
      .populate("biddingHistory.team")
      .populate("manualPlayerQueue.player")
      .populate("selectedTeams.manager"); 

    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    if (auction.createdBy.toString() !== user.id) {
      return res.status(403).json({ message: "Access denied: Not the creator of this auction." });
    }

    // Filter available players
    const filteredPlayers = await Player.find({
      _id: { $in: auction.selectedPlayers },
      // availability: "Available",
      availability: { $in: ["Available", "Unsold"] },
    });

    // Last sold player
    const lastSold = auction.biddingHistory.length > 0
      ? auction.biddingHistory[auction.biddingHistory.length - 1]
      : null;

    // Most expensive player
    const mostExpensive = auction.biddingHistory.reduce((max, entry) => {
      return entry.bidAmount > (max?.bidAmount || 0) ? entry : max;
    }, null);

    // Map selectedTeams to flatten team data and include bought players
    const mappedTeams = auction.selectedTeams.map((entry) => {
      const team = entry.team;
      const purse = team?.purse ?? 0;
      const remaining = team?.remaining ?? 0;
      const manager = entry.manager;

      return {
        _id: team?._id,
        teamName: team?.teamName,
        shortName: team?.shortName,
        purse,
        remaining,
        totalSpent: purse - remaining,
        logoUrl: team?.logoUrl,
        manager: manager
          ? {
              _id: manager._id,
              name: manager.username,
              photo: manager.profilePic || "/manager-placeholder.jpg",
            }
          : null,
        avatar: entry.avatar,
        rtmCount: entry.rtmCount,
        boughtPlayers: (team?.players || []).map(p => ({
          playerId: p.player?._id,
          playerName: p.player?.name,
          playerImage: p.player?.image,
          price: p.price,
          role: p.player?.role,
          nationality: p.player?.nationality,
        }))
      };
    });

    return res.status(200).json({
      auctionId: auction._id,
      auctionName: auction.auctionName,
      shortName: auction.shortName,
      auctionImage: auction.auctionImage,
      description: auction.description,
      startDate: auction.startDate,
      status: auction.status,
      countdownStartedAt: auction.countdownStartedAt,
      isPaused: auction.isPaused,

      selectedTeams: mappedTeams,
      selectedPlayers: auction.selectedPlayers,
      savailablePlayers: filteredPlayers,

      currentPlayerOnBid: auction.currentPlayerOnBid || null,
      currentBid: auction.currentBid || null,
      lastSoldPlayer: lastSold || null,
      mostExpensivePlayer: mostExpensive || null,

      selectionMode: auction.selectionMode,
      automaticFilter: auction.automaticFilter,
      manualPlayerQueue: auction.manualPlayerQueue,
      biddingStarted: auction.biddingStarted,
      currentQueuePosition: auction.currentQueuePosition,
      bidAmount: auction.bidAmount,
      pendingRTMRequest: auction.pendingRTMRequest || null,
      autoBidEnabled: auction.autoBidEnabled || false,
  autoBidRange: auction.autoBidRange || 10000,
    });
  } catch (error) {
    console.error("Error fetching auction:", error);
    return res.status(500).json({ message: "Server error while fetching auction." });
  }
});


router.get("/get-auction-teams/:id", async (req, res) => {
  try {
    const auctionId = req.params.id;

    const auction = await Auction.findById(auctionId)
      .populate({
        path: "selectedTeams.team",
        populate: {
          path: "players.player",
          model: "Player",
        },
      })
      .populate("selectedTeams.manager"); // ✅ Populate manager info

    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    const mappedTeams = auction.selectedTeams.map((entry) => {
      const team = entry.team;
      const manager = entry.manager;

      return {
        _id: team?._id,
        teamName: team?.teamName,
        shortName: team?.shortName,
        purse: team?.purse ?? 0,
        remaining: team?.remaining ?? 0,
        totalSpent: (team?.purse ?? 0) - (team?.remaining ?? 0),
        logoUrl: team?.logoUrl,
        manager: manager
          ? {
              _id: manager._id,
              name: manager.username,
              photo: manager.profilePic || "/manager-placeholder.jpg",
            }
          : null,
        avatar: entry.avatar,
        rtmCount: entry.rtmCount,
        boughtPlayers: (team?.players || []).map((p) => ({
          playerId: p.player?._id,
          playerName: p.player?.name,
          playerImage: p.player?.image,
          price: p.price,
          role: p.player?.role,
          nationality: p.player?.nationality,
        })),
      };
    });

    return res.status(200).json({ selectedTeams: mappedTeams });
  } catch (err) {
    console.error("Error fetching auction teams:", err);
    res.status(500).json({ message: "Server error while fetching teams." });
  }
});



router.patch("/edit-auction/:id", AuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Person.findById(userId);

    if (!user || !["admin", "temp-admin"].includes(user.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const { id } = req.params;
    const { auctionName, selectedPlayers, selectedTeams } = req.body;

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // if(auction.isPaused===false){
    //   return res.status(404).json({error: "Pause the Auction before deleting"})
    // }

    // Update fields
    if (auctionName) auction.auctionName = auctionName;
    if (selectedPlayers) auction.selectedPlayers = selectedPlayers;

    if (selectedTeams && Array.isArray(selectedTeams)) {
      const existingTeamsMap = new Map();
      auction.selectedTeams.forEach((teamEntry) => {
        existingTeamsMap.set(String(teamEntry.team), teamEntry);
      });

      // Determine common RTM count from existing teams
      const existingRTMCounts = Array.from(existingTeamsMap.values()).map((t) => t.rtmCount);
      const defaultRTM = existingRTMCounts.length
        ? Math.round(existingRTMCounts.reduce((a, b) => a + b, 0) / existingRTMCounts.length)
        : 0;

      selectedTeams.forEach((newTeamObj) => {
        const teamIdStr = String(newTeamObj.team);
        if (!existingTeamsMap.has(teamIdStr)) {
          existingTeamsMap.set(teamIdStr, {
            team: newTeamObj.team,
            manager: newTeamObj.manager || null,
            avatar: newTeamObj.avatar || null,
            rtmCount: defaultRTM, // Inherit from others
          });
        }
      });

      auction.selectedTeams = Array.from(existingTeamsMap.values());
    }

    await auction.save();

    // res.json({ message: "Auction updated successfully.", auction });
    // ── PUSH updated auction details ───────────────────────
    const io = req.app.get("io");
    io.to(req.params.id).emit("auction:update", {
      type: "auction-edited",
      payload: { auction }
    }); 
    res.json({ message: "Auction updated successfully.", auction });
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


router.get("/get-all-auctions", AuthMiddleWare, async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("selectedPlayers", "name photo")
      .populate("selectedTeams", "name logo")
      .sort({ createdAt: -1 });

    const now = new Date();

    const processedAuctions = auctions.map((auction) => {
      const startDate = new Date(auction.startDate);

      // Convert to IST (Asia/Kolkata)
      const istDate = startDate.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      
      const istTime = startDate.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id: auction._id,
        name: auction.auctionName,
        shortName: auction.shortName,
        logo: auction.auctionImage,
        description: auction.description,
        date: istDate,
        time: istTime,
        status: auction.status,
        selectedTeams: auction.selectedTeams,
        selectedPlayers: auction.selectedPlayers,
        joinCode: auction.shortName,
        createdAt: auction.createdAt,
      };
    });

    res.json({ auctions: processedAuctions });
  } catch (err) {
    console.error("Error fetching all auctions:", err);
    res.status(500).json({ error: "Failed to fetch auctions." });
  }
});

router.post("/join-auction/:id", AuthMiddleWare, async (req, res) => {
  const { id } = req.params;
  const { joinCode } = req.body;
  const userId = req.user.id;

  try {
    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status !== "live") {
      return res.status(400).json({ message: "Auction is not live yet" });
    }

    if (auction.shortName !== joinCode) {
      return res.status(401).json({ message: "Invalid join code" });
    }

    const alreadyManager = auction.selectedTeams.find(
      (t) => t.manager?.toString() === userId
    );

    return res.status(200).json({
      message: "Successfully joined the auction",
      alreadyJoined: !!alreadyManager,
    });
  } catch (error) {
    console.error("Error joining auction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete('/delete-auction/:id', AuthMiddleWare, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    // if(auction.isPaused===false){
    //   return res.status(404).json({error: "Pause the Auction before deleting"})
    // }

    // Reset fields
    auction.currentPlayerOnBid = null;
    auction.currentBid = { team: null, amount: 0 };
    auction.selectedTeams = [];
    auction.selectedPlayers = [];
    auction.manualPlayerQueue = [];
    auction.biddingHistory = [];
    auction.bidAmount = { player: null, amount: 0 };
    
    // ✅ Fix currentQueuePosition separately
    if (auction.currentQueuePosition) {
      auction.currentQueuePosition.player = null;
      auction.currentQueuePosition.type = 0;
    }

    await auction.save(); // Ensure reset is saved

    await Auction.findByIdAndDelete(req.params.id); // Now delete
    res.status(204).end();
  } catch (err) {
    console.error("Delete Auction Error:", err);
    res.status(500).json({ error: "Failed to delete auction" });
  }
});


module.exports = router;
