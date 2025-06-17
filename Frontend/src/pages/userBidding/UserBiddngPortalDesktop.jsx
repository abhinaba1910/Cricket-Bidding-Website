import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import BidButton from "../../components/ui/BidButton";
import CharacterCard from "../characters/CharacterCard";

import toast from "react-hot-toast";
import { FaUserTie, FaUsers } from "react-icons/fa";
import { GiMoneyStack, GiCardRandom } from "react-icons/gi";
import Api from "../../userManagement/Api";

// ─── Shared “CriteriaTable” for Desktop ────────────────────────────
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

const DesktopTeamCard = ({ team }) => {
  if (!team) return null;

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 w-full max-w-xl text-center shadow-xl border border-indigo-600/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", delay: 0.2 }}
    >
      {/* Team Logo */}
      <motion.div
        className="mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-700 to-blue-800 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center overflow-hidden border-2 border-cyan-400/30"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt="Team Logo"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <span className="text-4xl">🛡️</span>
        )}
      </motion.div>

      {/* Team Name */}
      <h2 className="text-2xl font-bold text-white tracking-wide">
        {team.teamName || "Unnamed Team"}
      </h2>

      {/* Manager Info */}
      <p className="text-sm bg-blue-600/30 inline-block px-2 py-1 rounded-full mt-1">
        Manager:{" "}
        <span className="font-semibold text-white">
          {team.manager?.username}
        </span>
      </p>

      {/* Purse & Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-white">
        <div>
          <p className="text-xs opacity-75 flex items-center justify-center gap-1">
            <GiMoneyStack /> Total Purse
          </p>
          <p className="font-semibold">
            ₹{team.purse?.toLocaleString() || "--"}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75 flex items-center justify-center gap-1">
            <GiMoneyStack /> Remaining
          </p>
          <p className="font-semibold">
            ₹{team.remaining?.toLocaleString() || "--"}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75 flex items-center justify-center gap-1">
            <FaUsers /> Players
          </p>
          <p className="font-semibold">{team.playersBought?.length || 0}</p>
        </div>
        <div>
          <p className="text-xs opacity-75 flex items-center justify-center gap-1">
            <GiCardRandom /> RTMs
          </p>
          <p className="font-semibold">{team.rtmCount || 0}</p>
        </div>
      </div>
    </motion.div>
  );
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

  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  // const openPlayerModal = () => {
  //   if (auctionData.currentPlayer) {
  //     setSelectedPlayer(auctionData.currentPlayer);
  //     console.log(auctionData.currentPlayer)
  //     setShowModal(true);
  //   }
  // };

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

  // Helper to close
  const closePlayerModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

  const [auctionData, setAuctionData] = useState(sampleAuction);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const response = await Api.get(`/bidding-portal/${id}`);
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

        setRtmCount(data.team.rtmCount);
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
      const res = await Api.post(`/place-bid/${id}`, payload);
      setEmoteToPlay(null);
      setTimeout(() => setEmoteToPlay("HandRaise"), 10);

      toast.success("Bid Placed Successfully");
      // Refresh data
      const updated = await Api.get(`/bidding-portal/${id}`);
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
      const response = await Api.post(`/use-rtm/${id}`, {
        teamId: myTeamId, // The current user's selected team ID
      });

      toast.success("RTM successful!");
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

  const nextBidAmount = auctionData.bidAmount || "--/--";

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
          onClick={openPlayerModal}
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
          {/* <motion.button
            onClick={() => navigate("/user/teams-list")}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            Teams List 
          </motion.button> */}
          <motion.button
            onClick={() => navigate(`/user-bidding-portal/${id}/players`)}
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
          <p className="mt-1 text-xs opacity-75">Price: ₹{nextBidAmount}</p>
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
            ₹{auctionData.currentBid?.amount.toLocaleString() ?? "--/--"}
          </motion.div>
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-2 border border-gray-500">
              {auctionData.currentBid?.team?.logoUrl ? (
                <img
                  src={auctionData.currentBid.team.logoUrl}
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
        <motion.div
          className="bg-gradient-to-br mb-4 from-indigo-900/50 to-blue-800/50 rounded-xl text-center shadow-lg self-stretch border border-indigo-700/30 h-[330px] overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DesktopTeamCard team={auctionData.team} />
        </motion.div>

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
      {showModal && selectedPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md"
          onClick={closePlayerModal}
        >
          <div
            className="relative w-[90%] max-w-xl rounded-3xl bg-gradient-to-tr from-[#1e1e2f] via-[#2a2a3b] to-[#1e1e2f] p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-gray-700 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-3xl font-bold transition-all duration-200"
              onClick={closePlayerModal}
            >
              &times;
            </button>

            {/* Player Image */}
            <div className="text-center">
              <img
                src={selectedPlayer.playerPic}
                alt={selectedPlayer.name}
                className="mx-auto w-32 h-32 object-cover rounded-full border-4 border-emerald-400 shadow-lg mb-4"
              />
              <h2 className="text-3xl font-bold tracking-wide text-emerald-300">
                {selectedPlayer.name}
              </h2>
              <p className="text-sm italic text-gray-400 uppercase tracking-wider mt-1">
                {selectedPlayer.role}
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="mt-5 border-t border-gray-600 opacity-40" />

            {/* Player Info */}
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-light">
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Batting Style
                </span>
                <span className="text-white font-medium">
                  {selectedPlayer.battingStyle}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Bowling Style
                </span>
                <span className="text-white font-medium">
                  {selectedPlayer.bowlingStyle}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Base Price
                </span>
                <span className="text-emerald-400 font-semibold">
                  ₹{selectedPlayer.basePrice?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Nationality
                </span>
                <span className="text-white font-medium">
                  {selectedPlayer.nationality}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">Age</span>
                <span className="text-white font-medium">
                  {selectedPlayer.age}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Matches Played
                </span>
                <span className="text-white font-medium">
                  {selectedPlayer.matchesPlayed}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Runs Scored
                </span>
                <span className="text-white font-medium">
                  {selectedPlayer.runs}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">
                  Wickets Taken
                </span>
                <span className="text-white font-medium">
                  {selectedPlayer.wickets}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
