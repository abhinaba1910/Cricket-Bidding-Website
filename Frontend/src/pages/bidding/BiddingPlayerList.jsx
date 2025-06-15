// import React, { useState, useMemo, useEffect } from "react";
// import { FiSearch, FiArrowLeft, FiEye } from "react-icons/fi";
// import { useNavigate,useParams } from "react-router-dom";
// import api from "../../userManagement/Api";

// const allRoles = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
// const allBattingStyles = ["Right Handed Batsman", "Left Handed Batsman"];
// const allBowlingStyles = [
//   "Right Arm Fast", "Left Arm Fast", "Right Arm Medium", "Left Arm Medium",
//   "Right Arm Off Break", "Left Arm Orthodox", "Right Arm Leg Break", "Chinaman",
//   "Left Arm Fast Medium", "Right Arm Fast Medium",
// ];
// const allRanks = ["A+", "A", "B", "C"];

// export default function BiddingPlayerList() {
//   const navigate = useNavigate();
//   const { id } = useParams(); // Assuming you have an auction ID in the URL

//   // filter state
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [battingFilter, setBattingFilter] = useState("");
//   const [bowlingFilter, setBowlingFilter] = useState("");
//   const [rankFilter, setRankFilter] = useState("");

//   // data
//   const [players, setPlayers] = useState([]);
//   useEffect(() => {
//     api.get("/get-player")
//       .then(res => setPlayers(res.data))
//       .catch(err => console.error("Failed to fetch players", err));
//   }, []);

//   // split sold vs unsold
//   const unsold = useMemo(() => players.filter(p => !p.sold), [players]);
//   const sold   = useMemo(() => players.filter(p => p.sold),  [players]);

//   // which tab
//   const [tab, setTab] = useState("unsold"); // 'unsold' or 'sold'
//   const list = tab === "unsold" ? unsold : sold;

//   // apply search & filters
//   const filtered = useMemo(() => {
//     const term = search.toLowerCase();
//     return list.filter(p => {
//       const okSearch =
//         p.name.toLowerCase().includes(term) ||
//         p.country.toLowerCase().includes(term);
//       const okRole = !roleFilter || p.role === roleFilter;
//       const okBat = !battingFilter || p.battingStyle === battingFilter;
//       const okBowl = !bowlingFilter || p.bowlingStyle === bowlingFilter;
//       const okRank = !rankFilter || p.grade === rankFilter;
//       return okSearch && okRole && okBat && okBowl && okRank;
//     });
//   }, [list, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* Back + Tab */}
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//           <button
// onClick={() => navigate(`/admin/admin-bidding-dashboard/${id}`)}
//             className="flex items-center px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
//           >
//             <FiArrowLeft className="mr-2 text-gray-700" /> Back
//           </button>

//           <div className="flex space-x-4">
//             {["unsold","sold"].map(key => (
//               <button
//                 key={key}
//                 onClick={() => setTab(key)}
//                 className={
//                   "px-4 py-2 rounded-full text-sm font-medium " +
//                   (tab === key
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300")
//                 }
//               >
//                 {key === "unsold" ? "Unsold" : "Sold"}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="overflow-x-auto">
//           <div className="inline-flex items-center gap-2 py-2 min-w-max">
//             {/* Search */}
//             <div className="relative min-w-[240px]">
//               <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by name or country…"
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
//               />
//             </div>
//             {/* Role */}
//             <select
//               value={roleFilter}
//               onChange={e => setRoleFilter(e.target.value)}
//               className="min-w-[160px] border rounded-lg px-3 py-2 focus:outline-none"
//             >
//               <option value="">All Roles</option>
//               {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
//             </select>
//             {/* Batting */}
//             <select
//               value={battingFilter}
//               onChange={e => setBattingFilter(e.target.value)}
//               className="min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none"
//             >
//               <option value="">All Batting Styles</option>
//               {allBattingStyles.map(r => <option key={r} value={r}>{r}</option>)}
//             </select>
//             {/* Bowling */}
//             <select
//               value={bowlingFilter}
//               onChange={e => setBowlingFilter(e.target.value)}
//               className="min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none"
//             >
//               <option value="">All Bowling Styles</option>
//               {allBowlingStyles.map(r => <option key={r} value={r}>{r}</option>)}
//             </select>
//             {/* Rank */}
//             <select
//               value={rankFilter}
//               onChange={e => setRankFilter(e.target.value)}
//               className="min-w-[120px] border rounded-lg px-3 py-2 focus:outline-none"
//             >
//               <option value="">All Ranks</option>
//               {allRanks.map(r => <option key={r} value={r}>{r}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* Desktop Table */}
//         <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
//           <table className="w-full table-fixed text-left divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="w-16 px-4 py-3">Photo</th>
//                 <th className="px-4 py-3">Name</th>
//                 <th className="px-4 py-3">Rank</th>
//                 <th className="px-4 py-3">Role</th>
//                 <th className="px-4 py-3">Country</th>
//                 <th className="px-4 py-3">Price</th>
//                 <th className="w-20 px-4 py-3">View</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filtered.map(p => (
//                 <tr key={p._id} className="hover:bg-gray-50">
//                   <td className="px-4 py-2">
//                     <img
//                       src={p.playerPic||"https://placehold.co/60x60"}
//                       alt={p.name}
//                       className="w-10 h-10 rounded-full"
//                     />
//                   </td>
//                   <td className="px-4 py-2">{p.name}</td>
//                   <td className="px-4 py-2">{p.grade||"—"}</td>
//                   <td className="px-4 py-2">{p.role}</td>
//                   <td className="px-4 py-2">{p.country}</td>
//                   <td className="px-4 py-2">₹{p.basePrice?.toLocaleString()||0}</td>
//                   <td className="px-4 py-2">
//                     <button
//                       onClick={() => navigate(`/admin/player/${p._id}`)}
//                       className="p-1 bg-gray-100 rounded hover:bg-gray-200"
//                     >
//                       <FiEye />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
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

//         {/* Mobile Cards */}
//         <div className="md:hidden grid gap-4">
//           {filtered.map(p => (
//             <div
//               key={p._id}
//               className="bg-white rounded-lg shadow p-4 flex items-center"
//             >
//               <img
//                 src={p.playerPic||"https://placehold.co/60x60"}
//                 alt={p.name}
//                 className="w-12 h-12 rounded-full mr-4"
//               />
//               <div className="flex-1">
//                 <h3 className="font-medium text-gray-900">{p.name}</h3>
//                 <p className="text-sm text-gray-600">
//                   {p.role} • {p.country}
//                 </p>
//                 <p className="text-sm font-semibold mt-1">₹{p.basePrice?.toLocaleString()||0}</p>
//               </div>
//               <button
//                 onClick={() => navigate(`/admin/player/${p._id}`)}
//                 className="p-2 bg-gray-100 rounded hover:bg-gray-200"
//               >
//                 <FiEye />
//               </button>
//             </div>
//           ))}
//           {filtered.length === 0 && (
//             <div className="px-4 py-6 text-center text-gray-500">
//               No players found.
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
// );
// }
















import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiArrowLeft, FiEye } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../userManagement/Api";

const allRoles = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
const allBattingStyles = ["Right Handed Batsman", "Left Handed Batsman"];
const allBowlingStyles = [
  "Right Arm Fast", "Left Arm Fast", "Right Arm Medium", "Left Arm Medium",
  "Right Arm Off Break", "Left Arm Orthodox", "Right Arm Leg Break", "Chinaman",
  "Left Arm Fast Medium", "Right Arm Fast Medium",
];
const allRanks = ["A+", "A", "B", "C"];

export default function BiddingPlayerList() {
  const navigate = useNavigate();
  const { id } = useParams(); // Auction ID from URL

  // filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [battingFilter, setBattingFilter] = useState("");
  const [bowlingFilter, setBowlingFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");

  // data
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    // Fetch auction data to get selectedPlayers
    api.get(`/get-auction/${id}`)
      .then(res => {
        setPlayers(res.data.selectedPlayers || []);
        console.log("Players",res.data.selectedPlayers);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch auction players", err);
        setError("Failed to load players");
        setLoading(false);
      });
  }, [id]);

  // split sold vs unsold
  const unsold = useMemo(
      () => players.filter((p) => p.availability === "Available"),
      [players]
    );
  
    const sold = useMemo(
      () => players.filter((p) => p.availability === "Sold"),
      [players]
    );

  // which tab
  const [tab, setTab] = useState("unsold"); // 'unsold' or 'sold'
  const list = tab === "unsold" ? unsold : sold;

  // apply search & filters
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return list.filter(p => {
      const okSearch =
        p.name.toLowerCase().includes(term) ||
        p.country.toLowerCase().includes(term);
      const okRole = !roleFilter || p.role === roleFilter;
      const okBat = !battingFilter || p.battingStyle === battingFilter;
      const okBowl = !bowlingFilter || p.bowlingStyle === bowlingFilter;
      const okRank = !rankFilter || p.grade === rankFilter;
      return okSearch && okRole && okBat && okBowl && okRank;
    });
  }, [list, search, roleFilter, battingFilter, bowlingFilter, rankFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/admin/admin-bidding-dashboard/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back + Tab */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/admin/admin-bidding-dashboard/${id}`)}
            className="flex items-center px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <FiArrowLeft className="mr-2 text-gray-700" /> Back
          </button>

          <div className="flex space-x-4">
          {["unsold", "sold"].map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={
                  "px-4 py-2 rounded-full text-sm font-medium " +
                  (tab === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300")
                }
              >
                {key === "unsold"
                  ? `Available (${unsold.length})`
                  : `Sold (${sold.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="overflow-x-auto">
          <div className="inline-flex items-center gap-2 py-2 min-w-max">
            {/* Search */}
            <div className="relative min-w-[240px]">
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
              className="min-w-[160px] border rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">All Roles</option>
              {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {/* Batting */}
            <select
              value={battingFilter}
              onChange={e => setBattingFilter(e.target.value)}
              className="min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">All Batting Styles</option>
              {allBattingStyles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {/* Bowling */}
            <select
              value={bowlingFilter}
              onChange={e => setBowlingFilter(e.target.value)}
              className="min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">All Bowling Styles</option>
              {allBowlingStyles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {/* Rank */}
            <select
              value={rankFilter}
              onChange={e => setRankFilter(e.target.value)}
              className="min-w-[120px] border rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">All Ranks</option>
              {allRanks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-fixed text-left divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-16 px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Price</th>
                <th className="w-20 px-4 py-3">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <img
                      src={p.playerPic||"https://placehold.co/60x60"}
                      alt={p.name}
                      className="w-10 h-10 rounded-full"
                    />
                  </td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.grade||"—"}</td>
                  <td className="px-4 py-2">{p.role}</td>
                  <td className="px-4 py-2">{p.country}</td>
                  <td className="px-4 py-2">₹{p.basePrice?.toLocaleString()||0}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate(`/admin/player/${p._id}`)}
                      className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                    {players.length === 0 ? "No players in this auction." : "No players found matching your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden grid gap-4">
          {filtered.map(p => (
            <div
              key={p._id}
              className="bg-white rounded-lg shadow p-4 flex items-center"
            >
              <img
                src={p.playerPic||"https://placehold.co/60x60"}
                alt={p.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-600">
                  {p.role} • {p.country}
                </p>
                <p className="text-sm font-semibold mt-1">₹{p.basePrice?.toLocaleString()||0}</p>
              </div>
              <button
                onClick={() => navigate(`/admin/player/${p._id}`)}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                <FiEye />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500">
              {players.length === 0 ? "No players in this auction." : "No players found matching your filters."}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}