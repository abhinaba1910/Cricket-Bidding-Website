import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import api from "../../userManagement/Api";

export function AddTeamsModal({ auctionId, existingTeamIds, onClose, onAdd }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter inputs
  const [search, setSearch] = useState("");

  // to‑add selection
  const [toAdd, setToAdd] = useState([]);

  // Fetch all teams, then filter out existing
  useEffect(() => {
    api.get("/get-teams")
      .then(res => {
        console.log(res.data)
        const nonSelected = res.data.filter(t => !existingTeamIds.includes(t._id));
        setTeams(nonSelected);
      })
      .catch(err => console.error("Error loading teams", err))
      .finally(() => setLoading(false));
  }, [existingTeamIds]);

  // Apply search filter
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return teams.filter(t =>
      t.teamName.toLowerCase().includes(term) ||
      t.shortName.toLowerCase().includes(term) ||
      t._id.includes(search)
    );
  }, [teams, search]);

  const toggle = (id) =>
    setToAdd(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const commit = () => {
    const selectedFullTeams = teams.filter((t) => toAdd.includes(t._id));
    onAdd(selectedFullTeams); // ✅ send full objects, not just IDs
    onClose();
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-full overflow-auto">
        {/* header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Add Teams</h3>
          <button onClick={onClose}><FiX size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full border rounded pl-10 pr-3 py-2"
              placeholder="Search by ID, name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          {loading ? (
            <p className="text-center py-8">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No teams found.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {filtered.map(t => (
                <label
                  key={t._id}
                  className="flex items-center gap-3 border rounded px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={toAdd.includes(t._id)}
                    onChange={() => toggle(t._id)}
                  />
                  <img
                    src={t.logoUrl || "https://placehold.co/40x40"}
                    alt={t.shortName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{t.teamName}</div>
                    <div className="text-xs text-gray-500">
                      {t.shortName} • ₹{Number(t.purse).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {t.playerCount} players
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
                  ? "bg-green-600 hover:bg-green-700"
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
