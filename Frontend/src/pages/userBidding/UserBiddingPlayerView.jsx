import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Api from "../../userManagement/Api";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiDollarSign,
  FiAward,
  FiCalendar,
  FiGlobe,
  FiUser,
} from "react-icons/fi";
import {
  FaRunning,
  FaBaseballBall,
  FaMedal,
  FaRupeeSign,
} from "react-icons/fa";
import MobileStickyNav from "../../components/layout/MobileStickyNav";

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

export default function UserBiddingPlayerView() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await Api.get(`/get-player/${playerId}`);
        console.log(res.data);
        setPlayer(res.data);
      } catch (err) {
        console.error("Error fetching player:", err);
        setError("You are not authorized or player not found.");
      }
    };
    fetchPlayer();
  }, [playerId]);

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

  if (!player) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
      </PageWrapper>
    );
  }

  const {
    name,
    country,
    dob,
    role,
    grade,
    battingStyle,
    bowlingStyle,
    basePrice,
    bio,
    playerPic,
    runs,
    strikeRate,
    matchesPlayed,
    points,
    isCapped,
    highestScore,
  } = player;

  const roleColors = {
    Batsman: "bg-orange-500",
    "Fast all-rounder": "bg-purple-600",
    "Spin all-rounder": "bg-purple-500",
    "Wicket keeper batsman": "bg-blue-500",
    "Spin bowler": "bg-green-500",
    "Fast bowler": "bg-teal-600",
    default: "bg-gray-500",
  };

  const age = dob
    ? new Date().getFullYear() - new Date(dob).getFullYear()
    : "N/A";

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-28">
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

        <main className="max-w-5xl mx-auto px-4 pt-6 pb-20">
          {/* Player Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8"
          >
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
                  {country} {country?.toLowerCase() !== "india" && "✈️"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <StatItem
                  title="Base Price"
                  value={`₹${formatIndianNumber(basePrice)}`}
                  icon={<FaRupeeSign />}
                />
                <StatItem
                  title="Rating"
                  value={points || "-"}
                  icon={<FiAward />}
                />
                <StatItem title="Age" value={age} icon={<FiCalendar />} />
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                Player Skills & Stats
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem
                  icon={<FaRunning className="text-orange-500" />}
                  title="Batting Style"
                  value={battingStyle || "N/A"}
                />
                <DetailItem
                  icon={<FaBaseballBall className="text-green-500" />}
                  title="Bowling Style"
                  value={bowlingStyle || "N/A"}
                />
                <DetailItem
                  icon={<FaMedal className="text-blue-500" />}
                  title="Matches"
                  value={matchesPlayed || 0}
                />
                <DetailItem
                  icon={<FiDollarSign className="text-yellow-500" />}
                  title="Runs"
                  value={runs || 0}
                />
                <DetailItem
                  icon={<FiAward className="text-purple-500" />}
                  title="Strike Rate"
                  value={`${strikeRate || 0}%`}
                />
                <DetailItem
                  icon={<FiAward className="text-green-600" />}
                  title="Highest Score"
                  value={highestScore || "N/A"}
                />
                <DetailItem
                  icon={<FiUser className="text-pink-500" />}
                  title="Grade"
                  value={grade || "N/A"}
                />
                <DetailItem
                  icon={<FaMedal className="text-blue-500" />}
                  title="Status"
                  value={isCapped ? "Internationally Capped" : "Uncapped"}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                Biography
              </h3>
              <p className="text-gray-600 whitespace-pre-line">
                {bio || "No biography available."}
              </p>
            </motion.div>
          </div>
        </main>

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
