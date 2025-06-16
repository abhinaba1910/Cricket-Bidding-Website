import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import api from "../../userManagement/Api";

const allRoles = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
const allBattingStyles = ["Right Handed Batsman", "Left Handed Batsman"];
const allBowlingStyles = [
  "Right Arm Fast",
  "Left Arm Fast",
  "Right Arm Medium",
  "Left Arm Medium",
  "Right Arm Off Break",
  "Left Arm Orthodox",
  "Right Arm Leg Break",
  "Chinaman",
  "Left Arm Fast Medium",
  "Right Arm Fast Medium",
];
const allRanks = ["A+", "A", "B", "C"];

export function AddPlayersModal({
  auctionId,
  existingPlayerIds,
  onClose,
  onAdd,
}) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter inputs
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [battingFilter, setBattingFilter] = useState("");
  const [bowlingFilter, setBowlingFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");

  // to‑add selection
  const [toAdd, setToAdd] = useState([]);

  // Fetch all players, then filter out existing
  useEffect(() => {
    api
      .get("/get-player/available")
      .then((res) => {
        const nonSelected = res.data.filter(
          (p) => !existingPlayerIds.includes(p._id)
        );
        setPlayers(nonSelected);
      })

      .catch((err) => console.error("Error loading players", err))
      .finally(() => setLoading(false));
  }, [existingPlayerIds]);

  // Apply search + filters
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return players.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) &&
        (!roleFilter || p.role === roleFilter) &&
        (!battingFilter || p.battingStyle === battingFilter) &&
        (!bowlingFilter || p.bowlingStyle === bowlingFilter) &&
        (!rankFilter || p.grade === rankFilter)
      );
    });
  }, [players, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

  const toggle = (player) => {
    setToAdd((prev) => {
      const exists = prev.find((p) => p._id === player._id);
      if (exists) {
        return prev.filter((p) => p._id !== player._id);
      } else {
        return [...prev, player];
      }
    });
  };

  const commit = () => {
    onAdd(toAdd); // full player objects
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-full overflow-auto">
        {/* header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Add Players</h3>
          <button onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Filters */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full border rounded pl-10 pr-3 py-2"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border rounded px-3 py-2"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {allRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2"
              value={battingFilter}
              onChange={(e) => setBattingFilter(e.target.value)}
            >
              <option value="">All Batting Styles</option>
              {allBattingStyles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2"
              value={bowlingFilter}
              onChange={(e) => setBowlingFilter(e.target.value)}
            >
              <option value="">All Bowling Styles</option>
              {allBowlingStyles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2"
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
            >
              <option value="">All Ranks</option>
              {allRanks.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* List */}
          {loading ? (
            <p className="text-center py-8">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No players found.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {filtered.map((p) => (
                <label
                  key={p._id}
                  className="flex items-center gap-3 border rounded px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={toAdd.some((x) => x._id === p._id)}
                    onChange={() => toggle(p)}
                  />
                  <img
                    src={p.playerPic || "https://placehold.co/40x40"}
                    alt={p.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.role} • {p.country} • ₹
                      {p.basePrice?.toLocaleString() || 0}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={commit}
              disabled={!toAdd.length}
              className={`px-4 py-2 rounded text-white ${
                toAdd.length
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Add {toAdd.length}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
