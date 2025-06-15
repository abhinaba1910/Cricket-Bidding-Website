import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../userManagement/Api";

const allRoles = [
  "Batsman",
  "Fast all-rounder",
  "Spin all-rounder",
  "Wicket keeper batsman",
  "Spin bowler",
  "Fast bowler",
];

const allRanks = ["A+", "A", "B", "C"];

export default function ManualPlayerSelection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Check if we're adding to existing queue
  const addToExistingQueue = location.state?.addToExistingQueue || false;
  const currentQueue = location.state?.currentQueue || [];
  const currentPosition = location.state?.currentPosition || 0;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [battingFilter, setBattingFilter] = useState("");
  const [bowlingFilter, setBowlingFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [queuedIds, setQueuedIds] = useState(new Set());



  useEffect(() => {
    if (!id) return;
    api
      .get(`/get-auction/${id}`)
      .then((res) => {
        const { savailablePlayers, manualPlayerQueue } = res.data;
        setPlayers(savailablePlayers || []);

        // Extract already queued player IDs
        const queuedPlayerIds = new Set(
          (manualPlayerQueue || []).map((entry) => entry.player._id)
        );
        setQueuedIds(queuedPlayerIds);

        if (!addToExistingQueue) {
          setSelectedPlayers([]); // Start with no player selected
        }        
      })
      .catch((err) => console.error("Failed to fetch auction data", err));
  }, [id, addToExistingQueue]);



  const togglePlayerSelection = (player) => {
    if (queuedIds.has(player._id)) return; // Ignore already queued

    setSelectedPlayers((prev) => {
      const isSelected = prev.some((p) => p._id === player._id);
      if (isSelected) {
        return prev.filter((p) => p._id !== player._id);
      } else {
        if (!addToExistingQueue && prev.length >= 4) {
          alert("You can select maximum 4 players at a time");
          return prev;
        }
        return [...prev, player];
      }
    });
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return players.filter((p) => {
      const okSearch =
        p.name.toLowerCase().includes(term) ||
        p.country.toLowerCase().includes(term);
      const okRole = !roleFilter || p.role === roleFilter;
      const okBat = !battingFilter || p.battingStyle === battingFilter;
      const okBowl = !bowlingFilter || p.bowlingStyle === bowlingFilter;
      const okRank = !rankFilter || p.grade === rankFilter;
      return okSearch && okRole && okBat && okBowl && okRank;
    });
  }, [players, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

  const handleBack = () => navigate(`/admin/admin-bidding-dashboard/${id}`);

  // Updated handleStartBidding function in ManualPlayerSelection component

  const handleStartBidding = async () => {
    if (selectedPlayers.length === 0) {
      alert("Please select at least one player");
      return;
    }

    try {
      if (addToExistingQueue) {
        // Add to existing queue
        const newQueuePlayers = selectedPlayers.map((player, index) => ({
          player: player._id,
          position: currentQueue.length + index + 1,
          playerData: player,
        }));

        console.log("Adding players to existing queue:");
        console.log("Current queue length:", currentQueue.length);
        console.log("New players being added:", newQueuePlayers);

        // Send the proper data structure to backend
        const response = await api.post(`/set-manual-queue/${id}`, {
          newPlayers: newQueuePlayers,
          existingQueue: currentQueue,
        });

        console.log("Backend response:", response.data);

        // Check if response indicates success
        if (response.data.message) {
          alert(
            `${selectedPlayers.length} players added to queue successfully!`
          );

          // Navigate back to dashboard with success state
          navigate(`/admin/admin-bidding-dashboard/${id}`, {
            state: {
              queueUpdated: true,
              newQueueLength: response.data.totalQueueLength,
              message: response.data.message,
            },
          });
        } else {
          throw new Error("Unexpected response from server");
        }
      } else {
        // Create new queue and start bidding
        navigate(`/admin/admin-bidding-dashboard/${id}`, {
          state: {
            selectedPlayers: selectedPlayers.map((p, i) => ({
              ...p,
              id: p._id,
              selectionOrder: i + 1,
            })),
            id,
          },
        });
      }
    } catch (error) {
      console.error("Error handling player selection:", error);
      alert(
        error.response?.data?.error ||
          "Failed to process player selection. Please try again."
      );
    }
  };

  const NumberDisplay = ({ number }) =>
    number ? (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-semibold">
        {number}
      </span>
    ) : (
      <div className="w-8 h-8 rounded-full border-2 border-gray-300" />
    );

  const renderPlayerRow = (p, isMobile) => {
    const isSelected = selectedPlayers.some((player) => player._id === p._id);
    const isQueued = queuedIds.has(p._id);

    if (isMobile) {
      return (
        <div
          key={p._id}
          onClick={() => togglePlayerSelection(p)}
          className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
            isSelected ? "bg-blue-50" : ""
          } ${isQueued ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="mr-4">
            <NumberDisplay number={p.displayNumber || "-"} />
          </div>
          <img
            src={p.playerPic || "https://placehold.co/60x60"}
            alt={p.name}
            className="w-12 h-12 rounded-full mr-4 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex justify-between">
              <h3 className="font-medium text-gray-900">{p.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  p.grade === "A+"
                    ? "bg-red-100 text-red-800"
                    : p.grade === "A"
                    ? "bg-orange-100 text-orange-800"
                    : p.grade === "B"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {p.grade || "—"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {p.role} • {p.country}
            </p>
            <p className="text-sm font-medium mt-1">
              ₹{p.basePrice?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      );
    }

    return (
      <tr
        key={p._id}
        onClick={() => togglePlayerSelection(p)}
        className={`cursor-pointer hover:bg-gray-50 transition ${
          isSelected ? "bg-blue-50" : ""
        } ${isQueued ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <td className="px-4 py-2 text-center">
          <NumberDisplay number={p.displayNumber || "-"} />
        </td>
        <td className="px-4 py-2">
          <img
            src={p.playerPic || "https://placehold.co/60x60"}
            alt={p.name}
            className="w-10 h-10 rounded-full"
          />
        </td>
        <td className="px-4 py-2">{p.name}</td>
        <td className="px-4 py-2">{p.grade || "—"}</td>
        <td className="px-4 py-2">{p.role}</td>
        <td className="px-4 py-2">{p.country}</td>
        <td className="px-4 py-2">₹{p.basePrice?.toLocaleString() || 0}</td>
      </tr>
    );
  };

  // Update the header to show different title based on mode
  const getHeaderTitle = () => {
    if (addToExistingQueue) {
      return `Add More Players to Queue (Current: ${currentQueue.length} players)`;
    }
    return "Manual Player Selection";
  };

  // Update the button text based on mode
  const getButtonText = () => {
    if (addToExistingQueue) {
      return `Add to Queue (${selectedPlayers.length})`;
    }
    return `Add Players (${selectedPlayers.length})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:px-0 max-md:pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <FiArrowLeft className="text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {getHeaderTitle()}
            </h1>
          </div>
          {/* Filters: horizontally scrollable */}
          <div className="w-full overflow-x-auto">
            <div className="inline-flex items-center gap-2 py-2 min-w-max">
              {/* Search */}
              <div className="relative min-w-[250px]">
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or country…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
                />
              </div>

              {/* Role */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">All Roles</option>
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* Rank */}
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                className="min-w-[140px] border rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">All Ranks</option>
                {allRanks.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {addToExistingQueue && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Current Queue Status
            </h3>
            <p className="text-blue-800">
              Queue has {currentQueue.length} players. Currently showing player{" "}
              {currentPosition + 1}.
            </p>
            <p className="text-blue-700 text-sm mt-1">
              New players will be added after position {currentQueue.length}.
            </p>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-fixed text-left divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-12 px-4 py-3">#</th>
                <th className="w-16 px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => renderPlayerRow(p, false))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden bg-white rounded-lg shadow overflow-hidden">
          {filtered.map((p) => renderPlayerRow(p, true))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500">
              No players found.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between shadow-lg md:static md:shadow-none md:border-t-0">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back
          </button>
          <button
            onClick={handleStartBidding}
            disabled={selectedPlayers.length === 0}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              selectedPlayers.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : addToExistingQueue
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
