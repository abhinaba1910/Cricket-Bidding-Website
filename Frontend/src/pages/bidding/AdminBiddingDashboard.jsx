import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function AdminBiddingDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // <— import useLocation
  const incoming = location.state?.selectedPlayers || [];
  const { id }=useParams();

  // --- sample data ---
  const sampleAuction = {
    lastSold: { name: "N. Sciver-Brunt", price: "5 CR", team: "Mumbai" },
    mostExpensive: { name: "N. Sciver-Brunt", price: "5 CR", team: "Mumbai" },
    currentLot: {
      id: "lot1",
      name: "Sabbineni Meghana",
      role: "Batter",
      batting: "RHB",
      bowling: "Right Arm Medium",
      basePrice: "30L",
      avatarUrl: null,
    },
    currentBid: {
      amount: "35L",
      team: "Chennai Super Kings",
      teamLogo: "/logos/csk.png",
    },
  };

  // --- local state & handlers ---

  const [status, setStatus] = useState("live");
  const [showEdit, setShowEdit] = useState(false);
  const [bidAmount, setBidAmount] = useState(sampleAuction.currentBid.amount);
  const [fullScreen, setFullScreen] = useState(false);
  const [selectionMode, setSelectionMode] = useState("automatic");
  const [role, setRole] = useState("Batsman");

  // ** NEW EFFECT ** watch for incoming picks
  useEffect(() => {
    if (incoming.length > 0) {
      setSelectionMode("manual");
    }
  }, [incoming]);

  const toggleFullScreen = () => setFullScreen((fs) => !fs);
  const onStopBidding = () => setStatus("paused");
  // const onResumeBidding    = () => setStatus('live');
  const onSell = () => setStatus("selling");
  const onMoveToUnsell = () => setStatus("live");

  // const onPauseAuction     = onStopBidding;
  const onEditBid = () => setShowEdit(true);
  const onApplyBid = () => setShowEdit(false);
  const onResetBid = () => {
    setBidAmount(sampleAuction.currentBid.amount);
    setShowEdit(false);
  };
  // Toggle between live and paused
  const togglePause = () => {
    setStatus((prev) => (prev === "live" ? "paused" : "live"));
  };

  const handleManualSelect = () => {
    navigate("/admin/admin-manual-player-selection");
  };

  const containerClasses = [
    " p-4 text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
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
            {[
              ["Last Sold", sampleAuction.lastSold],
              ["Most Expensive", sampleAuction.mostExpensive],
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
              {sampleAuction.currentLot.name}
            </h2>
            <p className="text-sm bg-blue-600/30 inline-block px-2 py-1 rounded-full mt-1">
              {sampleAuction.currentLot.role}
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <div>
                <span className="text-xs opacity-75">Bat</span>
                <p className="text-sm">{sampleAuction.currentLot.batting}</p>
              </div>
              <div>
                <span className="text-xs opacity-75">Ball</span>
                <p className="text-sm">{sampleAuction.currentLot.bowling}</p>
              </div>
            </div>
            <p className="mt-3 text-base font-semibold bg-blue-900/50 py-1 rounded-lg">
              Base Price: {sampleAuction.currentLot.basePrice}
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
                {sampleAuction.currentLot.name}
              </h2>
              <p className="text-xs bg-blue-600/30 inline-block px-2 py-0.5 rounded-full">
                {sampleAuction.currentLot.role}
              </p>
              <p className="mt-1 text-[10px] opacity-75">
                Bat: {sampleAuction.currentLot.batting}
              </p>
              <p className="text-[10px] opacity-75">
                Ball: {sampleAuction.currentLot.bowling}
              </p>
              <p className="mt-1 text-xs font-semibold bg-blue-900/30 py-0.5 rounded">
                Base: {sampleAuction.currentLot.basePrice}
              </p>
            </div>

            {/* Bid Team Info Card */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center flex flex-col justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
              <p className="text-[10px] opacity-75 mt-1">Bid By</p>
              <h3 className="text-xs font-semibold truncate">
                {sampleAuction.currentBid.team}
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
              {sampleAuction.currentBid.team}
            </h3>
          </motion.div>
        </div>
      </div>

      {/* === Mobile-only Bottom Section === */}
      <div className="md:hidden mt-4 space-y-4">
        {/* Enhanced Selection Mode Toggle */}
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

        {/* Last Sold & Most Expensive (Mobile) */}
        <div className="flex gap-3">
          {[
            ["Last Sold", sampleAuction.lastSold],
            ["Most Expensive", sampleAuction.mostExpensive],
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

















// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useNavigate, useLocation, useParams } from "react-router-dom"; // Added useParams
// import axios from "axios";
// import api from "../../userManagement/Api";

// export default function AdminBiddingDashboard() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { id} = useParams(); // Get auctionId from URL params
//   const incoming = location.state?.selectedPlayers || [];

//   let auctionId=id;
//   // State for auction data
//   const [auctionData, setAuctionData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // --- local state & handlers ---
//   const [status, setStatus] = useState("live");
//   const [showEdit, setShowEdit] = useState(false);
//   const [bidAmount, setBidAmount] = useState("");
//   const [fullScreen, setFullScreen] = useState(false);
//   const [selectionMode, setSelectionMode] = useState("automatic");
//   const [role, setRole] = useState("Batsman");

//   // Fetch auction data - using auctionId from params
//   useEffect(() => {
//     const fetchAuctionData = async () => {
//       try {
//         const response = await api.get(`/get-auction/${auctionId}`);

//         console.log("RESPONSE",response.data)
//         setAuctionData(response.data);
        
//         // Set initial bid amount if there's a current bid
//         if (response.data.currentBid) {
//           setBidAmount(response.data.currentBid.bidAmount || "");
//         }

//         // Set auction status
//         if (response.data.isPaused) {
//           setStatus("paused");
//         } else {
//           setStatus(response.data.status === "live" ? "live" : "selling");
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching auction data:", err);
//         setError(err.response?.data?.message || "Failed to fetch auction data");
//         setLoading(false);
//       }
//     };

//     if (auctionId) {
//       fetchAuctionData();
//     }
//   }, [auctionId]);

//   console.log(auctionId)
//   // ** Watch for incoming picks
//   useEffect(() => {
//     if (incoming.length > 0) {
//       setSelectionMode("manual");
//     }
//   }, [incoming]);

//   // Format price for display
//   const formatPrice = (price) => {
//     if (!price) return "0";
//     if (price >= 10000000) return `${(price / 10000000).toFixed(2)} CR`;
//     if (price >= 100000) return `${(price / 100000).toFixed(2)} L`;
//     return `${price}`;
//   };

//   // Get sample data from auctionData
//   const getSampleAuction = () => {
//     if (!auctionData) return null;

//     return {
//       lastSold: auctionData.lastSoldPlayer ? {
//         name: auctionData.lastSoldPlayer.player?.name || "N/A",
//         price: formatPrice(auctionData.lastSoldPlayer.bidAmount),
//         team: auctionData.lastSoldPlayer.team?.teamName || "N/A"
//       } : { name: "N/A", price: "0", team: "N/A" },

//       mostExpensive: auctionData.mostExpensivePlayer ? {
//         name: auctionData.mostExpensivePlayer.player?.name || "N/A",
//         price: formatPrice(auctionData.mostExpensivePlayer.bidAmount),
//         team: auctionData.mostExpensivePlayer.team?.teamName || "N/A"
//       } : { name: "N/A", price: "0", team: "N/A" },

//       currentLot: auctionData.currentPlayerOnBid ? {
//         id: auctionData.currentPlayerOnBid._id,
//         name: auctionData.currentPlayerOnBid.name ,
//         role: auctionData.currentPlayerOnBid.role || "N/A",
//         batting: auctionData.currentPlayerOnBid.battingStyle || "N/A",
//         bowling: auctionData.currentPlayerOnBid.bowlingStyle || "N/A",
//         basePrice: formatPrice(auctionData.currentPlayerOnBid.basePrice),
//         avatarUrl: auctionData.currentPlayerOnBid.avatarUrl
//       } : null,

//       currentBid: auctionData.currentBid ? {
//         amount: formatPrice(auctionData.currentBid.bidAmount),
//         team: auctionData.currentBid.team?.teamName || "N/A",
//         teamLogo: auctionData.currentBid.team?.logo || "/logos/default.png"
//       } : null
//     };
//   };

//   const sampleAuction = getSampleAuction() || {
//     lastSold: { name: "N/A", price: "0", team: "N/A" },
//     mostExpensive: { name: "N/A", price: "0", team: "N/A" },
//     currentLot: {
//       id: "lot1",
//       name: "No player on bid",
//       role: "N/A",
//       batting: "N/A",
//       bowling: "N/A",
//       basePrice: "0",
//       avatarUrl: null,
//     },
//     currentBid: {
//       amount: "0",
//       team: "No bids yet",
//       teamLogo: "/logos/default.png",
//     },
//   };

//   const toggleFullScreen = () => setFullScreen((fs) => !fs);
//   const onStopBidding = () => setStatus("paused");
//   const onSell = () => setStatus("selling");
//   const onMoveToUnsell = () => setStatus("live");

//   const onEditBid = () => setShowEdit(true);
//   const onApplyBid = () => {
//     // Here you would typically make an API call to update the bid
//     setShowEdit(false);
//   };
//   const onResetBid = () => {
//     setBidAmount(sampleAuction.currentBid.amount);
//     setShowEdit(false);
//   };

//   // Toggle between live and paused
//   const togglePause = async () => {
//     try {
//       const newStatus = status === "live" ? "paused" : "live";
//       await api.put(`/update-status/${auctionId}`, {
//         status: newStatus,
//         isPaused: newStatus === "paused"
//       }, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       setStatus(newStatus);
//     } catch (err) {
//       console.error("Error updating auction status:", err);
//     }
//   };

//   const handleManualSelect = () => {
//     navigate("/admin/admin-manual-player-selection", { 
//       state: { 
//         auctionId: auctionId,
//         selectedPlayers: auctionData?.selectedPlayers || [] 
//       } 
//     });
//   };

//   const containerClasses = [
//     " p-4 text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
//     fullScreen
//       ? "fixed inset-0 z-[9999] overflow-auto"
//       : "relative mx-auto max-w-7xl",
//   ].join(" ");

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
//         <div className="text-white text-2xl">Loading auction data...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
//         <div className="text-red-400 text-xl">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className={containerClasses + " pt-2 md:pt-4"}>
//       {/* Full-screen toggle */}
//       <div className="flex justify-end mb-3">
//         <button
//           onClick={toggleFullScreen}
//           className="px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-xs sm:text-sm transition-all duration-200"
//         >
//           {fullScreen ? "Exit Full Screen" : "Full Screen"}
//         </button>
//       </div>

//       {/* Responsive grid: 1-col mobile, 4-col md+ */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(85vh-4rem)]">
//         {/* === Left Sidebar (desktop only) === */}
//         <div className="hidden md:flex flex-col space-y-4 md:h-full md:justify-between">
//           <div>
//             {[
//               ["Last Sold", sampleAuction.lastSold],
//               ["Most Expensive", sampleAuction.mostExpensive],
//             ].map(([title, info]) => (
//               <motion.div
//                 key={title}
//                 className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 mt-2 text-sm shadow-lg"
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <h4 className="uppercase text-xs font-medium tracking-wider">
//                   {title}
//                 </h4>
//                 <p className="font-semibold text-sm mt-1">{info.name}</p>
//                 <p className="text-xs opacity-80">
//                   {info.price} — {info.team}
//                 </p>
//               </motion.div>
//             ))}
//           </div>

//           {/* Bottom item only on desktop */}
//           {sampleAuction.currentLot?(<motion.div
//             className="bg-gradient-to-br from-indigo-800 to-blue-700 rounded-xl p-4 text-center shadow-xl"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             <h2 className="font-bold text-lg sm:text-xl">
//               {sampleAuction.currentLot.name}
//             </h2>
//             <p className="text-sm bg-blue-600/30 inline-block px-2 py-1 rounded-full mt-1">
//               {sampleAuction.currentLot.role}
//             </p>
//             <div className="mt-3 flex justify-center gap-4">
//               <div>
//                 <span className="text-xs opacity-75">Bat</span>
//                 <p className="text-sm">{sampleAuction.currentLot.batting}</p>
//               </div>
//               <div>
//                 <span className="text-xs opacity-75">Ball</span>
//                 <p className="text-sm">{sampleAuction.currentLot.bowling}</p>
//               </div>
//             </div>
//             <p className="mt-3 text-base font-semibold bg-blue-900/50 py-1 rounded-lg">
//               Base Price: {sampleAuction.currentLot.basePrice}
//             </p>
//           </motion.div>):(  <h2 className="font-bold text-lg sm:text-xl">No player on bid</h2>)}
//         </div>

//         {/* === Center Section === */}
//         <div className="md:col-span-2 flex flex-col items-center space-y-4">
//           {/* Top Buttons */}
//           <div className="flex flex-wrap gap-2 justify-center">
//             <motion.button
//               onClick={() => navigate(`/bidding/players-list/${auctionId}`)}
//               className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Player List
//             </motion.button>

//             <motion.button
//               onClick={() => navigate(`/admin/bidding-teams-list/${auctionId}`)}
//               className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Teams
//             </motion.button>
//             <motion.button
//               onClick={togglePause}
//               className={`w-24 rounded-xl py-2 text-xs sm:text-sm shadow-md transition md:hidden ${
//                 status === "live"
//                   ? "bg-amber-500 hover:bg-amber-600 text-white md:hidden"
//                   : "bg-green-500 hover:bg-green-600 text-white md:hidden"
//               }`}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               {status === "live" ? "Pause Auction" : "Resume Auction"}
//             </motion.button>
//           </div>

//           <div className="flex flex-wrap gap-2 justify-center">
//             <motion.button
//               onClick={onEditBid}
//               className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Edit Bid
//             </motion.button>
//             <motion.button
//               onClick={onResetBid}
//               className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-red-700 hover:to-orange-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Reset Bid
//             </motion.button>
//           </div>

//           {/* Avatar & Current Bid */}
//           <motion.div
//             className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 text-center w-full max-w-md shadow-xl"
//             initial={{ scale: 0.95 }}
//             animate={{ scale: 1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           >
//             <div className="mx-auto mb-4 rounded-full bg-gray-700 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center overflow-hidden">
//               {sampleAuction.currentLot.avatarUrl ? (
//                 <img 
//                   src={sampleAuction.currentLot.avatarUrl} 
//                   alt={sampleAuction.currentLot.name}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-4xl">👤</span>
//               )}
//             </div>
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ delay: 0.3, type: "spring" }}
//               className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 px-6 py-3 font-bold text-xl sm:text-2xl text-black shadow-lg"
//             >
//               {bidAmount}
//             </motion.div>
//           </motion.div>

//           {/* MOBILE ONLY: Player Details and Bid Team Info side-by-side */}
//           <div className="md:hidden w-full max-w-md grid grid-cols-2 gap-3">
//             {/* Player Details Card */}
//             <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center">
//               <h2 className="font-bold text-sm truncate">
//                 {sampleAuction.currentLot.name}
//               </h2>
//               <p className="text-xs bg-blue-600/30 inline-block px-2 py-0.5 rounded-full">
//                 {sampleAuction.currentLot.role}
//               </p>
//               <p className="mt-1 text-[10px] opacity-75">
//                 Bat: {sampleAuction.currentLot.batting}
//               </p>
//               <p className="text-[10px] opacity-75">
//                 Ball: {sampleAuction.currentLot.bowling}
//               </p>
//               <p className="mt-1 text-xs font-semibold bg-blue-900/30 py-0.5 rounded">
//                 Base: {sampleAuction.currentLot.basePrice}
//               </p>
//             </div>

//             {/* Bid Team Info Card */}
//             <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center flex flex-col justify-center">
//               <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center overflow-hidden">
//                 {sampleAuction.currentBid.teamLogo ? (
//                   <img 
//                     src={sampleAuction.currentBid.teamLogo} 
//                     alt={sampleAuction.currentBid.team}
//                     className="w-full h-full object-contain"
//                   />
//                 ) : (
//                   <span className="text-xs text-gray-500">Team Logo</span>
//                 )}
//               </div>
//               <p className="text-[10px] opacity-75 mt-1">Bid By</p>
//               <h3 className="text-xs font-semibold truncate">
//                 {sampleAuction.currentBid.team}
//               </h3>
//             </div>
//           </div>
//           <div className="flex gap-4 mt-4">
//             <motion.button
//               onClick={onSell}
//               className="w-32 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:from-green-700 hover:to-emerald-600 text-sm  sm:text-sm shadow-lg"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Sell
//             </motion.button>
//             <motion.button
//               onClick={onMoveToUnsell}
//               className=" md:hidden px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-orange-700 hover:to-red-600 text-sm shadow-lg"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Move to Unsell
//             </motion.button>
//           </div>
//         </div>

//         {/* === Right Sidebar (desktop only) === */}
//         <div className="hidden md:flex space-y-4 md:col-span-1 md:h-full md:flex-col md:justify-between">
//           <div className="space-y-3">
//             <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
//               <h3 className="text-sm font-semibold mb-3 text-center">
//                 Player Selection
//               </h3>

//               {/* Toggle Switch */}
//               <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
//                 <motion.div
//                   className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
//                     selectionMode === "automatic"
//                       ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
//                       : "bg-gradient-to-r from-amber-500 to-orange-400"
//                   }`}
//                   animate={{
//                     left: selectionMode === "automatic" ? "0" : "50%",
//                   }}
//                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 />

//                 <button
//                   onClick={() => setSelectionMode("automatic")}
//                   className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                     selectionMode === "automatic"
//                       ? "text-white"
//                       : "text-gray-300"
//                   }`}
//                 >
//                   Auto
//                 </button>

//                 <button
//                   onClick={() => {
//                     setSelectionMode("manual");
//                     handleManualSelect();
//                   }}
//                   className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                     selectionMode === "manual" ? "text-white" : "text-gray-300"
//                   }`}
//                 >
//                   Manual
//                 </button>
//               </div>

//               {/* Role Selector */}
//               {selectionMode === "automatic" && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   transition={{ duration: 0.3 }}
//                   className="mt-3"
//                 >
//                   <label className="text-xs block mb-1 opacity-80">
//                     Select Role:
//                   </label>
//                   <select
//                     value={role}
//                     onChange={(e) => setRole(e.target.value)}
//                     className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="Batsman">Batsman</option>
//                     <option value="Bowler">Bowler</option>
//                     <option value="All-Rounder">All-Rounder</option>
//                     <option value="Wicket-Keeper">Wicket-Keeper</option>
//                   </select>
//                 </motion.div>
//               )}
//             </div>

//             <motion.button
//               onClick={onMoveToUnsell}
//               className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:from-purple-700 hover:to-indigo-600 text-sm shadow-lg"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Move to Unsell
//             </motion.button>
//             <motion.button
//               onClick={togglePause}
//               className={`w-full px-4 py-2 rounded text-xs sm:text-sm shadow-md transition ${
//                 status === "live"
//                   ? "bg-amber-500 hover:bg-amber-600 text-white"
//                   : "bg-green-500 hover:bg-green-600 text-white"
//               }`}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               {status === "live" ? "Pause Auction" : "Resume Auction"}
//             </motion.button>
//           </div>

//           <motion.div
//             className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 text-center shadow-lg"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center overflow-hidden">
//               {sampleAuction.currentBid.teamLogo ? (
//                 <img 
//                   src={sampleAuction.currentBid.teamLogo} 
//                   alt={sampleAuction.currentBid.team}
//                   className="w-full h-full object-contain"
//                 />
//               ) : (
//                 <span className="text-xs text-gray-500">Team Logo</span>
//               )}
//             </div>
//             <p className="text-xs sm:text-sm opacity-75 mt-2">Bid By</p>
//             <h3 className="text-sm sm:text-base font-semibold mt-1">
//               {sampleAuction.currentBid.team}
//             </h3>
//           </motion.div>
//         </div>
//       </div>

//       {/* === Mobile-only Bottom Section === */}
//       <div className="md:hidden mt-4 space-y-4">
//         {/* Enhanced Selection Mode Toggle */}
//         <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
//           <h3 className="text-sm font-semibold mb-3 text-center">
//             Player Selection
//           </h3>

//           <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
//             <motion.div
//               className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
//                 selectionMode === "automatic"
//                   ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
//                   : "bg-gradient-to-r from-amber-500 to-orange-400"
//               }`}
//               animate={{
//                 left: selectionMode === "automatic" ? "0" : "50%",
//               }}
//               transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             />

//             <button
//               onClick={() => setSelectionMode("automatic")}
//               className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                 selectionMode === "automatic" ? "text-white" : "text-gray-300"
//               }`}
//             >
//               Auto
//             </button>

//             <button
//               onClick={() => {
//                 setSelectionMode("manual");
//                 handleManualSelect();
//               }}
//               className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                 selectionMode === "manual" ? "text-white" : "text-gray-300"
//               }`}
//             >
//               Manual
//             </button>
//           </div>

//           {selectionMode === "automatic" && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               transition={{ duration: 0.3 }}
//               className="mt-3"
//             >
//               <label className="text-xs block mb-1 opacity-80">
//                 Select Role:
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Batsman">Batsman</option>
//                 <option value="Bowler">Bowler</option>
//                 <option value="All-Rounder">All-Rounder</option>
//                 <option value="Wicket-Keeper">Wicket-Keeper</option>
//               </select>
//             </motion.div>
//           )}
//         </div>

//         {/* Last Sold & Most Expensive (Mobile) */}
//         <div className="flex gap-3">
//           {[
//             ["Last Sold", sampleAuction.lastSold],
//             ["Most Expensive", sampleAuction.mostExpensive],
//           ].map(([title, info]) => (
//             <motion.div
//               key={title}
//               className="flex-1 bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-2 text-xs shadow-md"
//               whileHover={{ scale: 1.02 }}
//             >
//               <h4 className="uppercase text-[10px] font-medium opacity-80">
//                 {title}
//               </h4>
//               <p className="font-semibold text-xs truncate mt-1">{info.name}</p>
//               <p className="text-[10px] opacity-75">
//                 {info.price} — {info.team}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* --- Edit Bid Modal --- */}
//       {showEdit && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="w-full max-w-sm space-y-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-2xl"
//             initial={{ scale: 0.9, y: 20 }}
//             animate={{ scale: 1, y: 0 }}
//             transition={{ type: "spring" }}
//           >
//             <h2 className="text-lg font-bold text-center">Edit Bid</h2>
//             <input
//               type="text"
//               value={bidAmount}
//               onChange={(e) => setBidAmount(e.target.value)}
//               className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <div className="flex gap-3">
//               <motion.button
//                 onClick={onApplyBid}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 hover:from-green-700 hover:to-emerald-600 text-sm font-medium shadow-md"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Apply
//               </motion.button>
//               <motion.button
//                 onClick={() => setShowEdit(false)}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-2 hover:from-gray-700 hover:to-gray-600 text-sm font-medium shadow-md"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Cancel
//               </motion.button>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }