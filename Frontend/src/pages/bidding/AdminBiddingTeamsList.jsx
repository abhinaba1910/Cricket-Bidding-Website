import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiEye, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../userManagement/Api";

export default function AdminBiddingTeamsList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch teams once
  useEffect(() => {
    api.get("/get-teams")
      .then(res => setTeams(res.data))
      .catch(err => {
        console.error("Error fetching teams:", err);
        alert("Failed to fetch teams.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter by ID or teamName or shortName
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return teams.filter(t =>
      t._id.includes(search) ||
      t.teamName.toLowerCase().includes(term) ||
      t.shortName.toLowerCase().includes(term)
    );
  }, [teams, search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Back + Title */}
      <div className="flex items-center justify-between mb-6">
        <button
onClick={() => navigate(`/admin/admin-bidding-dashboard/${id}`)}
          className="flex items-center px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <FiArrowLeft className="mr-2 text-gray-700" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <div /> {/* placeholder for spacing */}
      </div>

      {/* Search bar */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="relative">
          <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading teams...</p>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.length > 0 ? filtered.map(team => (
              <div
                key={team._id}
                className="bg-white rounded-lg shadow p-6 flex flex-col"
              >
                <img
                  src={team.logoUrl}
                  alt={team.shortName}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {team.teamName}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  ({team.shortName})
                </p>
                <div className="text-sm text-gray-700 flex-1 space-y-1">
                  <p>
                    <strong>Total Purse:</strong> ₹{Number(team.purse).toLocaleString()}
                  </p>
                  <p>
                    <strong>Remaining:</strong> ₹{Number(team.remainingPurse).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/admin/bidding-teams-view/${team._id}`)}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                >
                  <FiEye className="mr-1" /> View
                </button>
              </div>
            )) : (
              <p className="col-span-full text-center text-gray-500">
                No teams match your search.
              </p>
            )}
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-4">
            {filtered.length > 0 ? filtered.map(team => (
              <div
                key={team._id}
                className="bg-white rounded-lg shadow p-4 flex items-center"
              >
                <img
                  src={team.logoUrl}
                  alt={team.shortName}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{team.teamName}</h3>
                  <p className="text-sm text-gray-600">({team.shortName})</p>
                  <div className="text-sm text-gray-700 mt-1">
                    <span>
                      <strong>Total:</strong> ₹{Number(team.purse).toLocaleString()}
                    </span>
                    <span className="ml-4">
                      <strong>Remaining:</strong> ₹{Number(team.remainingPurse).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/bidding-teams-view/${team._id}`)}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                >
                  <FiEye />
                </button>
              </div>
            )) : (
              <p className="text-center text-gray-500">No teams match your search.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// import React, { useState, useMemo, useEffect } from "react";
// import { FiSearch, FiEye, FiArrowLeft } from "react-icons/fi";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../userManagement/Api";

// export default function AdminBiddingTeamsList() {
//   const navigate = useNavigate();
//   const { id } = useParams(); // Get auction ID from URL
//   const [teams, setTeams] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Fetch auction and extract teams
//   useEffect(() => {
//     if (!id) return;

//     setLoading(true);
//     api
//       .get(`/get-auction/${id}`)
//       .then((res) => {
//         const auction = res.data;
//         console.log(auction.selectedTeams);
//         if (Array.isArray(auction.selectedTeams)) {
//           setTeams(auction.selectedTeams);
//         } else {
//           console.error("Invalid teams format in auction response");
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching auction or teams:", err);
//         alert("Failed to fetch auction teams.");
//       })
//       .finally(() => setLoading(false));
//   }, [id]);

//   // Filter by ID or teamName or shortName
//   const filtered = useMemo(() => {
//     const term = search.toLowerCase();
//     return teams.filter(
//       (t) =>
//         t._id.includes(search) ||
//         t.teamName.toLowerCase().includes(term) ||
//         t.shortName.toLowerCase().includes(term)
//     );
//   }, [teams, search]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       {/* Back + Title */}
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={() => navigate("/admin/admin-bidding-dashboard")}
//           className="flex items-center px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
//         >
//           <FiArrowLeft className="mr-2 text-gray-700" />
//           Back
//         </button>
//         <h1 className="text-2xl font-bold text-gray-900">Teams in Auction</h1>
//         <div /> {/* placeholder */}
//       </div>

//       {/* Search bar */}
//       <div className="max-w-3xl mx-auto mb-6">
//         <div className="relative">
//           <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by ID or name…"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
//           />
//         </div>
//       </div>

//       {loading ? (
//         <p className="text-center text-gray-500">Loading teams...</p>
//       ) : (
//         <>
//           {/* Desktop grid */}
//           <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {filtered.length > 0 ? (
//               filtered.map((team) => (
//                 <div
//                   key={team._id}
//                   className="bg-white rounded-lg shadow p-6 flex flex-col"
//                 >
//                   <img
//                     src={team.logoUrl}
//                     alt={team.shortName}
//                     className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
//                   />
//                   <h3 className="text-lg font-semibold text-gray-900 text-center">
//                     {team.teamName}
//                   </h3>
//                   <p className="text-sm text-gray-500 text-center mb-4">
//                     ({team.shortName})
//                   </p>
//                   <div className="text-sm text-gray-700 flex-1 space-y-1">
//                     <p>
//                       <strong>Total Purse:</strong> ₹
//                       {Number(team.purse).toLocaleString()}
//                     </p>
//                     <p>
//                       <strong>Remaining:</strong> ₹
//                       {Number(team.remainingPurse).toLocaleString()}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() =>
//                       navigate(`/admin/bidding-teams-view/${team._id}`)
//                     }
//                     className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
//                   >
//                     <FiEye className="mr-1" /> View
//                   </button>
//                 </div>
//               ))
//             ) : (
//               <p className="col-span-full text-center text-gray-500">
//                 No teams match your search.
//               </p>
//             )}
//           </div>

//           {/* Mobile list */}
//           <div className="md:hidden space-y-4">
//             {filtered.length > 0 ? (
//               filtered.map((team) => (
//                 <div
//                   key={team._id}
//                   className="bg-white rounded-lg shadow p-4 flex items-center"
//                 >
//                   <img
//                     src={team.logoUrl}
//                     alt={team.shortName}
//                     className="w-12 h-12 rounded-full mr-4 object-cover"
//                   />
//                   <div className="flex-1">
//                     <h3 className="font-medium text-gray-900">
//                       {team.teamName}
//                     </h3>
//                     <p className="text-sm text-gray-600">({team.shortName})</p>
//                     <div className="text-sm text-gray-700 mt-1">
//                       <span>
//                         <strong>Total:</strong> ₹
//                         {Number(team.purse).toLocaleString()}
//                       </span>
//                       <span className="ml-4">
//                         <strong>Remaining:</strong> ₹
//                         {Number(team.remainingPurse).toLocaleString()}
//                       </span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() =>
//                       navigate(`/admin/bidding-teams-view/${team._id}`)
//                     }
//                     className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
//                   >
//                     <FiEye />
//                   </button>
//                 </div>
//               ))
//             ) : (
//               <p className="text-center text-gray-500">
//                 No teams match your search.
//               </p>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
