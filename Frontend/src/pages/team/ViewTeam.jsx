import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiEdit2,
  FiDollarSign,
  FiCalendar,
  FiInfo,
  FiUsers,
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import Api from "../../userManagement/Api";
import { FaRupeeSign } from "react-icons/fa";
import { formatIndianNumber } from "../../types/formatIndianNumber";

export default function ViewTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    async function loadTeam() {
      try {
        const res = await Api.get(`/get-team/${id}`);
        setTeam(res.data);
      } catch (err) {
        console.error("Failed to load team:", err);
        const errorMsg =
          err.response?.data?.error || "Could not load team data";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
    interval = setInterval(loadTeam, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">Loading team data...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-4 transition"
        >
          <FiChevronLeft className="mr-1" /> Back
        </button>
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
          <FiInfo className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-600">Team not found</p>
        </div>
      </div>
    );
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "₹");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition mb-4"
        >
          <FiChevronLeft className="mr-1" /> Back to Teams
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Team Details
            </h1>
            <p className="text-gray-500">View and manage team information</p>
          </div>
          <button
            onClick={() => navigate(`/admin/teams/${team._id}/edit`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <FiEdit2 className="mr-2" />
            Edit Team
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden"
      >
        {/* Team Header */}
        <div className="relative">
          <div
            className="h-48 bg-gradient-to-r from-blue-500 to-blue-600"
            style={{
              backgroundImage: team.logoUrl ? `url(${team.logoUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
            }}
          >
            {/* Enhanced dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>

            <div className="absolute bottom-4 left-4 flex items-end">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <img
                  src={team.logoUrl || "/default-logo.png"}
                  alt={team.teamName}
                  className="w-16 h-16 rounded-full object-contain"
                />
              </div>
              <div className="ml-4">
                {/* Enhanced text with stronger shadow and stroke */}
                <h2
                  className="text-2xl font-bold text-white"
                  style={{
                    textShadow:
                      "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)",
                    WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                  }}
                >
                  {team.teamName}
                </h2>
                <span
                  className="block text-sm font-normal text-white opacity-90"
                  style={{
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {team.shortName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Details */}
        <div className="p-6 md:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-3 text-blue-600">
                  <FaRupeeSign size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Purse</p>
                  <p className="text-xl font-semibold">
                    ₹{formatIndianNumber(team.purse) || "0"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-3 text-green-600">
                  <FaRupeeSign size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{formatIndianNumber(team.remaining) || "0"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full mr-3 text-purple-600">
                  <FiUsers size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Players Bought</p>
                  <p className="text-xl font-semibold">
                    {team.players?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                About The Team
              </h3>
              <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {team.description}
              </p>
            </div>
          )}

          {/* Founded Year */}
          {team.founded && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FiCalendar className="text-blue-500 mr-2" />
                Team History
              </h3>
              <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {team.founded}
                  </p>
                </div>
                <p className="text-gray-600">Year Founded</p>
              </div>
            </div>
          )}

          {/* Players Table */}
          {team.players && team.players.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiUsers className="text-blue-500 mr-2" />
                Squad Players
              </h3>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {team.players
                      .filter((entry) => entry.player !== null)
                      .map((entry, index) => (
                        <motion.tr
                          key={entry.player._id}
                          className="hover:bg-gray-50"
                          whileHover={{ scale: 1.01 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                            {entry.player.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            ₹{formatIndianNumber(entry.price)}
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer Spacer */}
      <div className="h-16"></div>

      <MobileStickyNav />
    </div>
  );
}
