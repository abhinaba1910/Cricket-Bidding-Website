import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiEye, FiEdit, FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import Api from "../../userManagement/Api";

export default function TeamsInfo() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await Api.get("/get-teams");
        // Add playerCount to each team object
        const teamsWithPlayerCount = res.data.map((team) => ({
          ...team,
          playerCount: team.players?.length || 0,
        }));
        setTeams(teamsWithPlayerCount);
      } catch (err) {
        console.error(
          "Error fetching teams:",
          err.response?.data || err.message
        );
        alert("Failed to fetch teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return teams.filter(
      (t) =>
        t._id.includes(search) ||
        t.teamName.toLowerCase().includes(term) ||
        t.shortName.toLowerCase().includes(term)
    );
  }, [search, teams]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:pb-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <div className="flex-1 md:flex-none flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
            />
          </div>
          <a
            href="/create-team"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            <FiPlus className="mr-2" /> Add Team
          </a>
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading teams...</p>
      ) : (
        <AnimatePresence>
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((team) => (
                <motion.div
                  key={team._id}
                  className="bg-white rounded-xl shadow p-6 flex flex-col"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={team.logoUrl}
                    alt={team.shortName}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 text-center">
                    {team.teamName}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    {/* ID: {team._id} */}
                  </p>
                  <div className="text-sm text-gray-700 space-y-1 flex-1">
                    <p>
                      <strong>Short Name:</strong> {team.shortName}
                    </p>
                    <p>
                      <strong>Purse:</strong> ₹
                      {Number(team.purse).toLocaleString()}
                    </p>
                    <p>
                      <strong>Players Bought:</strong> {team.playerCount}
                    </p>
                    <p>
                      <strong>Remaining Purse:</strong> ₹
                      {Number(team.remaining).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`/admin/teams/${team._id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                    >
                      <FiEye className="mr-1" /> View
                    </a>
                    <a
                      href={`/admin/teams/${team._id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                    >
                      <FiEdit className="mr-1" /> Edit
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                className="col-span-full text-center text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No teams match your search.
              </motion.p>
            )}
            <MobileStickyNav />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
