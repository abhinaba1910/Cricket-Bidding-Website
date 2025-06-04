import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../../userManagement/Api";

// 1) SAMPLE FALLBACK DATA
//    This object lives in state until/if the backend returns real data.
//    Any values you haven’t wired yet can remain here.
const SAMPLE_AUCTION = {
  lastSold: { name: "--/--", price: "--/--", team: "--/--" },
  mostExpensive: { name: "--/--", price: "--/--", team: "--/--" },
  currentLot: {
    id: "--/--",
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
    teamLogo: "--/--",
  },
};

export default function AdminBiddingDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const incoming = location.state?.selectedPlayers || [];
  const { id } = useParams();

  // 2) STATE: hold ALL auction‐related fields in a single object
  //    Initialize with SAMPLE so the UI doesn’t break if the fetch is still pending.
  const [auctionData, setAuctionData] = useState(SAMPLE_AUCTION);

  // status / UI state
  const [status, setStatus] = useState("live");
  const [showEdit, setShowEdit] = useState(false);
  const [bidAmount, setBidAmount] = useState(SAMPLE_AUCTION.currentBid.amount);
  const [fullScreen, setFullScreen] = useState(false);
  const [selectionMode, setSelectionMode] = useState("automatic");
  const [role, setRole] = useState("Batsman");

  // 3) FETCH from BACKEND on mount
  useEffect(() => {
    // If “incoming” picks exist, switch to manual mode
    if (incoming.length > 0) {
      setSelectionMode("manual");
    }

    // Grab token from localStorage (or wherever you store it)
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found. Cannot fetch auction.");
      return;
    }

    // Fetch auction by ID
    // …inside useEffect…
    const fetchAuction = async () => {
      try {
        // No need to read localStorage.getItem("token") or set headers manually
        const res = await api.get(`/get-auction/${id}`);
        const data = res.data;
        console.log(data);

        // Merge the returned data into your existing state, falling back to SAMPLE_AUCTION
        setAuctionData((prev) => ({
          ...prev,
          lastSold: {
            name: data.lastSoldPlayer?.name || prev.lastSold.name,
            price: data.lastSoldPlayer?.bidAmount || prev.lastSold.price,
            team: data.lastSoldPlayer?.team?.shortName || prev.lastSold.team,
          },
          mostExpensive: {
            name: data.mostExpensivePlayer?.name || prev.mostExpensive.name,
            price:
              data.mostExpensivePlayer?.bidAmount || prev.mostExpensive.price,
            team:
              data.mostExpensivePlayer?.team?.shortName ||
              prev.mostExpensive.team,
          },
          currentLot: {
            id: data.currentPlayerOnBid?._id || prev.currentLot.id,
            name: data.currentPlayerOnBid?.name || prev.currentLot.name,
            role: data.currentPlayerOnBid?.role || prev.currentLot.role,
            batting:
              data.currentPlayerOnBid?.battingStyle || prev.currentLot.batting,
            bowling:
              data.currentPlayerOnBid?.bowlingStyle || prev.currentLot.bowling,
            basePrice:
              data.currentPlayerOnBid?.basePrice || prev.currentLot.basePrice,
            avatarUrl:
              data.currentPlayerOnBid?.photo || prev.currentLot.avatarUrl,
          },
          currentBid: {
            amount: data.currentBid?.amount || prev.currentBid.amount,
            team: data.currentBid?.team?.teamName || prev.currentBid.team,
            teamLogo:
              data.currentBid?.team?.logoUrl || prev.currentBid.teamLogo,
          },
        }));

        // Update bidAmount if backend provided a value
        if (data.currentBid?.amount) {
          setBidAmount(data.currentBid.amount);
        }
      } catch (err) {
        console.error("Error while fetching auction:", err);
      }
    };

    fetchAuction();
  }, [id, incoming]);

  // 4) HANDLERS / UI TOGGLES
  const toggleFullScreen = () => setFullScreen((fs) => !fs);
  const onStopBidding = () => setStatus("paused");
  const onSell = () => setStatus("selling");
  const onMoveToUnsell = () => setStatus("live");
  const onEditBid = () => setShowEdit(true);
  const onApplyBid = () => setShowEdit(false);
  const onResetBid = () => {
    setBidAmount(auctionData.currentBid.amount);
    setShowEdit(false);
  };
  const togglePause = () => {
    setStatus((prev) => (prev === "live" ? "paused" : "live"));
  };
  const handleManualSelect = () => {
    navigate(`/admin/admin-manual-player-selection/${id}`);
  };

  // 5) RENDER. Everywhere you previously used SAMPLE_AUCTION, use auctionData instead.
  const containerClasses = [
    "p-4 text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
    fullScreen
      ? "fixed inset-0 z-[9999] overflow-auto"
      : "relative mx-auto max-w-7xl",
  ].join(" ");

  return (
    <div className={containerClasses + " pt-2 md:pt-4"}>
      {/* Full-screen toggle */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleFullScreen}
          className="px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-xs sm:text-sm transition-all duration-200"
        >
          {fullScreen ? "Exit Full Screen" : "Full Screen"}
        </button>
      </div>

      {/* Responsive grid: 1-col mobile, 4-col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(85vh-4rem)]">
        {/* === Left Sidebar (desktop only) === */}
        <div className="hidden md:flex flex-col space-y-4 md:h-full md:justify-between">
          <div>
            <motion.button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md">
              Start Bidding
            </motion.button>
          </div>
          <div>
            {[
              ["Last Sold", auctionData.lastSold],
              ["Most Expensive", auctionData.mostExpensive],
            ].map(([title, info]) => (
              <motion.div
                key={title}
                className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 mt-2 text-sm shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h4 className="uppercase text-xs font-medium tracking-wider">
                  {title}
                </h4>
                <p className="font-semibold text-sm mt-1">{info.name}</p>
                <p className="text-xs opacity-80">
                  {info.price} — {info.team}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom item only on desktop */}
          <motion.div
            className="bg-gradient-to-br from-indigo-800 to-blue-700 rounded-xl p-4 text-center shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-bold text-lg sm:text-xl">
              {auctionData.currentLot.name}
            </h2>
            <p className="text-sm bg-blue-600/30 inline-block px-2 py-1 rounded-full mt-1">
              {auctionData.currentLot.role}
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <div>
                <span className="text-xs opacity-75">Bat</span>
                <p className="text-sm">{auctionData.currentLot.batting}</p>
              </div>
              <div>
                <span className="text-xs opacity-75">Ball</span>
                <p className="text-sm">{auctionData.currentLot.bowling}</p>
              </div>
            </div>
            <p className="mt-3 text-base font-semibold bg-blue-900/50 py-1 rounded-lg">
              Base Price: {auctionData.currentLot.basePrice}
            </p>
          </motion.div>
        </div>

        {/* === Center Section === */}
        <div className="md:col-span-2 flex flex-col items-center space-y-4">
          {/* Top Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              onClick={() => navigate(`/bidding/players-list/${id}`)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Player List
            </motion.button>

            <motion.button
              onClick={() => navigate(`/admin/bidding-teams-list/${id}`)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Teams
            </motion.button>
            <motion.button
              onClick={togglePause}
              className={`w-24 rounded-xl py-2 text-xs sm:text-sm shadow-md transition md:hidden ${
                status === "live"
                  ? "bg-amber-500 hover:bg-amber-600 text-white md:hidden"
                  : "bg-green-500 hover:bg-green-600 text-white md:hidden"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === "live" ? "Pause Auction" : "Resume Auction"}
            </motion.button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              onClick={onEditBid}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Bid
            </motion.button>
            <motion.button
              onClick={onResetBid}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-red-700 hover:to-orange-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset Bid
            </motion.button>
          </div>

          {/* Avatar & Current Bid */}
          <motion.div
            className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 text-center w-full max-w-md shadow-xl"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* You could replace this avatar placeholder with:
                <img src={auctionData.currentLot.avatarUrl} alt="player avatar" /> */}
            <div className="mx-auto mb-4 rounded-full bg-gray-700 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 px-6 py-3 font-bold text-xl sm:text-2xl text-black shadow-lg"
            >
              {bidAmount}
            </motion.div>
          </motion.div>

          {/* MOBILE ONLY: Player Details and Bid Team Info side-by-side */}
          <div className="md:hidden w-full max-w-md grid grid-cols-2 gap-3">
            {/* Player Details Card */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center">
              <h2 className="font-bold text-sm truncate">
                {auctionData.currentLot.name}
              </h2>
              <p className="text-xs bg-blue-600/30 inline-block px-2 py-0.5 rounded-full">
                {auctionData.currentLot.role}
              </p>
              <p className="mt-1 text-[10px] opacity-75">
                Bat: {auctionData.currentLot.batting}
              </p>
              <p className="text-[10px] opacity-75">
                Ball: {auctionData.currentLot.bowling}
              </p>
              <p className="mt-1 text-xs font-semibold bg-blue-900/30 py-0.5 rounded">
                Base: {auctionData.currentLot.basePrice}
              </p>
            </div>

            {/* Bid Team Info Card */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center flex flex-col justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
              <p className="text-[10px] opacity-75 mt-1">Bid By</p>
              <h3 className="text-xs font-semibold truncate">
                {auctionData.currentBid.team}
              </h3>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <motion.button
              onClick={onSell}
              className="w-32 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:from-green-700 hover:to-emerald-600 text-sm  sm:text-sm shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sell
            </motion.button>
            <motion.button
              onClick={onMoveToUnsell}
              className=" md:hidden px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-orange-700 hover:to-red-600 text-sm shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Move to Unsell
            </motion.button>
          </div>
        </div>

        {/* === Right Sidebar (desktop only) === */}
        <div className="hidden md:flex space-y-4 md:col-span-1 md:h-full md:flex-col md:justify-between">
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold mb-3 text-center">
                Player Selection
              </h3>

              {/* Toggle Switch */}
              <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
                    selectionMode === "automatic"
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                      : "bg-gradient-to-r from-amber-500 to-orange-400"
                  }`}
                  animate={{
                    left: selectionMode === "automatic" ? "0" : "50%",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                <button
                  onClick={() => setSelectionMode("automatic")}
                  className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                    selectionMode === "automatic"
                      ? "text-white"
                      : "text-gray-300"
                  }`}
                >
                  Auto
                </button>

                <button
                  onClick={() => {
                    setSelectionMode("manual");
                    handleManualSelect();
                  }}
                  className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                    selectionMode === "manual" ? "text-white" : "text-gray-300"
                  }`}
                >
                  Manual
                </button>
              </div>

              {/* Role Selector */}
              {selectionMode === "automatic" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-3"
                >
                  <label className="text-xs block mb-1 opacity-80">
                    Select Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-Keeper">Wicket-Keeper</option>
                  </select>
                </motion.div>
              )}
            </div>

            <motion.button
              onClick={onMoveToUnsell}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:from-purple-700 hover:to-indigo-600 text-sm shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Move to Unsell
            </motion.button>
            <motion.button
              onClick={togglePause}
              className={`w-full px-4 py-2 rounded text-xs sm:text-sm shadow-md transition ${
                status === "live"
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === "live" ? "Pause Auction" : "Resume Auction"}
            </motion.button>
          </div>

          <motion.div
            className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 text-center shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
            <p className="text-xs sm:text-sm opacity-75 mt-2">Bid By</p>
            <h3 className="text-sm sm:text-base font-semibold mt-1">
              {auctionData.currentBid.team}
            </h3>
          </motion.div>
        </div>
      </div>

      {/* === Mobile-only Bottom Section === */}
      <div className="md:hidden mt-4 space-y-4">
        <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-semibold mb-3 text-center">
            Player Selection
          </h3>

          <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
            <motion.div
              className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
                selectionMode === "automatic"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                  : "bg-gradient-to-r from-amber-500 to-orange-400"
              }`}
              animate={{
                left: selectionMode === "automatic" ? "0" : "50%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />

            <button
              onClick={() => setSelectionMode("automatic")}
              className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                selectionMode === "automatic" ? "text-white" : "text-gray-300"
              }`}
            >
              Auto
            </button>

            <button
              onClick={() => {
                setSelectionMode("manual");
                handleManualSelect();
              }}
              className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                selectionMode === "manual" ? "text-white" : "text-gray-300"
              }`}
            >
              Manual
            </button>
          </div>

          {selectionMode === "automatic" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <label className="text-xs block mb-1 opacity-80">
                Select Role:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">Wicket-Keeper</option>
              </select>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3">
          {[
            ["Last Sold", auctionData.lastSold],
            ["Most Expensive", auctionData.mostExpensive],
          ].map(([title, info]) => (
            <motion.div
              key={title}
              className="flex-1 bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-2 text-xs shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="uppercase text-[10px] font-medium opacity-80">
                {title}
              </h4>
              <p className="font-semibold text-xs truncate mt-1">{info.name}</p>
              <p className="text-[10px] opacity-75">
                {info.price} — {info.team}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Edit Bid Modal --- */}
      {showEdit && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-full max-w-sm space-y-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring" }}
          >
            <h2 className="text-lg font-bold text-center">Edit Bid</h2>
            <input
              type="text"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <motion.button
                onClick={onApplyBid}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 hover:from-green-700 hover:to-emerald-600 text-sm font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply
              </motion.button>
              <motion.button
                onClick={() => setShowEdit(false)}
                className="flex-1 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-2 hover:from-gray-700 hover:to-gray-600 text-sm font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
