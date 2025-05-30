import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../userManagement/Api";
import toast from "react-hot-toast";

export default function AdminBiddingTeamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // modal state
  const [modalPlayers, setModalPlayers] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await api.get(`/get-team/${id}`);
        setTeam({
          ...res.data,
          manager: {
            name: "Alex Ferguson",
            photoUrl: "/manager-placeholder.jpg"
          },
          players: [
            { name: "Player A", role: "Batsman" },
            { name: "Player B", role: "Bowler" },
            { name: "Player C", role: "All-Rounder" },
            { name: "Player D", role: "Batsman" },
            { name: "Player E", role: "Bowler" },
          ],
          remainingPurse: res.data.purse * 0.4
        });
      } catch (err) {
        console.error("Failed to load team:", err);
        toast.error(err.response?.data?.error || "Could not load team data");
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Loading team…</p>
      </div>
    );
  }
  if (!team) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-blue-500 mb-4">
          <FiChevronLeft className="mr-1"/> Back
        </button>
        <p className="text-center text-gray-600">Team not found.</p>
      </div>
    );
  }

  // derived stats
  const totalTaken = team.players.length;
  const batsmen    = team.players.filter(p => p.role === "Batsman");
  const bowlers    = team.players.filter(p => p.role === "Bowler");
  const allrounders= team.players.filter(p => p.role === "All-Rounder");
  const openModal  = (title, list) => {
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
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-500 hover:text-blue-700">
          <FiChevronLeft className="mr-1"/> Back
        </button>
        <motion.button
          onClick={() => navigate("/admin/admin-bidding-dashboard")}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-400 text-white rounded-lg shadow-md hover:from-green-600 hover:to-teal-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Move to Bid
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
            className="md:w-1/3 bg-cover bg-center"
            style={{ backgroundImage: `url(${team.logoUrl||"/default-logo.png"})`, minHeight: "240px" }}
            whileHover={{ scale: 1.02 }}
          />

          {/* Info and Manager */}
          <div className="md:w-2/3 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Team Details */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">{team.teamName}</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Short Name", team.shortName],
                  ["Total Purse", `₹${Number(team.purse).toLocaleString()}`],
                  ["Remaining Purse", `₹${Number(team.remainingPurse).toLocaleString()}`],
                  ["Players Taken", totalTaken]
                ].map(([label, val]) => (
                  <div key={label}>
                    <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
                    <p
                      className={`mt-1 ${label==="Players Taken"?"cursor-pointer underline":""} text-gray-800`}
                      onClick={()=> label==="Players Taken" && openModal("All Players", team.players)}
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Role Counts */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  ["Batsmen", batsmen, "bg-blue-100"],
                  ["Bowlers", bowlers, "bg-green-100"],
                  ["All-Rounders", allrounders, "bg-yellow-100"]
                ].map(([lbl,list,bg]) => (
                  <motion.div
                    key={lbl}
                    className={`${bg} p-4 rounded-lg cursor-pointer flex-1 text-center`}
                    whileHover={{ scale: 1.05 }}
                    onClick={()=>openModal(lbl,list)}
                  >
                    <h5 className="text-sm font-medium text-gray-700">{lbl}</h5>
                    <p className="text-2xl font-bold text-gray-900">{list.length}</p>
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
              <img
                src={team.manager.photoUrl}
                alt={team.manager.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md"
              />
              <h4 className="text-xl font-semibold text-gray-900">{team.manager.name}</h4>
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
              className="bg-white rounded-lg w-11/12 max-w-md p-6 relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FiX size={20}/>
              </button>
              <h3 className="text-xl font-semibold mb-4">{modalTitle}</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {modalPlayers.map((p,i) => (
                  <li key={i} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-sm text-gray-500">{p.role}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
