// src/pages/UserBiddingCharSelection.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const placeholderTeams = [
  { id: "team1", name: "Team Alpha" },
  { id: "team2", name: "Team Bravo" },
  { id: "team3", name: "Team Charlie" },
  { id: "team4", name: "Team Delta" },
  { id: "team5", name: "Team Echo" },
];

const placeholderAvatars = [
  { id: "avatar1", src: "/avatars/avatar1.png", alt: "Avatar 1" },
  { id: "avatar2", src: "/avatars/avatar2.png", alt: "Avatar 2" },
  { id: "avatar3", src: "/avatars/avatar3.png", alt: "Avatar 3" },
  { id: "avatar4", src: "/avatars/avatar4.png", alt: "Avatar 4" },
  { id: "avatar5", src: "/avatars/avatar5.png", alt: "Avatar 5" },
];

export default function UserBiddingCharSelection() {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [avatars, setAvatars] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: fetch real team list from backend
    setTeams(placeholderTeams);

    // TODO: fetch real avatar list from backend
    setAvatars(placeholderAvatars);
  }, []);

  const handleJoin = async () => {
    if (!selectedTeam || !selectedAvatar) {
      setError("Please select both a team and an avatar.");
      return;
    }

    try {
      // TODO: POST to backend with auctionId, selectedTeam, selectedAvatar
      // await api.post(`/join-auction/${auctionId}/confirm`, {
      //   teamId: selectedTeam,
      //   avatarId: selectedAvatar,
      // });

      // After successful join, navigate to the actual bidding portal
      navigate(`/user-bidding-portal/${auctionId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to join with selected options. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <h1 className="text-2xl font-bold mb-6">
        Join Auction #{auctionId}
      </h1>

      <div className="space-y-8">
        {/* Step 1: Select Team */}
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Select Your Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  setSelectedTeam(team.id);
                  setError("");
                }}
                className={`p-4 rounded-lg border 
                  ${selectedTeam === team.id
                    ? "border-teal-600 bg-teal-100"
                    : "border-gray-300 bg-white hover:bg-gray-100"
                  }`}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Avatar */}
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Choose Your Avatar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {avatars.map((av) => (
              <button
                key={av.id}
                onClick={() => {
                  setSelectedAvatar(av.id);
                  setError("");
                }}
                className={`p-2 rounded-lg border overflow-hidden
                  ${selectedAvatar === av.id
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-300 bg-white hover:bg-gray-100"
                  }`}
              >
                <img
                  src={av.src}
                  alt={av.alt}
                  className="w-full h-auto object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {/* Final Join Button */}
      <div className="mt-8">
        <button
          onClick={handleJoin}
          disabled={!selectedTeam || !selectedAvatar}
          className={`w-full max-w-xs mx-auto px-6 py-3 rounded-lg text-white font-medium
            ${selectedTeam && selectedAvatar
              ? "bg-teal-600 hover:bg-teal-700"
              : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Join Auction
        </button>
      </div>
    </div>
  );
}
