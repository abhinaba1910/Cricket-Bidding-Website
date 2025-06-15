import React, { useEffect, useState } from "react";
import { FiPlus, FiArrowLeft } from "react-icons/fi";
import api from "../../userManagement/Api";
import { useParams, useNavigate } from "react-router-dom";
import { AddPlayersModal } from "./AddPlayersModal";
import { AddTeamsModal } from "./AddTeamsModal";
import MobileStickyNav from "../../components/layout/MobileStickyNav";

export default function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Auction state
  const [auctionName, setAuctionName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  // Load existing auction data
  useEffect(() => {
    api.get(`/get-auction/${id}`)
      .then(res => {
        setAuctionName(res.data.name);
        setSelectedPlayers(res.data.players || []);
        setSelectedTeams(res.data.teams || []);
      })
      .catch(err => console.error("Error loading auction", err));
  }, [id]);

  // Modal toggles
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Handlers for adding items
  const handleAddPlayers = (newPlayerIds) => {
    setSelectedPlayers(prev => [...prev, ...newPlayerIds]);
    // TODO: optionally persist immediately:
    // api.patch(`/get-auction/${id}`, { players: [...selectedPlayers, ...newPlayerIds] })
  };

  const handleAddTeams = (newTeamIds) => {
    setSelectedTeams(prev => [...prev, ...newTeamIds]);
    // TODO: optionally persist immediately:
    // api.patch(`/get-auction/${id}`, { teams: [...selectedTeams, ...newTeamIds] })
  };

  // Save full auction
  const saveAuction = () => {
    api.patch(`/get-auction/${id}`, {
      name: auctionName,
      players: selectedPlayers,
      teams: selectedTeams,
    })
      .then(() => alert("Auction updated!"))
      .catch(err => {
        console.error("Save failed", err);
        alert("Failed to save auction.");
      });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-700 hover:text-gray-900"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold">Edit Auction</h1>

      {/* Auction Name */}
      <div>
        <label className="block text-sm font-medium">Auction Name</label>
        <input
          type="text"
          value={auctionName}
          onChange={e => setAuctionName(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      {/* Selected Players */}
      <div>
        <h2 className="font-semibold mb-2">Players in Auction:</h2>
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map(pid => (
            <span
              key={pid}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
            >
              {pid}
            </span>
          ))}
        </div>
        <button
          onClick={() => setShowPlayerModal(true)}
          className="mt-2 inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          <FiPlus className="mr-1" /> Add Players
        </button>
      </div>

      {/* Selected Teams */}
      <div>
        <h2 className="font-semibold mb-2">Teams in Auction:</h2>
        <div className="flex flex-wrap gap-2">
          {selectedTeams.map(tid => (
            <span
              key={tid}
              className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
            >
              {tid}
            </span>
          ))}
        </div>
        <button
          onClick={() => setShowTeamModal(true)}
          className="mt-2 inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          <FiPlus className="mr-1" /> Add Teams
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={saveAuction}
        className=" w-full px-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded"
      >
        Save Auction
      </button>

      {/* Modals */}
      {showPlayerModal && (
        <AddPlayersModal
          auctionId={id}
          existingPlayerIds={selectedPlayers}
          onClose={() => setShowPlayerModal(false)}
          onAdd={handleAddPlayers}
        />
      )}
      {showTeamModal && (
        <AddTeamsModal
          auctionId={id}
          existingTeamIds={selectedTeams}
          onClose={() => setShowTeamModal(false)}
          onAdd={handleAddTeams}
        />
      )}
      <MobileStickyNav/>
    </div>
  );
}
