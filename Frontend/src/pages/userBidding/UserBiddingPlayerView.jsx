// src/components/PlayerDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../userManagement/Api";

export default function UserBiddingPlayerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await api.get(`/get-player/${id}`); // ✅ Call the backend
        const p = res.data;

        // Optionally restructure data if needed
        const playerData = {
          name: p.name,
          team: p.previousTeams || "N/A",
          grade: p.grade || "N/A",
          skills: [p.battingStyle, p.bowlingStyle].filter(Boolean),
          photoUrl: p.playerPic,
          matches: p.matchesPlayed || 0,
          runs: p.runs || 0,
          highestScore: p.highestScore || 0,
          strikeRate: p.strikeRate || 0,
          bio: p.bio || "No bio available",
        };

        setPlayer(playerData);
        console.log(playerData)
      } catch (err) {
        console.error("Error fetching player:", err);
        setError("You are not authorized or player not found.");
      }
    };

    fetchPlayer();
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-blue-500 hover:text-blue-700"
      >
        ← Back
      </button>

      <div className="bg-white shadow rounded-lg overflow-hidden md:flex">
        {/* Photo */}
        <div
          className="md:w-1/3 bg-cover bg-center"
          style={{
            backgroundImage: `url(${player.photoUrl})`,
            minHeight: "250px",
          }}
        />

        {/* Details */}
        <div className="p-6 md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {player.name}
          </h2>
          <p className="text-sm text-gray-600 mb-4">{player.team}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Grade</h4>
              <p className="mt-1 text-gray-800">{player.grade}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Skills</h4>
              <ul className="mt-1 list-disc list-inside text-gray-800">
                {player.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Matches</h4>
              <p className="mt-1 text-gray-800">{player.matches}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Runs</h4>
              <p className="mt-1 text-gray-800">{player.runs}</p>
            </div>
            {/* <div>
              <h4 className="text-sm font-semibold text-gray-700">Highest Score</h4>
              <p className="mt-1 text-gray-800">{player.}</p>
            </div> */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700">
                Strike Rate
              </h4>
              <p className="mt-1 text-gray-800">{player.strikeRate}%</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700">Biography</h4>
            <p className="mt-1 text-gray-800 whitespace-pre-line">
              {player.bio}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
