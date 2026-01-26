import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Api from "../../userManagement/Api";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiEdit2,
  FiAward,
  FiDollarSign,
  FiGlobe,
  FiCalendar,
  FiUser,
  FiBarChart, // Changed from FiBarChart3 to FiBarChart
  FiTarget,
  FiActivity,
} from "react-icons/fi";
import {
  FaRunning,
  FaBaseballBall,
  FaMedal,
  FaRupeeSign,
} from "react-icons/fa";
import { GiBowlingStrike, GiCricketBat } from "react-icons/gi";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const formatIndianNumber = (num) => {
  if (!num || isNaN(num)) return "";
  const value = parseInt(num, 10);
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)} K`;
  return value.toString();
};

export default function ViewPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setIsLoading(true);
        const res = await Api.get(`/get-player/${id}`);
        setPlayer(res.data);
        console.log("Player data with performance stats:", res.data);
      } catch (err) {
        console.error("Error fetching player:", err);
        setError("You are not authorized or player not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (error) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4 border border-gray-100">
            <h2 className="text-2xl font-bold text-red-500 mb-3">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white transition-all flex items-center justify-center mx-auto shadow-md hover:shadow-lg"
            >
              <FiArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading player data...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const {
    name,
    country,
    dob,
    role,
    battingStyle,
    bowlingStyle,
    basePrice,
    grade,
    bio,
    playerPic,
    isCapped,
    points,
    performanceStats, // Added performance stats
  } = player;

  const age = new Date().getFullYear() - new Date(dob).getFullYear();

  const roleColors = {
    Batsman: "bg-orange-500",
    "Fast all-rounder": "bg-purple-600",
    "Spin all-rounder": "bg-purple-500",
    "Wicket keeper batsman": "bg-blue-500",
    "Spin bowler": "bg-green-500",
    "Fast bowler": "bg-teal-600",
    default: "bg-gray-500",
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-28">
        {/* Header with back button */}
        <header className="relative top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 p-4 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all"
            >
              <FiArrowLeft className="mr-2 text-lg" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-5xl mx-auto px-4 pt-6 pb-20">
          {/* Player profile card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8"
          >
            {/* Player header with image */}
            <div className="relative">
              <div className="h-40 bg-gradient-to-r from-blue-400 to-blue-500"></div>
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
                  <img
                    src={playerPic || "https://via.placeholder.com/200"}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Player info */}
            <div className="pt-20 pb-6 px-6 text-center">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3 ${
                  roleColors[role] || roleColors.default
                }`}
              >
                {role}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{name}</h1>
              <div className="flex items-center justify-center text-gray-500 mb-4">
                <FiGlobe className="mr-1.5" />
                <span>
                  {country} {country.toLowerCase() !== "india" && "✈️"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <StatItem
                  title="Base Price"
                  value={`₹${formatIndianNumber(basePrice)}`}
                  icon={<FaRupeeSign />}
                />
                <StatItem title="Rating" value={points} icon={<FiAward />} />
                <StatItem title="Age" value={age} icon={<FiCalendar />} />
              </div>
            </div>
          </motion.div>

          {/* Details sections */}
          <div className="space-y-6">
            {/* Performance Statistics Section */}
            {performanceStats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                  Performance Statistics
                </h3>

                <div className="space-y-6">
                  {/* All-Rounder Stats - Show if role contains "all-rounder" */}
                  {(role === "Fast all-rounder" ||
                    role === "Spin all-rounder") &&
                    performanceStats.allRounder && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                        <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                          <FiActivity className="mr-2 text-purple-600" />
                          All-Rounder Performance
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          <PerformanceStat
                            label="Matches"
                            value={performanceStats.allRounder.matches}
                            icon="🏏"
                          />
                          <PerformanceStat
                            label="Runs"
                            value={performanceStats.allRounder.runs}
                            icon="🏃"
                          />
                          <PerformanceStat
                            label="High Score"
                            value={performanceStats.allRounder.highScore}
                            icon="⚡"
                          />
                          <PerformanceStat
                            label="Batting Avg"
                            value={
                              performanceStats.allRounder.battingAverage?.toFixed(
                                1
                              ) || "0.0"
                            }
                            icon="📊"
                          />
                          <PerformanceStat
                            label="Strike Rate"
                            value={
                              performanceStats.allRounder.battingStrikeRate?.toFixed(
                                1
                              ) || "0.0"
                            }
                            icon="🎯"
                          />
                          <PerformanceStat
                            label="Centuries"
                            value={performanceStats.allRounder.centuries}
                            icon="💯"
                          />
                          <PerformanceStat
                            label="Fifties"
                            value={performanceStats.allRounder.fifties}
                            icon="5️⃣"
                          />
                          <PerformanceStat
                            label="Wickets"
                            value={performanceStats.allRounder.wickets}
                            icon="🎯"
                          />
                          <PerformanceStat
                            label="Best Bowling"
                            value={
                              performanceStats.allRounder.bestBowling || "0/0"
                            }
                            icon="⭐"
                          />
                          <PerformanceStat
                            label="Bowl Avg"
                            value={
                              performanceStats.allRounder.bowlingAverage?.toFixed(
                                1
                              ) || "0.0"
                            }
                            icon="📈"
                          />
                          <PerformanceStat
                            label="Economy"
                            value={
                              performanceStats.allRounder.economy?.toFixed(1) ||
                              "0.0"
                            }
                            icon="💰"
                          />
                          <PerformanceStat
                            label="5-Wickets"
                            value={performanceStats.allRounder.fiveWicketHauls}
                            icon="🔥"
                          />
                        </div>
                      </div>
                    )}

                  {/* Batting Stats - Show if role is "Batsman" or "Wicket keeper batsman" */}
                  {(role === "Batsman" || role === "Wicket keeper batsman") &&
                    performanceStats.batting && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                        <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                          <GiCricketBat className="mr-2 text-orange-600" />
                          Batting Performance
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                          <PerformanceStat
                            label="Matches"
                            value={performanceStats.batting.matches}
                            icon="🏏"
                          />
                          <PerformanceStat
                            label="Runs"
                            value={performanceStats.batting.runs}
                            icon="🏃"
                          />
                          <PerformanceStat
                            label="High Score"
                            value={performanceStats.batting.highScore}
                            icon="⚡"
                          />
                          <PerformanceStat
                            label="Average"
                            value={
                              performanceStats.batting.average?.toFixed(1) ||
                              "0.0"
                            }
                            icon="📊"
                          />
                          <PerformanceStat
                            label="Strike Rate"
                            value={
                              performanceStats.batting.strikeRate?.toFixed(1) ||
                              "0.0"
                            }
                            icon="🎯"
                          />
                          <PerformanceStat
                            label="Centuries"
                            value={performanceStats.batting.centuries}
                            icon="💯"
                          />
                          <PerformanceStat
                            label="Fifties"
                            value={performanceStats.batting.fifties}
                            icon="5️⃣"
                          />
                        </div>
                      </div>
                    )}

                  {/* Bowling Stats - Show if role is "Fast bowler" or "Spin bowler" */}
                  {(role === "Fast bowler" || role === "Spin bowler") &&
                    performanceStats.bowling && (
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-100">
                        <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                          <GiBowlingStrike className="mr-2 text-green-600" />
                          Bowling Performance
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          <PerformanceStat
                            label="Matches"
                            value={performanceStats.bowling.matches}
                            icon="🏏"
                          />
                          <PerformanceStat
                            label="Wickets"
                            value={performanceStats.bowling.wickets}
                            icon="🎯"
                          />
                          <PerformanceStat
                            label="Best Bowling"
                            value={
                              performanceStats.bowling.bestBowling || "0/0"
                            }
                            icon="⭐"
                          />
                          <PerformanceStat
                            label="Average"
                            value={
                              performanceStats.bowling.average?.toFixed(1) ||
                              "0.0"
                            }
                            icon="📊"
                          />
                          <PerformanceStat
                            label="Economy"
                            value={
                              performanceStats.bowling.economy?.toFixed(1) ||
                              "0.0"
                            }
                            icon="💰"
                          />
                          <PerformanceStat
                            label="5-Wickets"
                            value={performanceStats.bowling.fiveWicketHauls}
                            icon="🔥"
                          />
                        </div>
                      </div>
                    )}

                  {/* No Stats Available - Show if no relevant section is displayed */}
                  {!(
                    (role === "Fast all-rounder" ||
                      role === "Spin all-rounder") &&
                    performanceStats.allRounder
                  ) &&
                    !(
                      (role === "Batsman" ||
                        role === "Wicket keeper batsman") &&
                      performanceStats.batting
                    ) &&
                    !(
                      (role === "Fast bowler" || role === "Spin bowler") &&
                      performanceStats.bowling
                    ) && (
                      <div className="text-center py-8 text-gray-500">
                        <FiBarChart
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p className="text-lg font-medium">
                          No performance statistics available
                        </p>
                        <p className="text-sm">
                          Statistics for {role} will be displayed once match
                          data is available.
                        </p>
                      </div>
                    )}
                </div>
              </motion.div>
            )}

            {/* Skills section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                Player Skills
              </h3>

              <div className="space-y-4">
                <DetailItem
                  icon={<FaRunning className="text-orange-500" />}
                  title="Batting Style"
                  value={battingStyle}
                />
                <DetailItem
                  icon={<FaBaseballBall className="text-green-500" />}
                  title="Bowling Style"
                  value={bowlingStyle || "N/A"}
                />
                <DetailItem
                  icon={<FaMedal className="text-blue-500" />}
                  title="Status"
                  value={isCapped ? "Internationally Capped" : "Uncapped"}
                />
              </div>
            </motion.div>

            {/* Bio section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                Biography
              </h3>
              <p className="text-gray-600 whitespace-pre-line">
                {bio || "No biography available for this player."}
              </p>
            </motion.div>

            {/* Action button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-8"
            >
              <button
                onClick={() => navigate(`/admin/player/${id}/edit`)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center transition-all shadow-lg hover:shadow-xl"
              >
                <FiEdit2 className="mr-2" />
                Edit Player Profile
              </button>
            </motion.div>
          </div>
        </main>

        {/* Footer spacer */}
        <div className="h-24"></div>

        <MobileStickyNav />
      </div>
    </PageWrapper>
  );
}

const StatItem = ({ title, value, icon }) => (
  <div className="text-center">
    <div className="flex items-center justify-center text-gray-400 mb-1">
      {React.cloneElement(icon, { className: "mr-1" })}
      <span className="text-xs font-medium">{title}</span>
    </div>
    <div className="text-xl font-bold text-gray-800">{value}</div>
  </div>
);

const DetailItem = ({ icon, title, value }) => (
  <div className="flex items-start">
    <div className="p-2 bg-gray-50 rounded-lg mr-4">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

const PerformanceStat = ({ label, value, icon }) => (
  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
    <div className="text-lg mb-1">{icon}</div>
    <div className="text-lg font-bold text-gray-800">{value}</div>
    <div className="text-xs text-gray-500 font-medium">{label}</div>
  </div>
);
