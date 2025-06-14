import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import BidButton from "../../components/ui/BidButton";
import CharacterCard from "../characters/CharacterCard";
import api from "../../userManagement/Api";
import toast from "react-hot-toast";

// ─── Shared “CriteriaTable” for Desktop ────────────────────────────
function CriteriaTable() {
  const totalCriteria = 24;
  const foreignCount = 0;
  const foreignMax = 15;
  const indianCount = 0;
  const indianMax = 9;
  const batCount = 0;
  const ballCount = 0;
  const jerseyCount = 0;
  const gloveCount = 0;

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-700/90 to-indigo-800/90 rounded-xl overflow-hidden shadow-lg w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
    >
      <div className="flex justify-between items-center bg-indigo-900/70 px-3 py-2">
        <span className="text-xs font-medium uppercase text-gray-200">
          Criteria
        </span>
        <span className="text-xs font-semibold text-gray-100">
          {`${foreignCount + indianCount}/${totalCriteria}`}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-blue-800/50">
        <div className="flex flex-col items-start px-3 py-2 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">✈️</span>
            <span className="text-sm font-medium text-white">{`${foreignCount}/${foreignMax}`}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🇮🇳</span>
            <span className="text-sm font-medium text-white">{`${indianCount}/${indianMax}`}</span>
          </div>
        </div>

        <div className="flex flex-col items-end px-3 py-2 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏏</span>
            <span className="text-sm font-medium text-white">{batCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏐</span>
            <span className="text-sm font-medium text-white">{ballCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎽</span>
            <span className="text-sm font-medium text-white">
              {jerseyCount}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🥊</span>
            <span className="text-sm font-medium text-white">{gloveCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Bid paddle animation variants
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

// ─── Main Desktop Component ─────────────────────────────────────────
export default function UserBiddingDashboardDesktop() {
  const navigate = useNavigate();
  const [fullScreen, setFullScreen] = useState(false);
  
  const [isBidding, setIsBidding] = useState(false);
  const { id } = useParams();
  const [emoteToPlay, setEmoteToPlay] = useState(null);
  const [lastSoldTeam, setLastSoldTeam] = useState(null);
  const [rtmCount, setRtmCount] = useState(0);

  const toggleFullScreen = () => setFullScreen((fs) => !fs);

  // ─── Sample Auction Data ────────────────────────────────────────
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
  };
  const [auctionData, setAuctionData] = useState(sampleAuction);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const response = await api.get(`/bidding-portal/${id}`);
        const data = response.data;
        console.log("Fetched Auction Data:", data);
        setAuctionData(data);
        if (data.team?.avatar) {
          const raw = data.team.avatar; // e.g. "Frontend/public/models/char2.glb"
          const idx = raw.indexOf("/models"); // find where the real path starts
          const publicPath = idx >= 0 ? raw.slice(idx) : raw; // "/models/char2.glb"
          console.log("Loading GLB from:", publicPath);
          setAvatarUrl(publicPath);
        }

        setRtmCount(data.team.rtmCount)
        console.error("avatar from back:", data.team.avatar);
        const history = data.biddingHistory || [];
        const lastEntry = history[history.length - 1] || null;
        if (lastEntry) {
          const soldTeamId = lastEntry.team._id || lastEntry.team;
          if (soldTeamId !== lastSoldTeam) {
            setLastSoldTeam(soldTeamId);

            if (soldTeamId === data.team.teamId) {
              setEmoteToPlay("BidWon");
            } else {
              setEmoteToPlay("LostBid");
            }
            setTimeout(() => setEmoteToPlay(null), 5000);
          }
        }
        const formatPlayerData = (entry) => {
          if (!entry || !entry.player || !entry.team)
            return {
              name: "--/--",
              price: "--/--",
              team: "--/--",
            };

          return {
            name: entry.player.name || "--/--",
            price: entry.bidAmount || "--/--",
            team: entry.team.shortName || "--/--",
          };
        };

        setAuctionData((prev) => ({
          ...prev,
          lastSold: formatPlayerData(data.lastSoldPlayer),
          mostExpensive: formatPlayerData(data.mostExpensivePlayer),
        }));
      } catch (error) {
        toast.error("Error fetching auction data:", error);
      }
    };

    fetchAuctionData();
    const interval = setInterval(fetchAuctionData, 800);

    // Cleanup to stop interval on unmount
    return () => clearInterval(interval);
  }, [id, lastSoldTeam]);

  const { tableNumbers, currentLot, adminImageUrl } = auctionData;

  const handleBid = async () => {
    const playerId = auctionData?.currentPlayer?._id;
    const teamId = auctionData?.team?.teamId;
    const visibleBid = auctionData?.bidAmount;

    if (!playerId || !teamId) {
      alert("Missing team or player information.");
      return;
    }

    if (!visibleBid || visibleBid <= 0) {
      alert("Invalid bid amount.");
      return;
    }

    const payload = {
      auctionId: id,
      playerId,
      teamId,
      bidAmount: visibleBid, // ✅ send what is visible, NOT incremented
    };

    try {
      setIsBidding(true);
      const res = await api.post(`/place-bid/${id}`, payload);
      setEmoteToPlay(null);
      setTimeout(() => setEmoteToPlay("HandRaise"), 10);

      toast.success("Bid Placed Successfully");
      // Refresh data
      const updated = await api.get(`/bidding-portal/${id}`);
      setAuctionData(updated.data);
    } catch (error) {
      console.error("Failed to place bid:", error);
      toast.error(error.response?.data?.error || "Failed to place bid");
    } finally {
      setIsBidding(false);
    }
  };

  const handleUseRTM = async () => {
    if (rtmCount <= 0) {
      alert("No RTMs left");
      return;
    }
  
    const myTeamId = auctionData?.team?.teamId;
    try {
      const response = await api.post(`/use-rtm/${id}`, { 
        teamId: myTeamId,              // The current user's selected team ID
      });
  
      toast.success("RTM successful!" );
      setRtmCount((prev) => prev - 1);
      
      // Optionally refetch auction state or update local UI
      // await fetchAuctionData();
  
    } catch (err) {
      console.error("RTM error:", err);
      toast.error(err.response?.data?.message || "Failed to use RTM");
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };
  
  // ─── Container Classes (Full-screen toggle) ───────────────────
  const containerClasses = [
    "text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
    fullScreen ? "fixed inset-0 z-[9999] overflow-auto" : "relative mx-auto",
    "h-screen overflow-auto",
  ].join(" ");

  return (
    <div
      className={`${containerClasses} hidden md:grid grid-cols-4 gap-4 px-4 pt-4 md:h-[calc(110vh-4rem)]`}
    >
      {/* ─── HEADER BAR ───────────────────────────────────────────── */}
      <motion.div
        className="col-span-4 flex justify-between items-center px-4 py-3 bg-gray-800/60 backdrop-blur-sm sticky top-0 z-10"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          IPL Auction • User Panel
        </h1>
        <button
          onClick={toggleFullScreen}
          className="px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-xs sm:text-sm transition-all duration-200 flex items-center gap-2"
        >
          {fullScreen ? (
            <>
              <span>Exit Full Screen</span> <span className="text-lg">↗️</span>
            </>
          ) : (
            <>
              <span>Full Screen</span> <span className="text-lg">↘️</span>
            </>
          )}
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
              {info?.price ?? "--/--"} — {info?.team ?? "--/--"}
            </p>
          </motion.div>
        ))}

        {/* ─ Current Player Details ─ */}
        <motion.div
          className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 w-full max-w-md text-center shadow-xl border border-indigo-600/30"
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
          <p className="mt-3 text-base font-semibold bg-blue-900/50 py-1 rounded-lg border border-blue-700">
            Base Price: ₹
            {auctionData.currentPlayer?.basePrice?.toLocaleString() ?? "--/--"}
          </p>
        </motion.div>
      </div>

      {/* ─── MIDDLE COLUMN ───────────────────────────────────────── */}
      <div className="col-span-2 flex flex-col items-center space-y-4">
        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-2 justify-center w-full">
          <motion.button
            onClick={() => navigate("/user/teams-list")}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            Teams List
          </motion.button>
          <motion.button
            onClick={() => navigate("/user/players-list")}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            Players List
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
            ₹{auctionData.team?.remaining?.toLocaleString() ?? "--/--"}
          </p>
        </motion.div>

        {/* Bid Now */}
        <motion.div
          className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg w-full max-w-md text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xs font-medium mb-1">Bid Now</h3>
          <BidButton onClick={handleBid} />
          <p className="mt-1 text-xs opacity-75">
            Price: ₹{auctionData.bidAmount?.toLocaleString() ?? "--/--"}
          </p>
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
            ₹{auctionData.bidAmount?.toLocaleString() ?? "--/--"}
          </motion.div>
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 border border-gray-500">
              {auctionData.currentBid?.teamLogo ? (
                <img
                  src={auctionData.currentBid.teamLogo}
                  alt={auctionData.currentBid.team}
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
          {/* <button
            onClick={() => {
              if (rtmCount > 0) setRtmCount((c) => c - 1);
              else alert("No RTMs left");
            }}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 rounded-xl text-white font-medium text-sm shadow-md w-full"
          >
            RTM-{rtmCount}
          </button> */}
          <button
            onClick={handleUseRTM}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 rounded-xl text-white font-medium text-sm shadow-md w-full"
          >
            RTM-{rtmCount}
          </button>
          <p className="mt-1 text-xs opacity-75">RTMs Remaining: {rtmCount}</p>
        </motion.div>
      </div>

      {/* ─── RIGHT COLUMN ─────────────────────────────────────────── */}
      <div className="col-span-1 flex flex-col justify-between h-full">
        <div className="mb-4">
          <CriteriaTable />
        </div>
        <motion.div
          className="bg-gradient-to-br mb-4  from-indigo-900/50 to-blue-800/50 rounded-xl text-center shadow-lg self-end  border border-indigo-700/30"
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
    </div>
  );
}
