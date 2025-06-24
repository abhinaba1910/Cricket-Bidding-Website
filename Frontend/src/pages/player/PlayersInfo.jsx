// import React, { useState, useMemo, useEffect } from "react";
// import { FiSearch, FiEye, FiEdit, FiPlus, FiSend, FiX } from "react-icons/fi";
// import MobileStickyNav from "../../components/layout/MobileStickyNav";
// import Api from "../../userManagement/Api";
// import { formatIndianNumber } from "../../types/formatIndianNumber";
// import toast from "react-hot-toast";

// const allRoles = [
//   "Batsman",
//   "Fast all-rounder",
//   "Spin all-rounder",
//   "Wicket keeper batsman",
//   "Spin bowler",
//   "Fast bowler",
// ];

// const allBattingStyles = ["Right Handed Batsman", "Left Handed Batsman"];

// const allBowlingStyles = [
//   "Right Arm Fast",
//   "Left Arm Fast",
//   "Right Arm Medium",
//   "Left Arm Medium",
//   "Right Arm Off Break",
//   "Left Arm Orthodox",
//   "Right Arm Leg Break",
//   "Chinaman",
//   "Left Arm Fast Medium",
//   "Right Arm Fast Medium",
// ];

// const allRanks = ["A+", "A", "B", "C"];

// export default function PlayersInfo() {
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [battingFilter, setBattingFilter] = useState("");
//   const [bowlingFilter, setBowlingFilter] = useState("");
//   const [rankFilter, setRankFilter] = useState("");
//   const [players, setPlayers] = useState([]);

//   // Transfer Modal States
//   const [showTransferModal, setShowTransferModal] = useState(false);
//   const [selectedPlayer, setSelectedPlayer] = useState(null);
//   const [teams, setTeams] = useState([]);
//   const [selectedTeam, setSelectedTeam] = useState("");
//   const [transferPrice, setTransferPrice] = useState("");
//   const [isTransferring, setIsTransferring] = useState(false);

//   useEffect(() => {
//     const fetchPlayers = async () => {
//       try {
//         const res = await Api.get("/get-player");
//         setPlayers(res.data);
//       } catch (err) {
//         console.error("Failed to fetch players", err);
//       }
//     };
//     fetchPlayers();
//   }, []);

//   const fetchTeams = async () => {
//     try {
//       const res = await Api.get("/get-teams");
//       setTeams(res.data);
//       console.log("Teamssssss", res.data);
//     } catch (err) {
//       console.error("Failed to fetch teams", err);
//       toast.error("Failed to fetch teams. Please try again.");
//     }
//   };

//   const filtered = useMemo(() => {
//     const term = search.toLowerCase();
//     return players.filter((p) => {
//       const matchesSearch =
//         p.name.toLowerCase().includes(term) ||
//         p.country.toLowerCase().includes(term);

//       const matchesRole = !roleFilter || p.role === roleFilter;
//       const matchesBatting = !battingFilter || p.battingStyle === battingFilter;
//       const matchesBowling = !bowlingFilter || p.bowlingStyle === bowlingFilter;
//       const matchesRank = !rankFilter || p.grade === rankFilter;

//       return (
//         matchesSearch &&
//         matchesRole &&
//         matchesBatting &&
//         matchesBowling &&
//         matchesRank
//       );
//     });
//   }, [players, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

//   const handleDirectTransfer = async (playerId) => {
//     const player = players.find((p) => p._id === playerId);
//     if (!player) return;

//     setSelectedPlayer(player);
//     setTransferPrice(player.basePrice?.toString() || "0");
//     setShowTransferModal(true);
//     await fetchTeams();
//   };

//   const handleTeamSelect = (teamId) => {
//     setSelectedTeam(teamId);
//   };

//   const handleTransferSubmit = async () => {
//     if (!selectedTeam) {
//       toast.error("Please select a team");
//       return;
//     }

//     if (!transferPrice || isNaN(transferPrice) || Number(transferPrice) < 0) {
//       toast.error("Please enter a valid price");
//       return;
//     }

//     setIsTransferring(true);
//     try {
//       const response = await Api.post(
//         `/transfer-player/${selectedPlayer._id}`,
//         {
//           teamId: selectedTeam,
//           price: Number(transferPrice),
//         }
//       );

//       if (response.status === 200) {
//         toast.success("Player transferred successfully!");
//         // Update the players list to reflect the transfer
//         setPlayers((prev) =>
//           prev.map((p) =>
//             p._id === selectedPlayer._id ? { ...p, availability: "Sold" } : p
//           )
//         );
//         closeTransferModal();
//       }
//     } catch (err) {
//       console.error("Transfer failed:", err);
//       const errorMessage =
//         err.response?.data?.error || "Transfer failed. Please try again.";
//       toast.error(errorMessage);
//     } finally {
//       setIsTransferring(false);
//     }
//   };

//   const closeTransferModal = () => {
//     setShowTransferModal(false);
//     setSelectedPlayer(null);
//     setSelectedTeam("");
//     setTransferPrice("");
//     setTeams([]);
//   };

//   const selectedTeamName =
//     teams.find((t) => t._id === selectedTeam)?.name || "";

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:px-0 max-md:pb-14">
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
//         <h1 className="text-2xl font-bold text-gray-900">Players</h1>
//         <div className="flex flex-wrap gap-3 w-full md:items-center">
//           <div className="relative flex-1 min-w-[220px]">
//             <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by name or country…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
//             />
//           </div>

//           <select
//             value={roleFilter}
//             onChange={(e) => setRoleFilter(e.target.value)}
//             className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
//           >
//             <option value="">All Roles</option>
//             {allRoles.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>

//           <select
//             value={battingFilter}
//             onChange={(e) => setBattingFilter(e.target.value)}
//             className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
//           >
//             <option value="">All Batting Styles</option>
//             {allBattingStyles.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>

//           <select
//             value={bowlingFilter}
//             onChange={(e) => setBowlingFilter(e.target.value)}
//             className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
//           >
//             <option value="">All Bowling Styles</option>
//             {allBowlingStyles.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>

//           <select
//             value={rankFilter}
//             onChange={(e) => setRankFilter(e.target.value)}
//             className="flex-1 min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
//           >
//             <option value="">All Ranks</option>
//             {allRanks.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>

//           <a
//             href="/add-players"
//             className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition min-w-[150px]"
//           >
//             <FiPlus className="mr-2" /> Add Player
//           </a>
//         </div>
//       </div>

//       {/* Desktop Table */}
//       <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
//         <table className="min-w-full text-left divide-y divide-gray-200">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-3">Photo</th>
//               <th className="px-4 py-3">Name</th>
//               <th className="px-4 py-3">Rank</th>
//               <th className="px-4 py-3">Role</th>
//               <th className="px-4 py-3">Country</th>
//               <th className="px-4 py-3">Price</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {filtered.map((p) => (
//               <tr key={p._id} className="hover:bg-gray-50 transition">
//                 <td className="px-4 py-2">
//                   <img
//                     src={p.playerPic || "https://placehold.co/60x60"}
//                     alt={p.name}
//                     className="w-10 h-10 rounded-full"
//                   />
//                 </td>
//                 <td className="px-4 py-2">
//                   {p.name} {p.playerId}
//                 </td>
//                 <td className="px-4 py-2">{p.grade || "—"}</td>
//                 <td className="px-4 py-2">{p.role}</td>
//                 <td className="px-4 py-2">{p.country}</td>
//                 <td className="px-4 py-2">
//                   ₹{formatIndianNumber(p.basePrice) || "0"}
//                 </td>
//                 <td className="px-4 py-2">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       p.availability === "Sold"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-green-100 text-green-800"
//                     }`}
//                   >
//                     {p.availability || "Available"}
//                   </span>
//                 </td>
//                 <td className="px-4 py-2 space-x-2">
//                   <a
//                     href={`/admin/player/${p._id}`}
//                     className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
//                     title="View"
//                   >
//                     <FiEye size={16} />
//                   </a>
//                   <a
//                     href={`/admin/player/${p._id}/edit`}
//                     className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
//                     title="Edit"
//                   >
//                     <FiEdit size={16} />
//                   </a>
//                   {p.availability !== "Sold" && (
//                     <button
//                       onClick={() => handleDirectTransfer(p._id)}
//                       className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
//                       title="Direct Transfer"
//                     >
//                       <FiSend size={16} />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
//                   No players found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Mobile Table */}
//       <div className="md:hidden bg-white rounded-lg shadow overflow-x-auto">
//         <table className="min-w-full text-left divide-y divide-gray-200">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-3 py-2">Name & Role</th>
//               <th className="px-3 py-2">Stats</th>
//               <th className="px-3 py-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {filtered.map((p) => (
//               <tr
//                 key={p._id}
//                 className="hover:bg-gray-100 transition rounded-lg"
//               >
//                 <td className="px-3 py-4">
//                   <p className="font-medium text-gray-900">{p.name}</p>
//                   <p className="text-sm text-gray-600 mt-1">{p.role}</p>
//                   <span
//                     className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
//                       p.availability === "Sold"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-green-100 text-green-800"
//                     }`}
//                   >
//                     {p.availability || "Available"}
//                   </span>
//                 </td>
//                 <td className="px-3 py-4 text-sm space-y-1">
//                   <div className="inline-block px-2 py-1 bg-indigo-100 rounded-full text-indigo-800">
//                     {p.grade || "—"}
//                   </div>
//                   <div>{`₹${formatIndianNumber(p.basePrice) || "0"}`}</div>
//                 </td>
//                 <td className="px-3 py-4 flex space-x-2 justify-end">
//                   <a
//                     href={`/admin/player/${p._id}`}
//                     className="flex items-center p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//                     title="View"
//                   >
//                     <FiEye size={16} />
//                   </a>
//                   <a
//                     href={`/admin/player/${p._id}/edit`}
//                     className="flex items-center p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition"
//                     title="Edit"
//                   >
//                     <FiEdit size={16} />
//                   </a>
//                   {p.availability !== "Sold" && (
//                     <button
//                       onClick={() => handleDirectTransfer(p._id)}
//                       className="flex items-center p-2 bg-green-100 rounded-full hover:bg-green-200 transition"
//                       title="Transfer"
//                     >
//                       <FiSend size={16} />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan="3" className="px-3 py-6 text-center text-gray-500">
//                   No players found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Transfer Modal */}
//       {showTransferModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Transfer Player
//               </h2>
//               <button
//                 onClick={closeTransferModal}
//                 className="text-gray-400 hover:text-gray-600 transition"
//               >
//                 <FiX size={24} />
//               </button>
//             </div>

//             <div className="p-6">
//               {selectedPlayer && (
//                 <div className="mb-6">
//                   <div className="flex items-center space-x-4 mb-4">
//                     <img
//                       src={
//                         selectedPlayer.playerPic || "https://placehold.co/60x60"
//                       }
//                       alt={selectedPlayer.name}
//                       className="w-16 h-16 rounded-full"
//                     />
//                     <div>
//                       <h3 className="text-lg font-semibold">
//                         {selectedPlayer.name}
//                       </h3>
//                       <p className="text-gray-600">{selectedPlayer.role}</p>
//                       <p className="text-sm text-gray-500">
//                         Base Price: ₹{formatIndianNumber(selectedPlayer.basePrice) || "0"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Select Team
//                   </label>
//                   {teams.length === 0 ? (
//                     <p className="text-gray-500 py-4 text-center">
//                       No teams available. Please create a team first.
//                     </p>
//                   ) : (
//                     <div className="space-y-2 max-h-48 overflow-y-auto">
//                       {teams.map((team) => (
//                         <div
//                           key={team._id}
//                           onClick={() => handleTeamSelect(team._id)}
//                           className={`p-3 border rounded-lg cursor-pointer transition ${
//                             selectedTeam === team._id
//                               ? "border-teal-500 bg-teal-50"
//                               : "border-gray-200 hover:border-gray-300"
//                           }`}
//                         >
//                           <div className="flex justify-between items-center">
//                             <div>
//                               <h4 className="font-medium">{team.shortName}</h4>
//                               <p className="text-sm text-gray-600">
//                                 Players: {team.players?.length || 0}
//                               </p>
//                             </div>
//                             {selectedTeam === team._id && (
//                               <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {selectedTeam && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Transfer Price (₹)
//                     </label>
//                     <input
//                       type="number"
//                       value={transferPrice}
//                       onChange={(e) => setTransferPrice(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       placeholder="Enter transfer price"
//                       min="0"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       Default: ₹{formatIndianNumber(selectedPlayer?.basePrice) || "0"}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex space-x-3 mt-6">
//                 <button
//                   onClick={closeTransferModal}
//                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                   disabled={isTransferring}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleTransferSubmit}
//                   disabled={
//                     !selectedTeam || isTransferring || teams.length === 0
//                   }
//                   className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
//                 >
//                   {isTransferring ? "Transferring..." : "Transfer"}
//                 </button>
//               </div>

//               {selectedTeam && selectedTeamName && (
//                 <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                   <p className="text-sm text-blue-800">
//                     <strong>Selected Team:</strong> {selectedTeamName}
//                   </p>
//                   <p className="text-sm text-blue-600">
//                     Transfer Price: ₹{formatIndianNumber(transferPrice) || "0"}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <MobileStickyNav />
//     </div>
//   );
// }
import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiEye, FiEdit, FiPlus, FiSend, FiX } from "react-icons/fi";
import { IoMdAirplane } from "react-icons/io";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import Api from "../../userManagement/Api";
import { formatIndianNumber } from "../../types/formatIndianNumber";
import toast from "react-hot-toast";

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

  // Transfer Modal States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [transferPrice, setTransferPrice] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await Api.get("/get-player");
        setPlayers(res.data);
      } catch (err) {
        console.error("Failed to fetch players", err);
      }
    };
    fetchPlayers();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await Api.get("/get-teams");
      setTeams(res.data);
      console.log("Teamssssss", res.data);
    } catch (err) {
      console.error("Failed to fetch teams", err);
      toast.error("Failed to fetch teams. Please try again.");
    }
  };

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

  const handleDirectTransfer = async (playerId) => {
    const player = players.find((p) => p._id === playerId);
    if (!player) return;

    setSelectedPlayer(player);
    setTransferPrice(player.basePrice?.toString() || "0");
    setShowTransferModal(true);
    await fetchTeams();
  };

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
  };

  const handleTransferSubmit = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    if (!transferPrice || isNaN(transferPrice) || Number(transferPrice) < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsTransferring(true);
    try {
      const response = await Api.post(
        `/transfer-player/${selectedPlayer._id}`,
        {
          teamId: selectedTeam,
          price: Number(transferPrice),
        }
      );

      if (response.status === 200) {
        toast.success("Player transferred successfully!");
        // Update the players list to reflect the transfer
        setPlayers((prev) =>
          prev.map((p) =>
            p._id === selectedPlayer._id ? { ...p, availability: "Sold" } : p
          )
        );
        closeTransferModal();
      }
    } catch (err) {
      console.error("Transfer failed:", err);
      const errorMessage =
        err.response?.data?.error || "Transfer failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setSelectedPlayer(null);
    setSelectedTeam("");
    setTransferPrice("");
    setTeams([]);
  };

  const selectedTeamName =
    teams.find((t) => t._id === selectedTeam)?.name || "";

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 lg:p-8 max-md:px-0 max-md:pb-14">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 px-3 md:px-0">
          Players
        </h1>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 w-full">
          <div className="relative w-full md:min-w-[220px] md:flex-1">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:min-w-[180px] md:flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All Roles</option>
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={battingFilter}
            onChange={(e) => setBattingFilter(e.target.value)}
            className="w-full md:min-w-[180px] md:flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All Batting Styles</option>
            {allBattingStyles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={bowlingFilter}
            onChange={(e) => setBowlingFilter(e.target.value)}
            className="w-full md:min-w-[180px] md:flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All Bowling Styles</option>
            {allBowlingStyles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="w-full md:min-w-[180px] md:flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All Ranks</option>
            {allRanks.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <a
            href="/add-players"
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Base Price</th>
              <th className="px-4 py-3">Status</th>
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
                <td className="px-4 py-2">
                  {p.name} {p.playerId}
                </td>
                <td className="px-4 py-2">{p.grade || "—"}</td>
                <td className="px-4 py-2">{p.role}</td>
                <td className="px-4 py-6 flex items-center gap-1">
                  {p.country}
                  {p.country.toLowerCase() !== "india" && (
                    <IoMdAirplane
                      className="text-blue-500"
                      title="Overseas Player"
                    />
                  )}
                </td>

                <td className="px-4 py-2">
                  ₹{formatIndianNumber(p.basePrice) || "0"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.availability === "Sold"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {p.availability || "Available"}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <a
                    href={`/admin/player/${p._id}`}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                    title="View"
                  >
                    <FiEye size={16} />
                  </a>
                  <a
                    href={`/admin/player/${p._id}/edit`}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                    title="Edit"
                  >
                    <FiEdit size={16} />
                  </a>
                  {p.availability !== "Sold" && (
                    <button
                      onClick={() => handleDirectTransfer(p._id)}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                      title="Direct Transfer"
                    >
                      <FiSend size={16} />
                    </button>
                  )}
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
      <div className="md:hidden">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            src={p.playerPic || "https://placehold.co/40x40"}
                            alt={p.name}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            {p.country}
                            {p.country.toLowerCase() !== "india" && (
                              <IoMdAirplane
                                className="text-blue-500"
                                title="Overseas Player"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{p.role}</div>
                      <div className="text-xs text-gray-500">
                        <span
                          className={`inline-block px-2 py-1 rounded-full ${
                            p.availability === "Sold"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {p.availability || "Available"}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        ₹{formatIndianNumber(p.basePrice) || "0"}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={`/admin/player/${p._id}`}
                          className="inline-flex items-center p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                          title="View"
                        >
                          <FiEye size={14} />
                        </a>
                        <a
                          href={`/admin/player/${p._id}/edit`}
                          className="inline-flex items-center p-1.5 bg-blue-100 rounded hover:bg-blue-200"
                          title="Edit"
                        >
                          <FiEdit size={14} />
                        </a>
                        {p.availability !== "Sold" && (
                          <button
                            onClick={() => handleDirectTransfer(p._id)}
                            className="inline-flex items-center p-1.5 bg-green-100 rounded hover:bg-green-200"
                            title="Transfer"
                          >
                            <FiSend size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No players found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Transfer Player
              </h2>
              <button
                onClick={closeTransferModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {selectedPlayer && (
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={
                        selectedPlayer.playerPic || "https://placehold.co/60x60"
                      }
                      alt={selectedPlayer.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedPlayer.name}
                      </h3>
                      <p className="text-gray-600">{selectedPlayer.role}</p>
                      <p className="text-sm text-gray-500">
                        Base Price: ₹
                        {formatIndianNumber(selectedPlayer.basePrice) || "0"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Team
                  </label>
                  {teams.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">
                      No teams available. Please create a team first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {teams.map((team) => (
                        <div
                          key={team._id}
                          onClick={() => handleTeamSelect(team._id)}
                          className={`p-3 border rounded-lg cursor-pointer transition ${
                            selectedTeam === team._id
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{team.shortName}</h4>
                              <p className="text-sm text-gray-600">
                                Players: {team.players?.length || 0}
                              </p>
                            </div>
                            {selectedTeam === team._id && (
                              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTeam && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Price (₹)
                    </label>
                    <input
                      type="number"
                      value={transferPrice}
                      onChange={(e) => setTransferPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter transfer price"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default: ₹
                      {formatIndianNumber(selectedPlayer?.basePrice) || "0"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 mt-6">
                <button
                  onClick={closeTransferModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={isTransferring}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferSubmit}
                  disabled={
                    !selectedTeam || isTransferring || teams.length === 0
                  }
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isTransferring ? "Transferring..." : "Transfer"}
                </button>
              </div>

              {selectedTeam && selectedTeamName && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Team:</strong> {selectedTeamName}
                  </p>
                  <p className="text-sm text-blue-600">
                    Transfer Price: ₹{formatIndianNumber(transferPrice) || "0"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MobileStickyNav />
    </div>
  );
}
