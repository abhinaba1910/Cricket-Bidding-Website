// src/components/PlayerDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import api from '../userManagement/Api'; // ← if you want to fetch real data

export default function ViewPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // 🔗 TODO: fetch real player data by ID
    // api.get(`/admin/player/${id}`).then(res => setPlayer(res.data));
    // For now, stubbed data:
    setPlayer({
      name: 'Virat Kohli',
      team: 'Royal Challengers Bangalore',
      grade: 'A+',
      skills: ['Batsman (Right-handed)', 'All-rounder'],
      photoUrl: '/virat.jpg',
      matches: 254,
      runs: 12040,
      highestScore: 113,
      strikeRate: 93.2,
      bio: `One of the modern greats of the game, Virat Kohli has been
            captain of RCB since 2013 and holds numerous batting records.`,
    });
  }, [id]);

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
        <div className="md:w-1/3 bg-cover bg-center" style={{ backgroundImage: `url(${player.photoUrl})`, minHeight: '250px' }} />

        {/* Details */}
        <div className="p-6 md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{player.name}</h2>
          <p className="text-sm text-gray-600 mb-4">{player.team}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Grade</h4>
              <p className="mt-1 text-gray-800">{player.grade}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Skills</h4>
              <ul className="mt-1 list-disc list-inside text-gray-800">
                {player.skills.map(skill => <li key={skill}>{skill}</li>)}
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
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Highest Score</h4>
              <p className="mt-1 text-gray-800">{player.highestScore}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Strike Rate</h4>
              <p className="mt-1 text-gray-800">{player.strikeRate}%</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700">Biography</h4>
            <p className="mt-1 text-gray-800 whitespace-pre-line">{player.bio}</p>
          </div>

          <button
            onClick={() => {/* TODO: open edit modal or navigate to edit page */}}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Edit Player
          </button>
        </div>
      </div>
    </div>
  );
}
