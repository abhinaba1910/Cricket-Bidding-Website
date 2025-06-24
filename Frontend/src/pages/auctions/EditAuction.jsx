import React, { useEffect, useState } from "react";
import { FiPlus, FiArrowLeft } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { AddPlayersModal } from "./AddPlayersModal";
import { AddTeamsModal } from "./AddTeamsModal";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import toast from "react-hot-toast";
import Api from "../../userManagement/Api";

export default function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Auction state
  const [auctionName, setAuctionName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  // Load existing auction data
  useEffect(() => {
    Api
      .get(`/get-auction/${id}`)
      .then((res) => {
        setAuctionName(res.data.auctionName);
        setSelectedPlayers(res.data.selectedPlayers || []);
        setSelectedTeams(res.data.selectedTeams || []);
        console.log(res.data);
      })
      .catch((err) => console.error("Error loading auction", err));
  }, [id]);

  // Modal toggles
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Handlers for adding items
  const handleAddPlayers = (newPlayers) => {
    const newPlayerIds = new Set(selectedPlayers.map((p) => p._id));
    const updatedPlayers = [
      ...selectedPlayers,
      ...newPlayers.filter((p) => !newPlayerIds.has(p._id)),
    ];
    setSelectedPlayers(updatedPlayers);
  };

  const handleAddTeams = (newTeams) => {
    const newTeamIds = new Set(selectedTeams.map((t) => t._id));
    const updatedTeams = [
      ...selectedTeams,
      ...newTeams.filter((t) => !newTeamIds.has(t._id)),
    ];
    setSelectedTeams(updatedTeams);
  };
  const handleDeleteAuction = async () => {
  const confirmDelete = window.confirm("Are you sure you want to delete this auction permanently?");
  if (!confirmDelete) return;

  try {
    await Api.delete(`/delete-auction/${id}`);
    toast.success("Auction deleted successfully!");
    navigate("/admins-my-auction-info");
  } catch (error) {
    console.error("Failed to delete auction:", error);
    toast.error("Failed to delete auction.");
  }
};


  // Save full auction
  const saveAuction = () => {
    if (!selectedPlayers.length || !selectedTeams.length) {
      alert("Please add both players and teams before saving.");
      return;
    }

    Api
      .patch(`/edit-auction/${id}`, {
        auctionName,
        selectedPlayers: selectedPlayers.map((p) => p._id),
        selectedTeams: selectedTeams.map((team) => ({
          team: team._id,
          // manager: team.manager || null,
          // avatar: team.avatar || null,
          // rtmCount: team.rtmCount || 0,
        })),
      })
      .then(() => toast.success("Auction updated!"))
      .then(()=> window.location.href="/admins-my-auction-info")
      .catch((err) => {
        console.error("Save failed", err);
        toast.error("Failed to save auction.");
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
          onChange={(e) => setAuctionName(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
        />
      </div>

      {/* Selected Players */}
      <div>
        <h2 className="font-semibold mb-2">Players in Auction:</h2>
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map((player) => (
            <span
              key={player._id}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
            >
              {player.name}
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
          {selectedTeams
            .filter((team) => team && team._id)
            .map((team) => (
              <span
                key={team._id}
                className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
              >
                {team.teamName}
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
      <button
  onClick={handleDeleteAuction}
  className="w-full mt-2 px-4 bg-red-600 hover:bg-red-700 text-white py-2  rounded"
>
  Delete Auction
</button>
<div className="pb-10"></div>


      {/* Modals */}
      {showPlayerModal && (
        <AddPlayersModal
          auctionId={id}
          // existingPlayerIds={selectedPlayers}
          existingPlayerIds={selectedPlayers.map((p) => p._id)}
          onClose={() => setShowPlayerModal(false)}
          onAdd={handleAddPlayers}
        />
      )}
      {showTeamModal && (
        <AddTeamsModal
          auctionId={id}
          existingTeamIds={selectedTeams.map((t) => t._id)}
          onClose={() => setShowTeamModal(false)}
          onAdd={handleAddTeams}
        />
      )}
      <MobileStickyNav />
    </div>
  );
}
