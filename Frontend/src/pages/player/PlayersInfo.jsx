import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiEye, FiEdit, FiPlus } from "react-icons/fi";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import Api from "../../userManagement/Api";

// Filters that match actual backend structure
const allRoles = [
  "Batsman",
  "Fast all-rounder",
  "Spin all-rounder",
  "Wicket keeper batsman",
  "Spin bowler",
  "Fast bowler",
];

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

export default function PlayersInfo() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [battingFilter, setBattingFilter] = useState("");
  const [bowlingFilter, setBowlingFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await Api.get("/get-player");
        setPlayers(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Failed to fetch players", err);
      }
    };
    fetchPlayers();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return players.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        p.country.toLowerCase().includes(term);

      const matchesRole = !roleFilter || p.role === roleFilter;
      const matchesBatting = !battingFilter || p.battingStyle === battingFilter;
      const matchesBowling = !bowlingFilter || p.bowlingStyle === bowlingFilter;
      const matchesRank = !rankFilter || p.grade === rankFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesBatting &&
        matchesBowling &&
        matchesRank
      );
    });
  }, [players, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:px-0 max-md:pb-14">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Players</h1>
        <div className="flex flex-wrap gap-3 w-full md:items-center">
  {/* Search input */}
  <div className="relative flex-1 min-w-[220px]">
    <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search by name or country…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
    />
  </div>

  {/* Role Filter */}
  <select
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value)}
    className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
  >
    <option value="">All Roles</option>
    {allRoles.map((r) => (
      <option key={r} value={r}>
        {r}
      </option>
    ))}
  </select>

  {/* Batting Filter */}
  <select
    value={battingFilter}
    onChange={(e) => setBattingFilter(e.target.value)}
    className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
  >
    <option value="">All Batting Styles</option>
    {allBattingStyles.map((r) => (
      <option key={r} value={r}>
        {r}
      </option>
    ))}
  </select>

  {/* Bowling Filter */}
  <select
    value={bowlingFilter}
    onChange={(e) => setBowlingFilter(e.target.value)}
    className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
  >
    <option value="">All Bowling Styles</option>
    {allBowlingStyles.map((r) => (
      <option key={r} value={r}>
        {r}
      </option>
    ))}
  </select>

  {/* Rank Filter */}
  <select
    value={rankFilter}
    onChange={(e) => setRankFilter(e.target.value)}
    className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
  >
    <option value="">All Ranks</option>
    {allRanks.map((r) => (
      <option key={r} value={r}>
        {r}
      </option>
    ))}
  </select>

  {/* Add Player Button */}
  <a
    href="/add-players"
    className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition min-w-[150px]"
  >
    <FiPlus className="mr-2" /> Add Player
  </a>
</div>

      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-left divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Photo</th>
              {/* <th className="px-4 py-3">ID</th> */}
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2">
                  <img
                    src={p.playerPic || "https://placehold.co/60x60"}
                    alt={p.name}
                    className="w-10 h-10 rounded-full"
                  />
                </td>
                {/* <td className="px-4 py-2 font-medium">{p.playerId || p._id}</td> */}
                <td className="px-4 py-2">
                  {p.name} {p.playerId}
                </td>
                <td className="px-4 py-2">{p.grade || "—"}</td>
                <td className="px-4 py-2">{p.role}</td>
                <td className="px-4 py-2">{p.country}</td>
                <td className="px-4 py-2">
                  ₹{p.basePrice?.toLocaleString() || 0}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <a
                    href={`/admin/player/${p._id}`}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                  >
                    <FiEye className="mr-1" /> View
                  </a>
                  <a
                    href={`/admin/player/${p._id}/edit`}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                  >
                    <FiEdit className="mr-1" /> Edit
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                  No players found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Table */}
      <div className="md:hidden bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-left divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">Name & Role</th>
              <th className="px-3 py-2">Stats</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr
                key={p._id}
                className="hover:bg-gray-100 transition rounded-lg"
              >
                <td className="px-3 py-4">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{p.role}</p>
                </td>
                <td className="px-3 py-4 text-sm space-y-1">
                  <div className="inline-block px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
                    {p.grade || "—"}
                  </div>
                  <div>{`₹${p.basePrice?.toLocaleString() || 0}`}</div>
                </td>
                <td className="px-3 py-4 flex space-x-2 justify-end">
                  <a
                    href={`/admin/player/${p._id}`}
                    className="flex items-center p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    <FiEye size={16} />
                  </a>
                  <a
                    href={`/players/${p._id}/edit`}
                    className="flex items-center p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition"
                  >
                    <FiEdit size={16} />
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="3" className="px-3 py-6 text-center text-gray-500">
                  No players found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <MobileStickyNav />
    </div>
  );
}
