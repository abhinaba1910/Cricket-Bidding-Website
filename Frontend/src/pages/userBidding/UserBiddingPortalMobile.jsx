import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import BidButton from "../../components/ui/BidButton";
import CharacterCard from "../characters/CharacterCard";
import toast from "react-hot-toast";
import { FaUserTie, FaWallet, FaUsers } from "react-icons/fa";
import { GiMoneyStack, GiCardRandom, GiTeamIdea } from "react-icons/gi";
import Api from "../../userManagement/Api";
import { io } from "socket.io-client";
import { formatIndianNumber } from "../../types/formatIndianNumber";
import { IoIosHelpCircle } from "react-icons/io";
import { ArrowLeft } from "lucide-react";
const TeamInfoCard = ({ team }) => {
  if (!team) return null;

  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-lg w-full bg-blue-700 border border-blue-900"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-900/80 px-4 py-3">
        <div className="flex items-center space-x-3">
          <img
            src={team.logoUrl}
            alt="Team Logo"
            className="w-12 h-12 rounded-lg border-2 border-white"
          />
          <div>
            <h2 className="text-white font-semibold text-lg">
              {team.teamName || "Unnamed Team"}
            </h2>
            <p className="text-xs text-gray-300 uppercase tracking-wider">
              Managed by{" "}
              <span className="text-white font-bold">
                {team.manager?.username}
              </span>
            </p>
          </div>
        </div>
        <img
          src={team.manager?.profilePic}
          alt="Manager"
          className="w-10 h-10 rounded-full border border-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-blue-800 bg-blue-700 text-white">
        <div className="flex flex-col items-start px-4 py-3 space-y-3">
          <div className="flex items-center space-x-2">
            <GiMoneyStack className="text-lg" />
            <span className="text-sm font-medium">
              Total Purse:{" "}
              {`₹team.purse?.toLocaleString()` || team.purse != null
                ? `₹${formatIndianNumber(team.purse)}`
                : "--"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaWallet className="text-lg" />
            <span className="text-sm font-medium">
              Remaining:{" "}
              {`₹team.remaining?.toLocaleString()` || team.remaining != null
                ? `₹${formatIndianNumber(team.remaining)}`
                : "--"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUsers className="text-lg" />
            <span className="text-sm font-medium">
              Players: {team.playersBought?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end px-4 py-3 space-y-3">
          <div className="flex items-center space-x-2">
            <GiCardRandom className="text-lg" />
            <span className="text-sm font-medium">
              RTMs: {team.rtmCount || 0}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <GiTeamIdea className="text-lg" />
            <span className="text-sm font-medium break-all text-right">
              Avatar: {team.avatar || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function SmallPlayerCard({ player }) {
  const currentPlayer = player || {};

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl mb-4 flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", delay: 0.2 }}
      whileHover={{ y: -5 }}
    >
      <motion.div
        className="rounded-full bg-gray-700 w-14 h-14 flex items-center justify-center mr-3 flex-shrink-0"
        whileHover={{ rotate: 10 }}
      >
        {currentPlayer.playerPic ? (
          <img
            src={currentPlayer.playerPic}
            alt={currentPlayer.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-2xl">👤</span>
        )}
      </motion.div>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold truncate">
          {currentPlayer.name || "--/--"}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-blue-600/30 px-2 py-1 rounded-full">
            {currentPlayer.role || "--/--"}
          </span>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full shadow-sm">
            {currentPlayer.points || "--/--"}
          </span>

          <span className="text-xs bg-amber-600/30 px-2 py-1 rounded-full font-semibold">
            {currentPlayer && currentPlayer.basePrice != null
              ? `₹${formatIndianNumber(currentPlayer.basePrice)}`
              : "--"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function UserBiddingDashboardMobile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fullScreen, setFullScreen] = useState(false);
  const [rtmCount, setRtmCount] = useState(0);
  const [rtmRequestPending, setRtmRequestPending] = useState(false); // Added RTM pending state
  const [userTeamId, setUserTeamId] = useState(null); // Added userTeamId state
  const [mobileTab, setMobileTab] = useState("bid");
  const [isBidding, setIsBidding] = useState(false);
  const [emoteToPlay, setEmoteToPlay] = useState(null);
  const [lastSoldTeam, setLastSoldTeam] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const socketRef = useRef(null);
  const emoteTimeoutRef = useRef(null);
  const userTeamIdRef = useRef(null); // Added userTeamIdRef

  // Sync userTeamIdRef with userTeamId state
  useEffect(() => {
    userTeamIdRef.current = userTeamId;
  }, [userTeamId]);

  const toggleFullScreen = () => setFullScreen((fs) => !fs);

  // ─── Sample Auction Data (Default/Fallback) ────────────────────────────────────────
  const sampleAuction = {
    lastSold: { name: "--/--", price: "--/--", team: "--/--" },
    mostExpensive: { name: "--/--", price: "--/--", team: "--/--" },
    currentPlayer: {
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
    bidAmount: "--/--",
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
    team: {
      teamId: null,
      purse: "--/--",
      rtmCount: 0,
      avatar: null,
    },
    adminImageUrl: null,
  };

  const [auctionData, setAuctionData] = useState(sampleAuction);

  // Modal functions
  const openPlayerModal = () => {
    const p = auctionData.currentPlayer;
    if (p) {
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
        matchesPlayed: p.matchesPlayed,
        runs: p.runs,
        wickets: p.wickets,
      };
      setSelectedPlayer(formattedPlayer);
      setShowModal(true);
    }
  };

  const closePlayerModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

  // ─── Enhanced Fetch Auction Data (with RTM logic from desktop) ──────────────────────────
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

      // Handle last sold team emote logic
      const history = data.biddingHistory || [];
      const lastEntry = history[history.length - 1] || null;
      if (lastEntry) {
        const soldTeamId = lastEntry.team._id || lastEntry.team;
        if (soldTeamId !== lastSoldTeam) {
          setLastSoldTeam(soldTeamId);
        }
      }
    } catch (error) {
      console.error("Error fetching auction data:", error);
      toast.error("Error fetching auction data");
      setError(error);
    }
  };

  const handleBid = async () => {
    const playerId = auctionData?.currentPlayer?._id;
    const teamId = auctionData?.team?.teamId;
    const visibleBid = auctionData?.bidAmount;
    if (!playerId || !teamId || !visibleBid || visibleBid <= 0) return;

    try {
      setIsBidding(true);
      await Api.post(`/place-bid/${id}`, {
        playerId,
        teamId,
        bidAmount: visibleBid,
      });
      toast.success("Bid Placed Successfully");
      fetchAuctionData();
      setEmoteToPlay("HandRaise");
      setTimeout(() => setEmoteToPlay(null), 2000);
    } catch (err) {
      console.error("Place bid error:", err);
      toast.error(err.response?.data?.error || "Failed to place bid");
    } finally {
      setIsBidding(false);
    }
  };

  // ─── Enhanced RTM Handler (from desktop version) ──────────────────────────
  const handleUseRTM = async () => {
    console.log("RTM Debug - Starting:");
    console.log("- RTM Count:", rtmCount);
    console.log("- RTM Request Pending:", rtmRequestPending);
    console.log("- Auction Data:", auctionData);
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

    const myTeamId = auctionData?.team?.teamId;

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
        // setRtmRequestPending(true); // Will be set by socket event
        toast.success("RTM request sent for admin approval!");
      } else {
        toast.success("RTM successful!");
        setRtmCount((prev) => prev - 1);
      }

      fetchAuctionData();
    } catch (err) {
      console.error("❌ RTM error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      toast.error(err.response?.data?.message || "Failed to use RTM");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token; skipping socket connect");
      return;
    }

    const socket = io("https://cricket-bidding-website-backend.onrender.com", {
      // const socket = io("http://localhost:6001", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected (user bidding mobile):", socket.id);
      if (id) {
        socket.emit("join-auction", id);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Enhanced player:sold event with emote logic
    socket.on("player:sold", (payload) => {
      console.log("Received player:sold", payload);
      const winnerId = payload.soldTo;
      const teamId = userTeamIdRef.current;
      if (teamId && winnerId) {
        if (winnerId === teamId) {
          setEmoteToPlay("BidWon");
        } else {
          setEmoteToPlay("LostBid");
        }
        if (emoteTimeoutRef.current) {
          clearTimeout(emoteTimeoutRef.current);
        }
        emoteTimeoutRef.current = setTimeout(() => {
          setEmoteToPlay(null);
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

    // Existing bid events
    socket.on("bid:updated", (payload) => {
      console.log("bid:updated", payload);
      fetchAuctionData();
      toast.success(`New bid ₹${formatIndianNumber(payload.newBid.amount)}`);
    });

    socket.on("bid:placed", (payload) => {
      console.log("bid:placed", payload);
      fetchAuctionData();
      toast.success(`New bid ₹${formatIndianNumber(payload.newBid.amount)}`);
    });

    // RTM Events
    socket.on("player:rtm", (payload) => {
      console.log("player:rtm", payload);
      fetchAuctionData();
      toast.success("RTM used");
    });

    // RTM request confirmations
    socket.on("rtm:request", (payload) => {
      console.log("rtm:request", payload);
      // Get current team ID from state or ref
      const currentTeamId = userTeamIdRef.current || auctionData?.team?.teamId;

      if (payload.teamId === currentTeamId) {
        toast.success("RTM request sent, waiting for admin approval...");
      }
    });

    // RTM approvals
    socket.on("rtm:approved", (payload) => {
      console.log("rtm:approved", payload);
      const currentTeamId = userTeamIdRef.current || auctionData?.team?.teamId;

      if (payload.toTeam === currentTeamId) {
        setRtmRequestPending(false);
        setRtmCount((prev) => prev - 1);
        toast.success(`RTM approved! ${payload.playerName} added to your team`);
      }
      fetchAuctionData();
    });

    // FIXED: RTM rejections with better debugging and fallback
    socket.on("rtm:rejected", (payload) => {
      console.log("=== RTM REJECTION DEBUG ===");
      console.log("Full payload:", payload);
      console.log("Payload teamId:", payload.teamId);
      console.log("Payload playerName:", payload.playerName);
      console.log("userTeamIdRef.current:", userTeamIdRef.current);
      console.log("auctionData?.team?.teamId:", auctionData?.team?.teamId);

      // Get current team ID with multiple fallbacks
      const currentTeamId =
        userTeamIdRef.current ||
        auctionData?.team?.teamId ||
        auctionData?.team?._id;

      console.log("Final currentTeamId:", currentTeamId);

      // Check if this rejection is for our team using multiple comparison methods
      const isMyTeamRejection =
        payload.teamId === currentTeamId ||
        payload.teamId === String(currentTeamId) ||
        String(payload.teamId) === String(currentTeamId);

      console.log("Is my team rejection:", isMyTeamRejection);

      if (isMyTeamRejection) {
        console.log("✅ RTM rejected for my team, clearing state");
        setRtmRequestPending(false);

        // Enhanced error message with fallbacks
        const playerName =
          payload.playerName || payload.player?.name || "Unknown Player";
        console.log("Player name for toast:", playerName);

        toast.error(`RTM rejected for ${playerName}`);
      } else {
        // Show generic rejection toast if we can't determine team ownership
        // but we received the event (might be helpful for debugging)
        console.log(
          "❌ RTM rejection not for my team or couldn't determine team"
        );
        if (!currentTeamId) {
          console.log("⚠️ No team ID available, showing generic toast");
          const playerName =
            payload.playerName || payload.player?.name || "Player";
          toast.error(`RTM rejected for ${playerName}`);
        }
      }

      // Always refresh data regardless
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

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-auction", id);
        socketRef.current.disconnect();
      }
      if (emoteTimeoutRef.current) {
        clearTimeout(emoteTimeoutRef.current);
      }
      // Clean up RTM event listeners
      socket.off("player:rtm");
      socket.off("rtm:request");
      socket.off("rtm:approved");
      socket.off("rtm:rejected");
    };
  }, [id, navigate]); // Removed auctionData?.team?.teamId dependency to prevent re-creation

  // ENHANCED: Update userTeamIdRef whenever team data changes
  useEffect(() => {
    if (
      auctionData?.team &&
      (auctionData.team.teamId || auctionData.team._id)
    ) {
      const tid = auctionData.team.teamId ?? auctionData.team._id;
      setUserTeamId(tid);
      userTeamIdRef.current = tid; // Ensure ref is always up to date
      console.log("Updated userTeamIdRef:", tid);
    }
  }, [auctionData?.team]);

  // Initial fetch once
  useEffect(() => {
    fetchAuctionData();
  }, [id]);

  if (!auctionData) return <div className="text-white p-4">Loading...</div>;

  // ─── Swipe Handlers for Mobile Tabs ──────────────────────────
  const handleSwipe = (dir) => {
    if (dir === "left") {
      setMobileTab("stats");
    } else if (dir === "right") {
      setMobileTab("bid");
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    trackMouse: true,
  });

  // Rest of your component JSX goes here...
  // (Include all your existing JSX return statement)

  // ─── Container Classes (Full-screen toggle) ───────────────────
  const containerClasses = [
    "text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
    fullScreen ? "fixed inset-0 z-[9999] overflow-auto" : "relative mx-auto",
    "h-screen overflow-auto",
  ].join(" ");

  // Extract data for easier access
  const { tableNumbers, currentPlayer, adminImageUrl } = auctionData;
  const currentBid = auctionData.currentBid || {
    amount: "--/--",
    team: "--/--",
    teamLogo: null,
  };
  const purseBalance =
    auctionData.team?.purse || auctionData.purseBalance || "--/--";
  const nextBidAmount = auctionData.bidAmount || "--/--";

  return (
    <div className={`${containerClasses} md:hidden`} {...handlers}>
      {/* ─── Header ───────────────────────────────────────────── */}

      <motion.div
        className="sm:hidden flex justify-between items-center px-3 py-2 bg-gray-800/70 backdrop-blur-md sticky top-0 z-50"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin-auction-info")}
          className="flex items-center space-x-1 text-white bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded-md shadow-sm text-xs"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Back</span>
        </button>

        {/* Title */}
        <h1 className="text-base font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          CricBid Auction
        </h1>

        {/* Guidelines Button */}
        <button
          onClick={() => navigate(`/user-bidding-portal/${id}/user-guidelines`)}
          className="flex items-center space-x-1 text-white bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded-md shadow-sm text-xs"
        >
          <IoIosHelpCircle size={16} />
          <span className="font-medium">Help</span>
        </button>
      </motion.div>

      {/* ─── Mobile Tabs Navigation ──────────────────────────────── */}
      <div className="flex justify-around border-b border-blue-700 bg-gray-800">
        <motion.button
          className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
            mobileTab === "bid"
              ? "border-b-2 border-amber-500 text-amber-500"
              : "text-gray-300"
          }`}
          onClick={() => setMobileTab("bid")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Bidding
        </motion.button>
        <motion.button
          className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
            mobileTab === "stats"
              ? "border-b-2 border-emerald-400 text-emerald-400"
              : "text-gray-300"
          }`}
          onClick={() => setMobileTab("stats")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Stats
        </motion.button>
      </div>

      {/* ─── Mobile Content (swipeable) ─────────────────────────── */}
      <div className="px-4 pt-4 w-full">
        {/* ─── Teams List & Players List Buttons ─────────────── */}
        <motion.div
          className="grid grid-cols-3 gap-2 w-full mb-1 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => navigate(`/user-bidding-portal/${id}/players`)}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Players
          </motion.button>

          <motion.button
            onClick={() => navigate(`/admin/bidding-teams-list/${id}`)}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Teams
          </motion.button>

          <motion.button
            onClick={handleUseRTM}
            disabled={rtmCount <= 0 || rtmRequestPending}
            className={`w-full py-2 rounded-xl text-xs sm:text-sm text-white font-medium shadow-md ${
              rtmRequestPending || rtmCount <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-700"
            }`}
            whileHover={{
              scale: rtmRequestPending || rtmCount <= 0 ? 1 : 1.03,
            }}
            whileTap={{ scale: rtmRequestPending || rtmCount <= 0 ? 1 : 0.97 }}
          >
            {rtmRequestPending ? "RTM Pending..." : `Use RTM (${rtmCount})`}
          </motion.button>
        </motion.div>

        <p className="text-xs pr-8 text-gray-300 text-right mb-4">
          {rtmCount} RTM(s)
        </p>

        {/* ─── Mobile Purse Balance & RTM ───────────────────── */}
        <div className="w-full max-w-md mb-4">
          <div className="flex gap-3">
            <motion.div
              className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 shadow-lg flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xs font-medium mb-1">Purse</h3>
              <p className="text-lg font-mono text-green-400">
                {purseBalance != null
                  ? `₹${formatIndianNumber(purseBalance)}`
                  : "--/--"}
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 shadow-lg flex-1 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xs font-medium mb-1">Bid Now</h3>
              <BidButton
                amount={nextBidAmount}
                onClick={handleBid}
                disabled={isBidding}
              />
              <p className="mt-1 text-xs opacity-75">
                Next Updated Price:{" "}
                {nextBidAmount != null
                  ? `₹${formatIndianNumber(nextBidAmount)}`
                  : "--/--"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ─── MOBILE: Bidding / Stats Sections ─────────────── */}
        <AnimatePresence mode="wait">
          {/* Bidding Tab */}
          {mobileTab === "bid" && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              key="bid-tab"
            >
              {/* Small Player Card */}
              <SmallPlayerCard player={currentPlayer} />

              {/* Current Bid Section */}
              <motion.div
                className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-5 w-full text-center shadow-xl mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <div className="mb-3">
                  <span className="text-xs uppercase opacity-75">
                    Current Highest Bid
                  </span>
                </div>
                <motion.div
                  className="rounded-xl bg-amber-500 py-3 font-bold text-xl text-black shadow-lg mb-4"
                  whileHover={{ scale: 1.03 }}
                >
                  {/* {currentBid.amount} */}
                  {currentBid?.amount != null
                    ? `₹${formatIndianNumber(currentBid.amount)}`
                    : "--/--"}
                </motion.div>

                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-2"
                    whileHover={{ rotate: 10 }}
                  >
                    {currentBid.team && currentBid.team.logoUrl ? (
                      <img
                        src={currentBid.team.logoUrl}
                        alt={currentBid.team.shortName || "Team"}
                        className="w-6 h-6"
                      />
                    ) : (
                      <span>🏏</span>
                    )}
                  </motion.div>
                  <p className="text-sm">
                    by{" "}
                    {typeof currentBid.team === "object"
                      ? currentBid.team?.shortName ||
                        currentBid.team?.teamName ||
                        "Unknown Team"
                      : currentBid.team || "Unknown Team"}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {mobileTab === "stats" && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
              key="stats-tab"
            >
              {/* Detailed Player Card */}
              <motion.div
                className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                whileHover={{ y: -5 }}
                onClick={openPlayerModal}
              >
                <div className="flex items-center">
                  <motion.div
                    className="rounded-full bg-gray-700 w-16 h-16 flex items-center justify-center mr-3"
                    whileHover={{ rotate: 10 }}
                  >
                    {currentPlayer?.playerPic ? (
                      <img
                        src={currentPlayer.playerPic}
                        alt={currentPlayer.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </motion.div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold">
                      {currentPlayer?.name || "--/--"}
                    </h2>
                    <p className="text-xs bg-blue-600/30 inline-block px-2 py-1 rounded-full">
                      {currentPlayer?.role || "--/--"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <motion.div
                    className="bg-blue-800/40 p-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Batting</span>
                    <p>{currentPlayer?.battingStyle || "--/--"}</p>
                  </motion.div>
                  <motion.div
                    className="bg-blue-800/40 p-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Bowling</span>
                    <p>{currentPlayer?.bowlingStyle || "--/--"}</p>
                  </motion.div>
                  <motion.div
                    className="bg-blue-800/40 p-2 rounded-lg col-span-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Base Price</span>
                    <p className="font-semibold">
                      {/* {currentPlayer?.basePrice || "--/--"} */}
                      {currentPlayer && currentPlayer.basePrice != null
                        ? `₹${formatIndianNumber(currentPlayer.basePrice)}`
                        : "--"}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Criteria Table */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* <CriteriaTable tableNumbers={tableNumbers} /> */}
                <TeamInfoCard team={auctionData.team} />
              </motion.div>

              {/* Auction Stats */}
              <motion.div
                className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-5 w-full shadow-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-bold mb-3">Auction Stats</h3>

                <div className="space-y-4">
                  {/* Last Sold Player */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="text-sm font-medium mb-1">
                      Last Sold Player
                    </h4>
                    <div className="bg-blue-800/40 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>
                          {auctionData.lastSoldPlayer?.player?.name || "--/--"}
                        </span>
                        <span className="text-amber-400">
                          ₹
                          {auctionData.lastSoldPlayer?.bidAmount != null
                            ? formatIndianNumber(
                                auctionData.lastSoldPlayer.bidAmount
                              )
                            : "--/--"}
                        </span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {auctionData.lastSoldPlayer?.team?.teamName || "--/--"}
                      </div>
                    </div>
                  </motion.div>

                  {/* Most Expensive Player */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-sm font-medium mb-1">Most Expensive</h4>
                    <div className="bg-blue-800/40 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>
                          {auctionData.mostExpensivePlayer?.player?.name ||
                            "--/--"}
                        </span>
                        <span className="text-green-400">
                          ₹
                          {auctionData.mostExpensivePlayer?.bidAmount != null
                            ? formatIndianNumber(
                                auctionData.mostExpensivePlayer.bidAmount
                              )
                            : "--/--"}
                        </span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {auctionData.mostExpensivePlayer?.team?.teamName ||
                          "--/--"}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Admin Card (Always visible) ───────────────────── */}
        <motion.div
          className="mt-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-full flex justify-center items-center py-4">
            {avatarUrl ? (
              <CharacterCard modelPath={avatarUrl} triggerEmote={emoteToPlay} />
            ) : (
              <p>Loading your character…</p>
            )}
          </div>
        </motion.div>
      </div>
      {/* ─── Player Modal ─────────────────────────────────────── */}
      {showModal && selectedPlayer && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePlayerModal}
        >
          <motion.div
            className="bg-gradient-to-br from-[#1e1e2f] via-[#2a2a3b] to-[#1e1e2f] rounded-2xl p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl text-white relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition"
              onClick={closePlayerModal}
            >
              &times;
            </button>

            <div className="text-center mb-4">
              <div className="mx-auto w-24 h-24 rounded-full border-4 border-emerald-400 overflow-hidden shadow-lg mb-2">
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
              <h2 className="text-2xl font-bold text-emerald-300">
                {selectedPlayer.name}
              </h2>
              <p className="text-sm italic text-gray-400 uppercase tracking-wide">
                {selectedPlayer.role}
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3 text-sm font-light mb-4">
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="block text-gray-300 text-xs mb-1">
                  Batting
                </span>
                <p className="text-white font-medium">
                  {selectedPlayer.battingStyle || "--"}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="block text-gray-300 text-xs mb-1">
                  Bowling
                </span>
                <p className="text-white font-medium">
                  {selectedPlayer.bowlingStyle || "--"}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl col-span-2 text-center">
                <span className="block text-gray-300 text-xs mb-1">
                  Base Price
                </span>
                <p className="text-emerald-400 font-bold text-lg">
                  {selectedPlayer.basePrice != null
                    ? `₹${formatIndianNumber(selectedPlayer.basePrice)}`
                    : "--"}
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">
                Performance Stats
              </h3>
              {(() => {
                const role = selectedPlayer.role || "";
                const isBatsman = ["Batsman", "Wicket keeper batsman"].includes(
                  role
                );
                const isBowler = ["Fast bowler", "Spin bowler"].includes(role);
                const isAllRounder = [
                  "Fast all-rounder",
                  "Spin all-rounder",
                ].includes(role);

                const stats = selectedPlayer.performanceStats || {};
                const batting = stats.batting || {};
                const bowling = stats.bowling || {};
                const allRound = stats.allRounder || {};

                const StatItem = ({ label, value }) => (
                  <div className="mb-2">
                    <span className="block text-gray-400 text-xs">{label}</span>
                    <span className="text-white font-medium">
                      {value ?? "--"}
                    </span>
                  </div>
                );

                if (isBatsman) {
                  return (
                    <>
                      <StatItem label="Matches" value={batting.matches} />
                      <StatItem
                        label="Runs"
                        value={formatIndianNumber(batting.runs)}
                      />
                      <StatItem label="High Score" value={batting.highScore} />
                      <StatItem label="Average" value={batting.average} />
                      <StatItem
                        label="Strike Rate"
                        value={batting.strikeRate}
                      />
                      <StatItem label="Centuries" value={batting.centuries} />
                      <StatItem label="Fifties" value={batting.fifties} />
                    </>
                  );
                }

                if (isBowler) {
                  return (
                    <>
                      <StatItem label="Matches" value={bowling.matches} />
                      <StatItem label="Wickets" value={bowling.wickets} />
                      <StatItem
                        label="Best Bowling"
                        value={bowling.bestBowling}
                      />
                      <StatItem label="Average" value={bowling.average} />
                      <StatItem label="Economy" value={bowling.economy} />
                      <StatItem
                        label="5W Hauls"
                        value={bowling.fiveWicketHauls}
                      />
                    </>
                  );
                }

                if (isAllRounder) {
                  return (
                    <>
                      <StatItem label="Matches" value={allRound.matches} />
                      <StatItem
                        label="Runs"
                        value={formatIndianNumber(allRound.runs)}
                      />
                      <StatItem label="High Score" value={allRound.highScore} />
                      <StatItem
                        label="Batting Avg"
                        value={allRound.battingAverage}
                      />
                      <StatItem
                        label="Batting S/R"
                        value={allRound.battingStrikeRate}
                      />
                      <StatItem label="Centuries" value={allRound.centuries} />
                      <StatItem label="Fifties" value={allRound.fifties} />
                      <StatItem label="Wickets" value={allRound.wickets} />
                      <StatItem
                        label="Best Bowling"
                        value={allRound.bestBowling}
                      />
                      <StatItem
                        label="Bowling Avg"
                        value={allRound.bowlingAverage}
                      />
                      <StatItem label="Economy" value={allRound.economy} />
                      <StatItem
                        label="5W Hauls"
                        value={allRound.fiveWicketHauls}
                      />
                    </>
                  );
                }

                return (
                  <p className="text-gray-400 text-sm">
                    No performance stats available for this role.
                  </p>
                );
              })()}
            </div>

            <button
              onClick={closePlayerModal}
              className="w-full mt-3 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold transition-all duration-200"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
