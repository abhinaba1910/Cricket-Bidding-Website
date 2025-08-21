import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import BidButton from "../../components/ui/BidButton";
import CharacterCard from "../characters/CharacterCard";
import { formatIndianNumber } from "../../types/formatIndianNumber";
import toast from "react-hot-toast";
import { FaUserTie, FaUsers } from "react-icons/fa";
import { GiMoneyStack, GiCardRandom } from "react-icons/gi";
import Api from "../../userManagement/Api";
import { io } from "socket.io-client";
import { ArrowLeft } from "lucide-react";
import { IoIosHelpCircle } from "react-icons/io";
import confetti from "canvas-confetti";
// ─── Shared “CriteriaTable” for Desktop ────────────────────────────
// Bid paddle animation variants (unchanged)
const paddleVariants = {
  rest: {
    rotate: -15,
    y: 0,
    transition: { type: "spring", stiffness: 300 },
  },
  hit: {
    rotate: [-15, -50, -15],
    y: [0, -30, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.3, 1],
      ease: "easeInOut",
    },
  },
};

const DesktopTeamCard = ({ team }) => {
  if (!team) return null;

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-800/40 to-blue-700/40 rounded-lg p-4 w-72 h-40 max-w-xs shadow-md border border-indigo-600/20 flex flex-col justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", delay: 0.2 }}
    >
      {/* ─── HEADER ─── */}
      <div className="flex items-center space-x-3">
        {/* Logo */}
        <motion.div
          className="rounded-lg bg-gradient-to-br from-indigo-700 to-blue-800 w-14 h-14 flex items-center justify-center overflow-hidden border border-cyan-400/30"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt="Team Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <FaUserTie className="text-xl text-white opacity-75" />
          )}
        </motion.div>

        {/* Name & Manager */}
        <div className="flex-1 text-left">
          <h3 className="text-lg font-semibold text-white truncate">
            {team.teamName || "Unnamed Team"}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            Manager:{" "}
            <span className="font-medium">{team.manager?.username}</span>
          </p>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="flex justify-between text-xs text-white">
        <div className="flex flex-col items-center">
          <GiMoneyStack className="text-sm mb-0.5" />
          <span className="font-medium">
            {team.purse != null ? `₹${formatIndianNumber(team.purse)}` : "--"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <GiMoneyStack className="text-sm mb-0.5" />
          <span className="font-medium">
            {team.remaining != null
              ? `₹${formatIndianNumber(team.remaining)}`
              : "--"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <FaUsers className="text-sm mb-0.5" />
          <span className="font-medium">{team.playersBought?.length || 0}</span>
        </div>
        <div className="flex flex-col items-center">
          <GiCardRandom className="text-sm mb-0.5" />
          <span className="font-medium">{team.rtmCount || 0}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function UserBiddingDashboardDesktop() {
  const navigate = useNavigate();
  const { id } = useParams(); // auctionId
  const [fullScreen, setFullScreen] = useState(false);
  const [isBidding, setIsBidding] = useState(false);

  const [emoteToPlay, setEmoteToPlay] = useState();
  const [lastSoldTeam, setLastSoldTeam] = useState(null);
  const [rtmCount, setRtmCount] = useState(0);
  const toggleFullScreen = () => setFullScreen((fs) => !fs);
  const [userTeamId, setUserTeamId] = useState(null);
  const userTeamIdRef = useRef(null);
  const emoteTimeoutRef = useRef(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [rtmRequestPending, setRtmRequestPending] = useState(false);

  useEffect(() => {
    const keepWarm = () => {
      fetch(
        "https://cricket-bidding-website-production.up.railway.app/health"
        // "http://localhost:6001/health"
      ).catch((err) => console.log("Ping failed:", err));
    };

    // Ping immediately on load
    keepWarm();

    // Ping every 10 minutes
    const interval = setInterval(keepWarm, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // ─── Sample Auction Data for initialization ────────────────────
  const sampleAuction = {
    lastSold: { name: "--/--", price: "--/--", team: "--/--" },
    mostExpensive: { name: "--/--", price: "--/--", team: "--/--" },
    currentLot: {
      id: null,
      name: "--/--",
      role: "--/--",
      batting: "--/--",
      bowling: "--/--",
      basePrice: "--/--",
      avatarUrl: null,
    },
    currentBid: {
      amount: "--/--",
      team: "--/--",
      teamLogo: null,
    },
    purseBalance: "--/--",
    tableNumbers: {
      foreign: {
        Batsman: 0,
        Bowler: 0,
        "All-Rounder": 0,
        "Wicket-Keeper": 0,
      },
      indian: {
        Batsman: 0,
        Bowler: 0,
        "All-Rounder": 0,
        "Wicket-Keeper": 0,
      },
    },
    adminImageUrl: null,
    team: null, // will fill from API
    biddingHistory: [],
    lastSoldPlayer: null,
    mostExpensivePlayer: null,
    currentPlayer: null,
    bidAmount: null,
  };
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState(null);
  const [timerData, setTimerData] = useState({
    isActive: false,
    remainingTime: 0,
    startedAt: null,
    expiresAt: null,
    duration: 20000,
  });

  const [isBidDisabled, setIsBidDisabled] = useState(false);
  const timerIntervalRef = useRef(null);

  // 2. Timer calculation function
  const calculateRemainingTime = (expiresAt) => {
    if (!expiresAt) return 0;
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const remaining = Math.max(0, expires - now);
    return Math.ceil(remaining / 1000); // Convert to seconds
  };

  // Function to check ban status
  const checkBanStatus = async () => {
    try {
      const teamId = auctionData?.team?.teamId;
      if (!teamId || !id) return;

      const response = await Api.get(`/ban-status/${id}/${teamId}`);

      if (response.data.isBanned) {
        setIsBanned(true);
        setBanInfo(response.data);
      } else {
        setIsBanned(false);
        setBanInfo(null);
      }
    } catch (error) {
      console.error("Error checking ban status:", error);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Auction data state
  const [auctionData, setAuctionData] = useState(sampleAuction);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState(null);

  // Socket ref
  const socketRef = useRef(null);
  useEffect(() => {
    userTeamIdRef.current = userTeamId;
  }, [userTeamId]);

  // Fetch function to get bidding-portal data
  const fetchAuctionData = async () => {
    try {
      const response = await Api.get(`/bidding-portal/${id}`);
      const data = response.data;
      console.log("Fetched Auction Data:", data);

      // Update state
      setAuctionData(data);
      if (data.status === "completed") {
        navigate("/dashboard");
      }

      // Set userTeamId from response
      if (data.team && (data.team.teamId || data.team._id)) {
        // Adjust depending on actual field name: teamId or _id
        const tid = data.team.teamId ?? data.team._id;
        setUserTeamId(tid);
      }

      // Avatar processing
      if (data.team?.avatar) {
        const raw = data.team.avatar;
        const idx = raw.indexOf("/models");
        const publicPath = idx >= 0 ? raw.slice(idx) : raw;
        setAvatarUrl(publicPath);
      } else {
        setAvatarUrl(null);
      }
      // Sync RTM pending status if applicable
      if (
        data.pendingRTMRequest &&
        data.pendingRTMRequest.teamId === userTeamIdRef.current
      ) {
        setRtmRequestPending(true);
      } else {
        setRtmRequestPending(false);
      }

      // RTM count
      setRtmCount(data.team?.rtmCount || 0);

      const formatPlayerData = (entry) => {
        if (!entry || !entry.player)
          return { name: "--/--", price: "--/--", team: "--/--" };

        return {
          name: entry.player.name || "--/--",
          price: entry.bidAmount || "--/--",
          team: entry.team?.shortName || "--/--",
        };
      };

      setAuctionData((prev) => ({
        ...prev,
        lastSold: formatPlayerData(data.lastSoldPlayer),
        mostExpensive: formatPlayerData(data.mostExpensivePlayer),
        // currentLot, currentBid, etc. assumed inside data.currentPlayer, data.currentBid
      }));
    } catch (error) {
      console.error("Error fetching auction data:", error);
      toast.error("Error fetching auction data");
      setError(error);
    }
  };

  const openPlayerModal = () => {
    const p = auctionData.currentPlayer;
    if (p) {
      const stats = p.performanceStats || {};
      const batting = stats.batting || {};
      const bowling = stats.bowling || {};
      const allRounder = stats.allRounder || {};

      const formattedPlayer = {
        name: p.name,
        role: p.role,
        battingStyle: p.battingStyle,
        bowlingStyle: p.bowlingStyle,
        basePrice: p.basePrice,
        playerPic: p.playerPic,
        nationality: p.country,
        age: p.dob
          ? new Date().getFullYear() - new Date(p.dob).getFullYear()
          : "--",
        performanceStats: {
          batting: {
            matches: batting.matches ?? "--",
            runs: batting.runs ?? "--",
            highScore: batting.highScore ?? "--",
            average: batting.average ?? "--",
            strikeRate: batting.strikeRate ?? "--",
            centuries: batting.centuries ?? "--",
            fifties: batting.fifties ?? "--",
          },
          bowling: {
            matches: bowling.matches ?? "--",
            wickets: bowling.wickets ?? "--",
            bestBowling: bowling.bestBowling ?? "--",
            average: bowling.average ?? "--",
            economy: bowling.economy ?? "--",
            fiveWicketHauls: bowling.fiveWicketHauls ?? "--",
          },
          allRounder: {
            matches: allRounder.matches ?? "--",
            runs: allRounder.runs ?? "--",
            highScore: allRounder.highScore ?? "--",
            battingAverage: allRounder.battingAverage ?? "--",
            battingStrikeRate: allRounder.battingStrikeRate ?? "--",
            centuries: allRounder.centuries ?? "--",
            fifties: allRounder.fifties ?? "--",
            wickets: allRounder.wickets ?? "--",
            bestBowling: allRounder.bestBowling ?? "--",
            bowlingAverage: allRounder.bowlingAverage ?? "--",
            economy: allRounder.economy ?? "--",
            fiveWicketHauls: allRounder.fiveWicketHauls ?? "--",
          },
        },
      };
      setSelectedPlayer(formattedPlayer);
      setShowModal(true);
    }
  };

  const closePlayerModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

  const handleBid = async () => {
    const playerId = auctionData?.currentPlayer?._id;
    const teamId = auctionData?.team?.teamId;
    const visibleBid = auctionData?.bidAmount?.amount || auctionData?.bidAmount; // Handle both cases

    if (!playerId || !teamId) {
      toast.error("Missing team or player information.");
      return;
    }
    if (!visibleBid || visibleBid <= 0) {
      toast.error("Invalid bid amount.");
      return;
    }

    // Check if bidding is disabled due to timer
    if (isBidDisabled) {
      toast.error(
        "Bidding is disabled. Timer has expired or wait for price update."
      );
      return;
    }

    // Check if team is banned
    if (isBanned) {
      toast.error(
        `Your team is banned from bidding. Please wait ${
          banInfo?.remainingMinutes || 0
        } minutes.`
      );
      return;
    }

    // Prevent multiple simultaneous clicks
    if (isBidding) {
      return;
    }

    const payload = {
      playerId,
      teamId,
      bidAmount: visibleBid,
    };

    try {
      setIsBidding(true);
      await Api.post(`/place-bid/${id}`, payload);
      toast.success("Bid Placed Successfully");
      fetchAuctionData();
      setEmoteToPlay("HandRaise");
      setTimeout(() => setEmoteToPlay(null), 2000);
    } catch (error) {
      console.error("Failed to place bid:", error);
      const errorMessage = error.response?.data?.error || "Failed to place bid";

      // Handle different error types
      if (error.response?.status === 429) {
        // Team is banned
        const banData = error.response.data;
        setIsBanned(true);
        setBanInfo({
          remainingMinutes: Math.ceil(
            (banData.bannedUntil - Date.now()) / 60000
          ),
          bannedUntil: banData.bannedUntil,
        });
        toast.success(errorMessage, { duration: 5000 });
      } else if (error.response?.status === 409) {
        // Race condition
        toast.custom("Someone else just placed a bid. Refreshing...");
        fetchAuctionData();
      } else if (error.response?.data?.timerExpired) {
        // Timer expired
        toast.error("Timer has expired. Wait for the next bid amount update.");
        setIsBidDisabled(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsBidding(false);
    }
  };

  useEffect(() => {
    if (showCelebration) {
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [showCelebration]);

  // Desktop Version: Enhanced Socket Setup with Fixed RTM Handlers
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token; skipping socket connect");
      return;
    }

    const socket = io(
      "https://cricket-bidding-website-production.up.railway.app",
      {
    // const socket = io("http://localhost:6001", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected (user bidding desktop):", socket.id);
      if (id) {
        socket.emit("join-auction", id);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("player:sold", (payload) => {
      console.log("Received player:sold", payload);
      const winnerId = payload.soldTo;
      const teamId = userTeamIdRef.current;

      if (teamId && winnerId) {
        if (winnerId === teamId) {
          setEmoteToPlay("BidWon");
          setShowCelebration(true); // 🎉 Start celebration
        } else {
          setEmoteToPlay("LostBid");
          setShowCelebration(false); // 🛑 No celebration
        }

        // Reset emote after 3 seconds
        if (emoteTimeoutRef.current) {
          clearTimeout(emoteTimeoutRef.current);
        }

        emoteTimeoutRef.current = setTimeout(() => {
          setEmoteToPlay(null);
          setShowCelebration(false);
          emoteTimeoutRef.current = null;
        }, 3000);
      }

      fetchAuctionData();

      if (payload.amount != null) {
        toast.success(`Sold for ₹${formatIndianNumber(payload.amount)}`);
      } else {
        toast.success("Player sold");
      }
    });

    socket.on("player:unsold", (payload) => {
      console.log("[USER] Received player:unsold", payload);
      const {
        nextPlayer,
        currentQueuePosition: newPos,
        totalQueueLength,
        isPaused: pausedFlag,
      } = payload;

      // setIsPaused(pausedFlag);

      if (nextPlayer) {
        fetchAuctionData(); // Refresh to show new player
      } else {
        setAuctionData((prev) => ({
          ...prev,
          currentPlayer: null,
          currentBid: {
            amount: 0,
            team: null,
            teamLogo: null,
          },
        }));
        toast.info("No more players in the queue.");
      }

      setCurrentQueuePosition(newPos);
      setQueueDisplay({
        current: newPos + 1,
        total: totalQueueLength,
      });
      fetchAuctionData();
    });

    // Bid events

    socket.on("bid:updated", (payload) => {
      console.log("bid:updated", payload);
      fetchAuctionData();
      toast.success(
        `Bid Amount Updated To ₹${formatIndianNumber(
          payload.newBid.amount
        )} You can Bid Now`
      );
    });

    // socket.on("bid:placed", (payload) => {
    //   console.log("bid:placed", payload);

    //   clearTimeout(window.auctionDataTimeout);
    //   window.auctionDataTimeout = setTimeout(() => {
    //     fetchAuctionData();
    //   }, 100);

    //   toast.success(`New bid ₹${formatIndianNumber(payload.newBid.amount)}`);
    // });

    socket.on("bid:placed", (payload) => {
      console.log("bid:placed", payload);
      clearTimeout(window.auctionDataTimeout);
      window.auctionDataTimeout = setTimeout(() => {
        fetchAuctionData();
      }, 100);
      toast.success(`New bid ₹${formatIndianNumber(payload.newBid.amount)}`);
    });

    // socket.on("timer:update", (payload) => {
    //   console.log("timer:update", payload);

    //   if (payload.auctionId === id) {
    //     const remainingTime = calculateRemainingTime(payload.timerExpiredAt);

    //     setTimerData({
    //       isActive: payload.isTimerActive,
    //       remainingTime,
    //       startedAt: payload.timerStartedAt,
    //       expiresAt: payload.timerExpiredAt,
    //       duration: payload.duration,
    //     });

    //     if (payload.resetTimer) {
    //       toast.success(`Timer Reset - ${remainingTime} seconds remaining`);
    //     }
    //   }
    // });

    socket.on("timer:update", (payload) => {
      console.log("timer:update", payload);
      if (payload.auctionId === id) {
        const remainingTime = calculateRemainingTime(payload.timerExpiredAt);
        setTimerData({
          isActive: payload.isTimerActive,
          remainingTime,
          startedAt: payload.timerStartedAt,
          expiresAt: payload.timerExpiredAt,
          duration: payload.duration,
        });
        if (payload.resetTimer) {
          toast.success(`Timer Reset - ${remainingTime} seconds remaining`);
        }
      }
    });

    socket.on("player:rtm", (payload) => {
      console.log("player:rtm", payload);
      fetchAuctionData();
      toast.success("RTM used");
    });

    // ENHANCED: RTM request confirmations
    socket.on("rtm:request", (payload) => {
      console.log("=== RTM REQUEST DEBUG (Desktop) ===");
      console.log("Full payload:", payload);
      console.log("Payload teamId:", payload.teamId);
      console.log("userTeamIdRef.current:", userTeamIdRef.current);
      console.log("auctionData?.team?.teamId:", auctionData?.team?.teamId);

      // Get current team ID with fallbacks
      const currentTeamId = userTeamIdRef.current || auctionData?.team?.teamId;

      // Compare team IDs (handle both string and ObjectId)
      const isMyTeamRequest =
        payload.teamId === currentTeamId ||
        payload.teamId === String(currentTeamId) ||
        String(payload.teamId) === String(currentTeamId);

      console.log("Is my team request:", isMyTeamRequest);

      if (isMyTeamRequest) {
        console.log("✅ RTM request from my team");
        toast.success("RTM request sent, waiting for admin approval...");
        // Don't set pending here, let fetchAuctionData handle it
      }
    });

    // ENHANCED: RTM approvals
    socket.on("rtm:approved", (payload) => {
      console.log("=== RTM APPROVED DEBUG (Desktop) ===");
      console.log("Full payload:", payload);
      console.log("Payload toTeam:", payload.toTeam);
      console.log("Payload playerName:", payload.playerName);
      console.log("userTeamIdRef.current:", userTeamIdRef.current);

      // Get current team ID with fallbacks
      const currentTeamId = userTeamIdRef.current || auctionData?.team?.teamId;

      // Compare team IDs (handle both string and ObjectId)
      const isMyTeamApproval =
        payload.toTeam === currentTeamId ||
        payload.toTeam === String(currentTeamId) ||
        String(payload.toTeam) === String(currentTeamId);

      console.log("Is my team approval:", isMyTeamApproval);

      if (isMyTeamApproval) {
        console.log("✅ RTM approved for my team");
        setRtmRequestPending(false);
        setRtmCount((prev) => Math.max(0, prev - 1)); // Ensure it doesn't go below 0

        const playerName = payload.playerName || "Player";
        toast.success(`RTM approved! ${playerName} added to your team`);
      } else {
        // Show generic approval message for other teams
        const playerName = payload.playerName || "Player";
        toast.info(`RTM approved for ${playerName}`);
      }

      fetchAuctionData();
    });

    // ENHANCED: RTM rejections
    socket.on("rtm:rejected", (payload) => {
      console.log("=== RTM REJECTED DEBUG (Desktop) ===");
      console.log("Full payload:", payload);
      console.log("Payload teamId:", payload.teamId);
      console.log("Payload playerName:", payload.playerName);
      console.log("userTeamIdRef.current:", userTeamIdRef.current);
      console.log("auctionData?.team?.teamId:", auctionData?.team?.teamId);

      // Get current team ID with fallbacks
      const currentTeamId = userTeamIdRef.current || auctionData?.team?.teamId;

      console.log("Current team ID:", currentTeamId);

      if (!currentTeamId) {
        console.warn("⚠️ No team ID available, but showing generic toast");
        const playerName =
          payload.playerName ||
          payload.originalPlayerName ||
          payload.retrievedPlayerName ||
          "Player";
        toast.error(`RTM rejected for ${playerName}`);
        fetchAuctionData();
        return;
      }

      // Compare team IDs (handle both string and ObjectId)
      const isMyTeamRejection =
        payload.teamId === currentTeamId ||
        payload.teamId === String(currentTeamId) ||
        String(payload.teamId) === String(currentTeamId);

      console.log("Is my team rejection:", isMyTeamRejection);

      if (isMyTeamRejection) {
        console.log("✅ RTM rejected for my team, clearing state");
        setRtmRequestPending(false);

        // Enhanced player name with multiple fallbacks
        const playerName =
          payload.playerName ||
          payload.originalPlayerName ||
          payload.retrievedPlayerName ||
          payload.player?.name ||
          "Player";

        console.log("Final player name for toast:", playerName);
        toast.error(`RTM rejected for ${playerName}`);
      } else {
        // Show generic rejection message for other teams
        const playerName =
          payload.playerName ||
          payload.originalPlayerName ||
          payload.retrievedPlayerName ||
          "Player";
        toast.info(`RTM rejected for ${playerName}`);
      }

      fetchAuctionData();
    });

    // Auction state events
    socket.on("auction:paused", () => {
      console.log("auction:paused");
      toast.success("Auction paused");
    });

    socket.on("auction:resumed", () => {
      console.log("auction:resumed");
      toast.success("Auction resumed");
    });

    socket.on("auction:ended", () => {
      console.log("auction:ended");
      toast.success("Auction ended");
      navigate("/dashboard");
    });

    socket.on("bidding:started", (payload) => {
      console.log("bidding:started", payload);
      fetchAuctionData();
    });
    socket.on("timer:expired", (payload) => {
      console.log("Timer expired received:", payload);
      toast.error("⏱ Timer expired — Bidding is now disabled");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-auction", id);
        socketRef.current.disconnect();
      }
      if (emoteTimeoutRef.current) {
        clearTimeout(emoteTimeoutRef.current);
      }
      // Clean up all RTM event listeners
      socket.off("player:rtm");
      socket.off("rtm:request");
      socket.off("rtm:approved");
      socket.off("rtm:rejected");
      socket.off("bid:updated");
      socket.off("bid:placed");
      socket.off("timer:update");
      socket.off("timer:expired");
    };
  }, [id, navigate]); // Removed auctionData dependency to prevent socket recreation

  useEffect(() => {
    checkBidDisabled();
  }, [auctionData, timerData.remainingTime]);
  // ENHANCED: Ensure userTeamIdRef is always synchronized
  useEffect(() => {
    if (
      auctionData?.team &&
      (auctionData.team.teamId || auctionData.team._id)
    ) {
      const tid = auctionData.team.teamId ?? auctionData.team._id;
      setUserTeamId(tid);
      userTeamIdRef.current = tid;
      console.log("Updated userTeamIdRef (Desktop):", tid);
    }
  }, [auctionData?.team]);

  // Initial fetch
  useEffect(() => {
    fetchAuctionData();
  }, [id]);

  useEffect(() => {
    let banCheckInterval;

    if (isBanned && banInfo) {
      banCheckInterval = setInterval(() => {
        const now = Date.now();
        if (now > banInfo.bannedUntil) {
          setIsBanned(false);
          setBanInfo(null);
          toast.success("Your team can now place bids again!");
        } else {
          // Update remaining time
          setBanInfo((prev) => ({
            ...prev,
            remainingMinutes: Math.ceil((prev.bannedUntil - now) / 60000),
          }));
        }
      }, 60000); // Check every minute
    }

    return () => {
      if (banCheckInterval) {
        clearInterval(banCheckInterval);
      }
    };
  }, [isBanned, banInfo]);

  // Add this useEffect to check ban status when component mounts or auction data changes
  useEffect(() => {
    checkBanStatus();
  }, [auctionData?.team?.teamId, id]);

  useEffect(() => {
    if (timerData.isActive && timerData.expiresAt) {
      // Clear existing interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Start new interval
      timerIntervalRef.current = setInterval(() => {
        const remaining = calculateRemainingTime(timerData.expiresAt);

        setTimerData((prev) => ({
          ...prev,
          remainingTime: remaining,
        }));

        // Check if timer expired
        if (remaining <= 0) {
          clearInterval(timerIntervalRef.current);
          setTimerData((prev) => ({
            ...prev,
            isActive: false,
            remainingTime: 0,
          }));

          // Notify other clients (especially admin) that timer ended
          if (socketRef.current) {
            socketRef.current.emit("timer:expired", { auctionId: id });
          }

          // Optionally check for UI state change
          checkBidDisabled();
        }
      }, 1000);
    } else {
      // Clear interval if timer is not active
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerData.isActive, timerData.expiresAt]);

  // 4. Check if bid should be disabled
  const checkBidDisabled = () => {
    const currentBidAmount = auctionData?.currentBid?.amount || 0;
    const bidAmountValue = auctionData?.bidAmount?.amount || 0;
    const amountsMatch = currentBidAmount === bidAmountValue;
    const isTimerExpired = timerData.remainingTime <= 0;

    // Disable bid if timer expired AND amounts match
    const shouldDisable = isTimerExpired && amountsMatch;
    setIsBidDisabled(shouldDisable);
  };

  // ENHANCED: RTM Handler with better error handling
  const handleUseRTM = async () => {
    console.log("=== RTM DEBUG (Desktop) - Starting ===");
    console.log("- RTM Count:", rtmCount);
    console.log("- RTM Request Pending:", rtmRequestPending);
    console.log("- Team ID:", auctionData?.team?.teamId);
    console.log("- Auction ID:", id);

    if (rtmCount <= 0) {
      console.log("❌ No RTMs left");
      toast.error("No RTMs left");
      return;
    }

    if (rtmRequestPending) {
      console.log("❌ RTM request already pending");
      toast.error("RTM request already pending approval");
      return;
    }

    const myTeamId = auctionData?.team?.teamId || auctionData?.team?._id;

    if (!myTeamId) {
      console.log("❌ No team ID found");
      toast.error("Team ID not found");
      return;
    }

    console.log("✅ Sending RTM request...");

    try {
      const requestPayload = {
        teamId: myTeamId,
      };

      console.log("Request payload:", requestPayload);
      console.log("Request URL:", `/use-rtm/${id}`);

      const response = await Api.post(`/use-rtm/${id}`, requestPayload);

      console.log("✅ RTM Response:", response.data);

      if (response.data.status === "pending") {
        toast.success("RTM request sent for admin approval!");
        // Don't manually set pending state, let socket events and fetchAuctionData handle it
      } else {
        toast.success("RTM successful!");
        setRtmCount((prev) => Math.max(0, prev - 1));
      }

      fetchAuctionData();
    } catch (err) {
      console.error("❌ RTM error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      toast.error(err.response?.data?.message || "Failed to use RTM");
    }
  };
  // const TimerDisplay = () => {
  //   if (!timerData.isActive) return null;

  //   const progress =
  //     (timerData.remainingTime / (timerData.duration / 1000)) * 100;
  //   const isLowTime = timerData.remainingTime <= 3;

  //   return (
  //     <div className="bg-gradient-to-r from-orange-900/50 to-red-800/50 rounded-xl p-3 mb-4 shadow-lg">
  //       <div className="flex items-center justify-between mb-2">
  //         <h3 className="text-sm font-medium text-orange-200">Bidding Timer</h3>
  //         <span
  //           className={`text-lg font-bold ${
  //             isLowTime ? "text-red-400 animate-pulse" : "text-orange-300"
  //           }`}
  //         >
  //           {timerData.remainingTime}s
  //         </span>
  //       </div>

  //       {/* Progress Bar */}
  //       <div className="w-full bg-gray-700 rounded-full h-2">
  //         <div
  //           className={`h-2 rounded-full transition-all duration-1000 ${
  //             isLowTime ? "bg-red-500" : "bg-orange-500"
  //           }`}
  //           style={{ width: `${progress}%` }}
  //         />
  //       </div>

  //       <p className="text-xs text-orange-200 mt-1 opacity-75">
  //         {isBidDisabled
  //           ? "Bidding disabled - Timer expired"
  //           : "Place your bid before timer ends"}
  //       </p>
  //     </div>
  //   );
  // };

  const TimerDisplay = () => {
    if (!timerData.isActive) return null;
    const progress =
      (timerData.remainingTime / (timerData.duration / 1000)) * 100;
    const isLowTime = timerData.remainingTime <= 3;
    return (
      <div className="bg-gradient-to-r from-orange-900/50 to-red-800/50 rounded-xl p-3 mb-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-orange-200">Bidding Timer</h3>
          <span
            className={`text-lg font-bold ${
              isLowTime ? "text-red-400 animate-pulse" : "text-orange-300"
            }`}
          >
            {timerData.remainingTime}s
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              isLowTime ? "bg-red-500" : "bg-orange-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-orange-200 mt-1 opacity-75">
          {isBidDisabled
            ? "Bidding disabled - Timer expired"
            : "Place your bid before timer ends"}
        </p>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────
  // Container classes
  const containerClasses = [
    "text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
    fullScreen ? "fixed inset-0 z-[9999] overflow-auto" : "relative mx-auto",
    "h-screen overflow-auto",
  ].join(" ");

  const nextBidAmount = auctionData.bidAmount || "--/--";

  return (
    <div
      className={`${containerClasses} hidden md:grid grid-cols-4 gap-4 px-4 pt-4 md:h-[calc(110vh-4rem)]`}
    >
      {/* ─── HEADER BAR ───────────────────────────────────────────── */}
      <motion.div
        className="col-span-4 flex justify-center items-center px-4 py-3 bg-gray-800/60 backdrop-blur-sm sticky top-0 z-10"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <button
          onClick={() => navigate("/admin-auction-info")}
          className="absolute top-4 left-4 z-50 flex items-center space-x-2 text-white bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg shadow-md transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          CricBid Auction
        </h1>
        <button
          onClick={() => navigate(`/user-bidding-portal/${id}/user-guidelines`)}
          className="absolute top-4 right-4 z-50 flex items-center space-x-2 text-white bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg shadow-md transition"
        >
          <IoIosHelpCircle size={18} />
          <span className="text-sm font-medium">Guidelines</span>
        </button>
      </motion.div>

      {/* ─── LEFT COLUMN ─────────────────────────────────────────── */}
      <div className="col-span-1 flex flex-col space-y-4 md:h-full md:justify-start">
        {[
          ["Last Sold", auctionData.lastSold],
          ["Most Expensive", auctionData.mostExpensive],
        ].map(([title, info]) => (
          <motion.div
            key={title}
            className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-sm shadow-lg border border-indigo-700/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h4 className="uppercase text-xs font-medium tracking-wider text-cyan-300">
              {title}
            </h4>
            <p className="font-semibold text-sm mt-1">
              {info?.name ?? "--/--"}
            </p>
            <p className="text-xs opacity-80">
              {/* {info?.price ?? "--/--"} — {info?.team ?? "--/--"} */}
              {info?.price != null
                ? `₹${formatIndianNumber(info.price)}`
                : "--/--"}{" "}
              — {info?.team ?? "--/--"}
            </p>
          </motion.div>
        ))}
        {/* ─ Current Player Details ─ */}
        <motion.div
          onClick={openPlayerModal}
          className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 w-full max-w-md text-center shadow-xl border border-indigo-600/30 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <motion.div
            className="mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-700 to-blue-800 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center overflow-hidden border-2 border-cyan-400/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {auctionData.currentPlayer?.playerPic ? (
              <img
                src={auctionData.currentPlayer.playerPic}
                alt={auctionData.currentPlayer.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </motion.div>
          <h2 className="text-2xl font-bold">
            {auctionData.currentPlayer?.name ?? "--/--"}
          </h2>
          <p className="text-sm bg-blue-600/30 inline-block px-2 py-1 rounded-full mt-1">
            {auctionData.currentPlayer?.role ?? "--/--"}
          </p>
          <div className="mt-3 flex justify-center gap-6">
            <div>
              <span className="text-xs opacity-75">Bat</span>
              <p className="text-sm">
                {auctionData.currentPlayer?.battingStyle ?? "--/--"}
              </p>
            </div>
            <div>
              <span className="text-xs opacity-75">Ball</span>
              <p className="text-sm">
                {auctionData.currentPlayer?.bowlingStyle ?? "--/--"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
  <div className="flex flex-col items-center">
    <span className="text-xs opacity-75">Rating</span>
    <p className="text-sm">
      {auctionData.currentPlayer?.points ?? "--/--"}
    </p>
  </div>
  {auctionData.currentPlayer?.country &&
    auctionData.currentPlayer?.country !== "INDIA" && (
      <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full shadow-sm flex items-center">
        ✈️
      </span>
    )}
</div>

          <p className="mt-3 text-base font-semibold bg-blue-900/50 py-1 rounded-lg border border-blue-700">
            Base Price:{" "}
            {auctionData.currentPlayer?.basePrice != null
              ? `₹${formatIndianNumber(auctionData.currentPlayer.basePrice)}`
              : "--/--"}
          </p>
        </motion.div>
      </div>

      {/* ─── MIDDLE COLUMN ───────────────────────────────────────── */}
      <div className="col-span-2 flex flex-col items-center space-y-4">
        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-2 justify-center w-full">
          <motion.button
            onClick={() => navigate(`/user-bidding-portal/${id}/players`)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            Players List
          </motion.button>
          <motion.button
            onClick={() => navigate(`/admin/bidding-teams-list/${id}`)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Teams
          </motion.button>
        </div>

        {/* Purse */}
        <motion.div
          className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg w-full max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-sm font-semibold mb-1 text-center">
            Purse Balance
          </h3>
          <p className="text-xl font-mono text-green-400 text-center animate-pulse">
            {auctionData.team?.purse != null
              ? `₹${formatIndianNumber(auctionData.team.purse)}`
              : "--/--"}
          </p>
        </motion.div>

        {/* Bid Now */}

        <motion.div
          className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg w-full max-w-md text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Timer Display */}
          <TimerDisplay />

          <h3 className="text-xs font-medium mb-1">Bid Now</h3>

          {isBanned ? (
            <div className="text-center">
              <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 mb-2">
                <p className="text-red-400 text-sm font-medium">
                  🚫 Temporarily Banned
                </p>
                <p className="text-red-300 text-xs mt-1">
                  Your team is banned from bidding for{" "}
                  {banInfo?.remainingMinutes || 0} more minutes
                </p>
                <p className="text-red-200 text-xs mt-1 opacity-75">
                  Reason: Excessive bid attempts
                </p>
              </div>
              <button
                className="bg-gray-500 text-gray-300 px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
                disabled
              >
                Bidding Disabled
              </button>
            </div>
          ) : (
            <BidButton
              onClick={handleBid}
              disabled={isBidding || isBanned || isBidDisabled}
              className={isBidDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          )}

          <p className="mt-1 text-xs opacity-75">
            Next Updated Price:{" "}
            {nextBidAmount != null
              ? `₹${formatIndianNumber(nextBidAmount)}`
              : "--/--"}
          </p>

          {(isBanned || isBidDisabled) && (
            <p className="mt-2 text-xs text-red-400">
              {isBanned
                ? "You can still watch the auction but cannot place bids"
                : "Bidding disabled - Timer expired"}
            </p>
          )}
        </motion.div>

        {/* Current Highest Bid */}
        <motion.div
          className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md text-center shadow-xl border border-indigo-600/30"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="mb-2">
            <span className="text-xs uppercase opacity-75">
              Current Highest Bid
            </span>
          </div>
          <motion.div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-xl text-black shadow-lg mb-3">
            {auctionData.currentBid?.amount != null
              ? `₹${formatIndianNumber(auctionData.currentBid.amount)}`
              : "--/--"}
          </motion.div>
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 border border-gray-500">
              {auctionData.currentBid?.team?.logoUrl ? (
                <img
                  src={auctionData.currentBid.team.logoUrl}
                  alt={auctionData.currentBid.team.teamName}
                  className="w-6 h-6"
                />
              ) : (
                <span>🏏</span>
              )}
            </div>
            <p className="text-sm">
              by{" "}
              {typeof auctionData.currentBid?.team === "string"
                ? auctionData.currentBid.team
                : auctionData.currentBid?.team?.teamName ?? "--/--"}
            </p>
          </div>
          <button
            onClick={handleUseRTM}
            disabled={rtmCount <= 0 || rtmRequestPending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              rtmCount <= 0 || rtmRequestPending
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {rtmRequestPending ? "RTM Pending..." : `Use RTM (${rtmCount})`}
          </button>
          <p className="mt-1 text-xs opacity-75">RTMs Remaining: {rtmCount}</p>
        </motion.div>
      </div>

      {/* ─── RIGHT COLUMN ─────────────────────────────────────────── */}
      <div className="col-span-1 flex flex-col justify-between h-full">
        <motion.div
          className="mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DesktopTeamCard team={auctionData.team} />
        </motion.div>

        <motion.div
          className="bg-gradient-to-br mb-4 from-indigo-900/50 to-blue-800/50 rounded-xl text-center shadow-lg self-end border border-indigo-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {avatarUrl ? (
            <CharacterCard modelPath={avatarUrl} triggerEmote={emoteToPlay} />
          ) : (
            <p>Loading your character…</p>
          )}
        </motion.div>
      </div>
      {showModal && selectedPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md px-4 py-6"
          onClick={closePlayerModal}
        >
          <div
            className="
        relative 
        w-full 
        max-w-md sm:max-w-lg md:max-w-xl 
        max-h-full 
        sm:max-h-[90vh] 
        bg-gradient-to-tr from-[#1e1e2f] via-[#2a2a3b] to-[#1e1e2f] 
        rounded-2xl 
        shadow-[0_0_30px_rgba(0,0,0,0.8)] 
        border border-gray-700 
        text-white 
        overflow-hidden
        flex flex-col
      "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl sm:text-3xl font-bold transition-all duration-200 z-10"
              onClick={closePlayerModal}
            >
              &times;
            </button>

            {/* Scrollable content area */}
            <div className="pt-6 pb-4 px-4 sm:px-6 overflow-y-auto">
              {/* Player Image and basic info */}
              <div className="text-center mb-4">
                <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-emerald-400 overflow-hidden shadow-lg mb-3">
                  {selectedPlayer.playerPic ? (
                    <img
                      src={selectedPlayer.playerPic}
                      alt={selectedPlayer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-emerald-300">
                  {selectedPlayer.name}
                </h2>
                <p className="text-sm sm:text-base italic text-gray-400 uppercase tracking-wider mt-1">
                  {selectedPlayer.role}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-600 opacity-40 mb-4" />

              {/* Basic Player Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm sm:text-base font-light">
                <div>
                  <span className="block text-gray-400 text-xs sm:text-sm mb-1">
                    Batting Style
                  </span>
                  <span className="text-white font-medium">
                    {selectedPlayer.battingStyle || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs sm:text-sm mb-1">
                    Bowling Style
                  </span>
                  <span className="text-white font-medium">
                    {selectedPlayer.bowlingStyle || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs sm:text-sm mb-1">
                    Base Price
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedPlayer.basePrice != null
                      ? `₹${formatIndianNumber(selectedPlayer.basePrice)}`
                      : "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs sm:text-sm mb-1">
                    Nationality
                  </span>
                  <span className="text-white font-medium">
                    {selectedPlayer.nationality || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs sm:text-sm mb-1">
                    Age
                  </span>
                  <span className="text-white font-medium">
                    {selectedPlayer.age ?? "--"}
                  </span>
                </div>
                {/* Add other top-level fields if needed */}
              </div>

              {/* === Performance Stats: conditional sections === */}
              <div className="mt-6">
                <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-3">
                  Performance Stats
                </h3>

                {(() => {
                  const role = selectedPlayer.role || "";
                  const isBatsman = [
                    "Batsman",
                    "Wicket keeper batsman",
                  ].includes(role);
                  const isBowler = ["Fast bowler", "Spin bowler"].includes(
                    role
                  );
                  const isAllRounder = [
                    "Fast all-rounder",
                    "Spin all-rounder",
                  ].includes(role);

                  const stats = selectedPlayer.performanceStats || {};
                  const battingStats = stats.batting || {};
                  const bowlingStats = stats.bowling || {};
                  const allRoundStats = stats.allRounder || {};

                  // Shared grid class: 1 column on mobile, 2 on sm+
                  const gridClass =
                    "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm sm:text-base";

                  return (
                    <>
                      {isBatsman && (
                        <div className="mb-6">
                          <h4 className="text-md sm:text-lg font-medium text-gray-200 mb-2">
                            Batting
                          </h4>
                          <div className={gridClass}>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Matches
                              </span>
                              <span className="text-white font-medium">
                                {battingStats.matches ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Runs
                              </span>
                              <span className="text-white font-medium">
                                {" "}
                                {battingStats.runs != null
                                  ? formatIndianNumber(battingStats.runs)
                                  : "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                High Score
                              </span>
                              <span className="text-white font-medium">
                                {battingStats.highScore ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Average
                              </span>
                              <span className="text-white font-medium">
                                {battingStats.average ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Strike Rate
                              </span>
                              <span className="text-white font-medium">
                                {battingStats.strikeRate ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Centuries
                              </span>
                              <span className="text-white font-medium">
                                {battingStats.centuries ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Fifties
                              </span>
                              <span className="text-white font-medium">
                                {battingStats.fifties ?? "--"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isBowler && (
                        <div className="mb-6">
                          <h4 className="text-md sm:text-lg font-medium text-gray-200 mb-2">
                            Bowling
                          </h4>
                          <div className={gridClass}>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Matches
                              </span>
                              <span className="text-white font-medium">
                                {bowlingStats.matches ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Wickets
                              </span>
                              <span className="text-white font-medium">
                                {bowlingStats.wickets ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Best Bowling
                              </span>
                              <span className="text-white font-medium">
                                {bowlingStats.bestBowling ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Average
                              </span>
                              <span className="text-white font-medium">
                                {bowlingStats.average ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Economy
                              </span>
                              <span className="text-white font-medium">
                                {bowlingStats.economy ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                5-Wicket Hauls
                              </span>
                              <span className="text-white font-medium">
                                {bowlingStats.fiveWicketHauls ?? "--"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isAllRounder && (
                        <div className="mb-6">
                          <h4 className="text-md sm:text-lg font-medium text-gray-200 mb-2">
                            All-Rounder Stats
                          </h4>
                          <div className={gridClass}>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Matches
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.matches ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Runs
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.runs ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                High Score
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.highScore ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Batting Avg
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.battingAverage ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Batting S/R
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.battingStrikeRate ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Centuries
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.centuries ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Fifties
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.fifties ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Wickets
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.wickets ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Best Bowling
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.bestBowling ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Bowling Avg
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.bowlingAverage ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                Economy
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.economy ?? "--"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">
                                5-Wicket Hauls
                              </span>
                              <span className="text-white font-medium">
                                {allRoundStats.fiveWicketHauls ?? "--"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isBatsman && !isBowler && !isAllRounder && (
                        <p className="text-gray-400 text-sm sm:text-base">
                          No performance stats available for this role.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
