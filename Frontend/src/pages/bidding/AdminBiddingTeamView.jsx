import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../userManagement/Api";
import toast from "react-hot-toast";

export default function AdminBiddingTeamView() {
  const { id, teamId } = useParams(); // Now expecting both auction ID and team ID
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("TEam ID", teamId);
  console.log("Auction ID", id);
  // modal state
  const [modalPlayers, setModalPlayers] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch auction details to get the specific team data
        const auctionRes = await api.get(`/get-auction/${id}`);
        const auction = auctionRes.data;

        // Find the specific team from selectedTeams
        const selectedTeam = auction.selectedTeams.find(
          (t) => t._id === teamId
        );
        console.log("SELECTED TEAM", selectedTeam);
        if (!selectedTeam) {
          throw new Error("Team not found in this auction");
        }

        // Get players bought by this team from biddingHistory
        const teamPlayers = (auction.biddingHistory || [])
          .filter((bid) => bid.team && bid.team._id === teamId)
          .map((bid) => ({
            name: bid.player.name,
            role: bid.player.role,
            price: bid.bidAmount,
            playerDetails: bid.player,
          }));
        // Calculate remaining purse
        const totalSpent = teamPlayers.reduce(
          (sum, player) => sum + player.price,
          0
        );
        const remainingPurse = selectedTeam.purse - totalSpent;

        setAuctionDetails(auction);
        setTeam({
          ...selectedTeam,
          players: teamPlayers,
          remainingPurse: remainingPurse,
          totalSpent: totalSpent,
          manager: {
            name: selectedTeam.managerName || "Team Manager",
            photoUrl: selectedTeam.managerPhoto || "/manager-placeholder.jpg",
          },
        });
      } catch (err) {
        console.error("Failed to load team data:", err);
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Could not load team data"
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Loading team data…</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(`/admin/admin-bidding-dashboard/${id}/teams`)}
          className="inline-flex items-center text-blue-500 mb-4"
        >
          <FiChevronLeft className="mr-1" /> Back to Teams
        </button>
        <p className="text-center text-gray-600">
          Team not found in this auction.
        </p>
      </div>
    );
  }

  // derived stats
  const totalTaken = team.players.length;
  const batsmen = team.players.filter((p) => p.role === "Batsman");
  const bowlers = team.players.filter((p) => p.role === "Bowler");
  const allrounders = team.players.filter((p) => p.role === "All-Rounder");
  const wicketKeepers = team.players.filter((p) => p.role === "Wicket-Keeper");

  const openModal = (title, list) => {
    setModalTitle(title);
    setModalPlayers(list);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <FiChevronLeft className="mr-1" /> Back to Teams
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">
            {auctionDetails?.auctionName}
          </h1>
          <p className="text-sm text-gray-600">Team Details</p>
        </div>
        <motion.button
          onClick={() => navigate(`/admin/admin-bidding-dashboard/${id}`)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-400 text-white rounded-lg shadow-md hover:from-green-600 hover:to-teal-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go to Auction
        </motion.button>
      </motion.div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden md:flex"
        >
          {/* Team Logo */}
          <motion.div
            className="md:w-1/3 bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: team.logoUrl ? `url(${team.logoUrl})` : "none",
              backgroundColor: team.logoUrl ? "transparent" : "#f3f4f6",
              minHeight: "240px",
            }}
            whileHover={{ scale: 1.02 }}
          >
            {!team.logoUrl && (
              <div className="text-gray-400 text-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <p>No Logo</p>
              </div>
            )}
          </motion.div>

          {/* Info and Manager */}
          <div className="md:w-2/3 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Team Details */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                {team.teamName}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Short Name", team.shortName],
                  ["Total Purse", `₹${Number(team.purse).toLocaleString()}`],
                  [
                    "Total Spent",
                    `₹${Number(team.totalSpent
                    ).toLocaleString()}`,
                  ],
                  [
                    "Remaining Purse",
                    `₹${Number(team.remainingPurse).toLocaleString()}`,
                  ],
                  ["Players Bought", totalTaken],
                ].map(([label, val]) => (
                  <div key={label}>
                    <h4 className="text-sm font-semibold text-gray-700">
                      {label}
                    </h4>
                    <p
                      className={`mt-1 ${
                        label === "Players Bought" && totalTaken > 0
                          ? "cursor-pointer underline text-blue-600"
                          : ""
                      } text-gray-800`}
                      onClick={() =>
                        label === "Players Bought" &&
                        totalTaken > 0 &&
                        openModal("All Players", team.players)
                      }
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Role Counts */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  ["Batsmen", batsmen, "bg-blue-100", "text-blue-800"],
                  ["Bowlers", bowlers, "bg-green-100", "text-green-800"],
                  [
                    "All-Rounders",
                    allrounders,
                    "bg-yellow-100",
                    "text-yellow-800",
                  ],
                  [
                    "Wicket-Keepers",
                    wicketKeepers,
                    "bg-purple-100",
                    "text-purple-800",
                  ],
                ].map(([lbl, list, bg, textColor]) => (
                  <motion.div
                    key={lbl}
                    className={`${bg} p-3 rounded-lg ${
                      list.length > 0 ? "cursor-pointer" : ""
                    } text-center`}
                    whileHover={list.length > 0 ? { scale: 1.05 } : {}}
                    onClick={() => list.length > 0 && openModal(lbl, list)}
                  >
                    <h5 className={`text-sm font-medium ${textColor}`}>
                      {lbl}
                    </h5>
                    <p className={`text-xl font-bold ${textColor}`}>
                      {list.length}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Manager */}
            <motion.div
              className="flex flex-col items-center lg:items-end space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center overflow-hidden">
                {team.manager.photoUrl !== "/manager-placeholder.jpg" ? (
                  <img
                    src={team.manager.photoUrl}
                    alt={team.manager.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-2xl">👤</div>
                  </div>
                )}
              </div>
              <h4 className="text-xl font-semibold text-gray-900">
                {team.manager.name}
              </h4>
              <p className="text-sm text-gray-600">Team Manager</p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg w-11/12 max-w-lg p-6 relative max-h-96"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
              <h3 className="text-xl font-semibold mb-4">{modalTitle}</h3>
              <div className="max-h-60 overflow-y-auto">
                {modalPlayers.length > 0 ? (
                  <ul className="space-y-3">
                    {modalPlayers.map((player, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center p-2 border-b border-gray-100"
                      >
                        <div>
                          <span className="font-medium">{player.name}</span>
                          <span className="text-sm text-gray-500 block">
                            {player.role}
                          </span>
                        </div>
                        <span className="font-semibold text-green-600">
                          ₹{Number(player.price).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No players in this category
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
