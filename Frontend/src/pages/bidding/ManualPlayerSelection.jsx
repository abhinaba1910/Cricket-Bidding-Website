// import React, { useState, useMemo, useEffect } from "react";
// import { FiSearch, FiArrowLeft, FiCheck } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import api from "../../userManagement/Api";

// // Filters that match actual backend structure
// const allRoles = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
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

// export default function ManualPlayerSelection() {
//   const navigate = useNavigate();
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [battingFilter, setBattingFilter] = useState("");
//   const [bowlingFilter, setBowlingFilter] = useState("");
//   const [rankFilter, setRankFilter] = useState("");
//   const [players, setPlayers] = useState([]);
//   const [selectedPlayers, setSelectedPlayers] = useState([]);

//   useEffect(() => {
//     api.get("/get-player")
//       .then(res => setPlayers(res.data))
//       .catch(err => console.error("Failed to fetch players", err));
//   }, []);

//   const togglePlayerSelection = (player) => {
//     setSelectedPlayers(prev =>
//       prev.some(p => p._id === player._id)
//         ? prev.filter(p => p._id !== player._id)
//         : [...prev, player]
//     );
//   };

//   const filtered = useMemo(() => {
//     const term = search.toLowerCase();
//     return players.filter(p => {
//       const okSearch =
//         p.name.toLowerCase().includes(term) ||
//         p.country.toLowerCase().includes(term);
//       const okRole = !roleFilter || p.role === roleFilter;
//       const okBat = !battingFilter || p.battingStyle === battingFilter;
//       const okBowl = !bowlingFilter || p.bowlingStyle === bowlingFilter;
//       const okRank = !rankFilter || p.grade === rankFilter;
//       return okSearch && okRole && okBat && okBowl && okRank;
//     });
//   }, [players, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

//   const handleBack = () => navigate("/admin/admin-bidding-dashboard");
//   const handleStartBidding = () => {
//     navigate("/admin/admin-bidding-dashboard", {
//       state: {
//         selectedPlayers: selectedPlayers.map((p, i) => ({
//           ...p,
//           selectionOrder: i + 1
//         }))
//       }
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:px-0 max-md:pb-24">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//           <div className="flex items-center">
//             <button
//               onClick={handleBack}
//               className="mr-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
//             >
//               <FiArrowLeft className="text-gray-700" />
//             </button>
//             <h1 className="text-2xl font-bold text-gray-900">Manual Player Selection</h1>
//           </div>
//           {/* Filters: horizontally scrollable */}
//           <div className="w-full overflow-x-auto">
//             <div className="inline-flex items-center gap-2 py-2 min-w-max">
//               {/* Search */}
//               <div className="relative min-w-[250px]">
//                 <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by name or country…"
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
//                 />
//               </div>

//               {/* Role */}
//               <select
//                 value={roleFilter}
//                 onChange={e => setRoleFilter(e.target.value)}
//                 className="min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
//               >
//                 <option value="">All Roles</option>
//                 {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
//               </select>

//               {/* Batting */}
//               <select
//                 value={battingFilter}
//                 onChange={e => setBattingFilter(e.target.value)}
//                 className="min-w-[220px] border rounded-lg px-3 py-2 focus:outline-none"
//               >
//                 <option value="">All Batting Styles</option>
//                 {allBattingStyles.map(r => <option key={r} value={r}>{r}</option>)}
//               </select>

//               {/* Bowling */}
//               <select
//                 value={bowlingFilter}
//                 onChange={e => setBowlingFilter(e.target.value)}
//                 className="min-w-[220px] border rounded-lg px-3 py-2 focus:outline-none"
//               >
//                 <option value="">All Bowling Styles</option>
//                 {allBowlingStyles.map(r => <option key={r} value={r}>{r}</option>)}
//               </select>

//               {/* Rank */}
//               <select
//                 value={rankFilter}
//                 onChange={e => setRankFilter(e.target.value)}
//                 className="min-w-[140px] border rounded-lg px-3 py-2 focus:outline-none"
//               >
//                 <option value="">All Ranks</option>
//                 {allRanks.map(r => <option key={r} value={r}>{r}</option>)}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Desktop Table */}
//         <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
//           <table className="w-full table-fixed text-left divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="w-12 px-4 py-3">#</th>
//                 <th className="w-16 px-4 py-3">Photo</th>
//                 <th className="px-4 py-3">Name</th>
//                 <th className="px-4 py-3">Rank</th>
//                 <th className="px-4 py-3">Role</th>
//                 <th className="px-4 py-3">Country</th>
//                 <th className="px-4 py-3">Price</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filtered.map(p => {
//                 const isSel = selectedPlayers.some(x => x._id === p._id);
//                 const idx = isSel ? selectedPlayers.findIndex(x => x._id === p._id) + 1 : null;
//                 return (
//                   <tr
//                     key={p._id}
//                     onClick={() => togglePlayerSelection(p)}
//                     className={`cursor-pointer hover:bg-gray-50 transition ${
//                       isSel ? "bg-blue-50" : ""
//                     }`}
//                   >
//                     <td className="px-4 py-2 text-center">
//                       {isSel
//                         ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">{idx}</span>
//                         : <div className="w-8 h-8 rounded-full border-2 border-gray-300" />}
//                     </td>
//                     <td className="px-4 py-2">
//                       <img
//                         src={p.playerPic || "https://placehold.co/60x60"}
//                         alt={p.name}
//                         className="w-10 h-10 rounded-full"
//                       />
//                     </td>
//                     <td className="px-4 py-2">{p.name}</td>
//                     <td className="px-4 py-2">{p.grade || "—"}</td>
//                     <td className="px-4 py-2">{p.role}</td>
//                     <td className="px-4 py-2">{p.country}</td>
//                     <td className="px-4 py-2">₹{p.basePrice?.toLocaleString() || 0}</td>
//                   </tr>
//                 );
//               })}
//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
//                     No players found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile List */}
//         <div className="md:hidden bg-white rounded-lg shadow overflow-hidden">
//           {filtered.map(p => {
//             const isSel = selectedPlayers.some(x => x._id === p._id);
//             const idx = isSel ? selectedPlayers.findIndex(x => x._id === p._id) + 1 : null;
//             return (
//               <div
//                 key={p._id}
//                 onClick={() => togglePlayerSelection(p)}
//                 className={`flex items-center p-4 border-b border-gray-100 ${
//                   isSel ? "bg-blue-50" : ""
//                 }`}
//               >
//                 <div className="mr-4">
//                   {isSel
//                     ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">{idx}</span>
//                     : <div className="w-8 h-8 rounded-full border-2 border-gray-300" />}
//                 </div>
//                 <img
//                   src={p.playerPic || "https://placehold.co/60x60"}
//                   alt={p.name}
//                   className="w-12 h-12 rounded-full mr-4 flex-shrink-0"
//                 />
//                 <div className="flex-1">
//                   <div className="flex justify-between">
//                     <h3 className="font-medium text-gray-900">{p.name}</h3>
//                     <span className={`px-2 py-1 rounded-full text-xs ${
//                       p.grade === "A+" ? "bg-red-100 text-red-800" :
//                       p.grade === "A"  ? "bg-orange-100 text-orange-800" :
//                       p.grade === "B"  ? "bg-yellow-100 text-yellow-800" :
//                                         "bg-gray-100 text-gray-800"
//                     }`}>
//                       {p.grade || "—"}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600">{p.role} • {p.country}</p>
//                   <p className="text-sm font-medium mt-1">
//                     ₹{p.basePrice?.toLocaleString() || 0}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//           {filtered.length === 0 && (
//             <div className="px-4 py-6 text-center text-gray-500">
//               No players found.
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between shadow-lg md:static md:shadow-none md:border-t-0">
//           <button
//             onClick={handleBack}
//             className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
//           >
//             Back
//           </button>
//           <button
//             onClick={handleStartBidding}
//             disabled={selectedPlayers.length === 0}
//             className={`px-6 py-3 rounded-lg font-medium transition ${
//               selectedPlayers.length === 0
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-green-600 text-white hover:bg-green-700"
//             }`}
//           >
//             Start Bidding ({selectedPlayers.length})
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




















import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../userManagement/Api";

const allRoles = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
const allBattingStyles = ["Right Handed Batsman", "Left Handed Batsman"];
const allBowlingStyles = [
  "Right Arm Fast", "Left Arm Fast", "Right Arm Medium", "Left Arm Medium",
  "Right Arm Off Break", "Left Arm Orthodox", "Right Arm Leg Break",
  "Chinaman", "Left Arm Fast Medium", "Right Arm Fast Medium"
];
const allRanks = ["A+", "A", "B", "C"];

export default function ManualPlayerSelection() {
  const navigate = useNavigate();
  const { id } = useParams(); // <--- get id from route params
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [battingFilter, setBattingFilter] = useState("");
  const [bowlingFilter, setBowlingFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/get-auction/${id}`)
      .then(res => {
        const { selectedPlayers } = res.data;
        setPlayers(selectedPlayers || []);
        setSelectedPlayers(selectedPlayers || []);
      })
      .catch(err => console.error("Failed to fetch auction data", err));
  }, [id]);

  const togglePlayerSelection = (player) => {
    setSelectedPlayers(prev =>
      prev.some(p => p._id === player._id)
        ? prev.filter(p => p._id !== player._id)
        : [...prev, player]
    );
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return players.filter(p => {
      const okSearch = p.name.toLowerCase().includes(term) || p.country.toLowerCase().includes(term);
      const okRole = !roleFilter || p.role === roleFilter;
      const okBat = !battingFilter || p.battingStyle === battingFilter;
      const okBowl = !bowlingFilter || p.bowlingStyle === bowlingFilter;
      const okRank = !rankFilter || p.grade === rankFilter;
      return okSearch && okRole && okBat && okBowl && okRank;
    });
  }, [players, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

  const handleBack = () => navigate(`/admin/admin-bidding-dashboard/${id}`);
  const handleStartBidding = () => {
    navigate(`/admin/admin-bidding-dashboard/${id}`, {
      state: {
        selectedPlayers: selectedPlayers.map((p, i) => ({
          ...p,
          selectionOrder: i + 1
        })),
        id
      }
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Manual Player Selection</h1>
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
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
                />
              </div>

              {/* Role */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="min-w-[180px] border rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">All Roles</option>
                {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              {/* Batting */}
              <select
                value={battingFilter}
                onChange={e => setBattingFilter(e.target.value)}
                className="min-w-[220px] border rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">All Batting Styles</option>
                {allBattingStyles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              {/* Bowling */}
              <select
                value={bowlingFilter}
                onChange={e => setBowlingFilter(e.target.value)}
                className="min-w-[220px] border rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">All Bowling Styles</option>
                {allBowlingStyles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              {/* Rank */}
              <select
                value={rankFilter}
                onChange={e => setRankFilter(e.target.value)}
                className="min-w-[140px] border rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">All Ranks</option>
                {allRanks.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

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
              {filtered.map(p => {
                const isSel = selectedPlayers.some(x => x._id === p._id);
                const idx = isSel ? selectedPlayers.findIndex(x => x._id === p._id) + 1 : null;
                return (
                  <tr
                    key={p._id}
                    onClick={() => togglePlayerSelection(p)}
                    className={`cursor-pointer hover:bg-gray-50 transition ${
                      isSel ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2 text-center">
                      {isSel
                        ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">{idx}</span>
                        : <div className="w-8 h-8 rounded-full border-2 border-gray-300" />}
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
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden bg-white rounded-lg shadow overflow-hidden">
          {filtered.map(p => {
            const isSel = selectedPlayers.some(x => x._id === p._id);
            const idx = isSel ? selectedPlayers.findIndex(x => x._id === p._id) + 1 : null;
            return (
              <div
                key={p._id}
                onClick={() => togglePlayerSelection(p)}
                className={`flex items-center p-4 border-b border-gray-100 ${
                  isSel ? "bg-blue-50" : ""
                }`}
              >
                <div className="mr-4">
                  {isSel
                    ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">{idx}</span>
                    : <div className="w-8 h-8 rounded-full border-2 border-gray-300" />}
                </div>
                <img
                  src={p.playerPic || "https://placehold.co/60x60"}
                  alt={p.name}
                  className="w-12 h-12 rounded-full mr-4 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">{p.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      p.grade === "A+" ? "bg-red-100 text-red-800" :
                      p.grade === "A"  ? "bg-orange-100 text-orange-800" :
                      p.grade === "B"  ? "bg-yellow-100 text-yellow-800" :
                                        "bg-gray-100 text-gray-800"
                    }`}>
                      {p.grade || "—"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{p.role} • {p.country}</p>
                  <p className="text-sm font-medium mt-1">
                    ₹{p.basePrice?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            );
          })}
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
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Start Bidding ({selectedPlayers.length})
          </button>
        </div>
      </div>
    </div>
  );
}