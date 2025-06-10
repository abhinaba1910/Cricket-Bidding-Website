// // src/pages/AuctionsInfo.jsx
// import React, { useState, useMemo, useEffect } from "react";
// import { FiPlus, FiEye, FiEdit, FiSearch } from "react-icons/fi";
// import MobileStickyNav from "../../components/layout/MobileStickyNav";
// import api from "../../userManagement/Api";

// const TABS = [
//   { key: "upcoming", label: "Upcoming" },
//   { key: "live", label: "Live" },
//   { key: "completed", label: "Completed" },
// ];

// const statusMap = {
//   upcoming: { color: "bg-blue-100 text-blue-800" },
//   live: { color: "bg-green-100 text-green-800" },
//   completed: { color: "bg-gray-100 text-gray-800" },
// };

// export default function AuctionsInfo() {
//   const [activeTab, setActiveTab] = useState("upcoming");
//   const [search, setSearch] = useState("");
//   const [auctions, setAuctions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAuctions = async () => {
//       setLoading(true);
//       try {
//         const res = await api.get("/get-all-auctions");
//         setAuctions(res.data.auctions);
//       } catch (err) {
//         console.error("Failed to fetch auctions:", err);
//         setError("Failed to load auctions.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAuctions();
//   }, []);

//   const filtered = useMemo(() => {
//     return auctions
//       .filter((a) => a.status === activeTab)
//       .filter(
//         (a) =>
//           a.name.toLowerCase().includes(search.toLowerCase()) ||
//           a.id.toLowerCase().includes(search.toLowerCase())
//       );
//   }, [auctions, activeTab, search]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:pb-14">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
//         <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
//         <div className="flex space-x-2 w-full md:w-auto">
//           <div className="relative flex-1">
//             <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by ID or name…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-3 py-2 border rounded-lg"
//             />
//           </div>
//           <a
//             href="/create-auction"
//             className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap max-md:hidden"
//           >
//             <FiPlus className="mr-2" /> Create Auction
//           </a>
//           <a
//             href="/create-auction"
//             className="md:hidden inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap"
//           >
//             <FiPlus className="mr-2" />
//           </a>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex space-x-4 mb-6 overflow-x-auto">
//         {TABS.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key)}
//             className={`px-4 py-3 rounded-xl border-gray-200 max-md:text-sm max-md:px-2 max-md:py-2 shadow-lg border-[2px] whitespace-nowrap ${
//               activeTab === tab.key
//                 ? "bg-teal-600 text-white"
//                 : "bg-white text-gray-700 shadow"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Loading/Error */}
//       {loading ? (
//         <p className="text-gray-500">Loading auctions…</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : filtered.length > 0 ? (
//         <div className="grid gap-4 md:grid-cols-2">
//           {filtered.map((a) => (
//             <div
//               key={a.id}
//               className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row"
//             >
//               <img
//                 src={a.logo}
//                 alt=""
//                 className="w-14 h-14 rounded mr-4 flex-shrink-0"
//               />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="text-lg font-medium text-gray-900">
//                       {a.name}
//                     </h3>
//                     {/* <p className="text-xs text-gray-500">ID: {a.id}</p> */}
//                   </div>
//                   <span
//                     className={`px-2 py-1 text-xs font-semibold rounded ${
//                       statusMap[a.status].color
//                     }`}
//                   >
//                     {TABS.find((t) => t.key === a.status)?.label}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {a.date} · {a.time}
//                 </p>
//                 <div className="text-sm text-gray-600 mt-2 space-y-1">
//                   <p>
//                     <strong>Players:</strong> {a.players}
//                   </p>
//                   <p>
//                     <strong>Teams:</strong> {a.teams}
//                   </p>
//                   {/* <p>
//                     <strong>Join Code:</strong>{' '}
//                     <code className="bg-gray-100 px-1 rounded">{a.joinCode}</code>
//                   </p> */}
//                 </div>
//               </div>
//               <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 space-x-2">
//                 <a
//                   href={`/auctions/${a.id}`}
//                   className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
//                 >
//                   <FiEye className="mr-1" /> View
//                 </a>
//                 <a
//                   href={`/auctions/${a.id}/edit`}
//                   className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
//                 >
//                   <FiEdit className="mr-1" /> Edit
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500">No {activeTab} auctions found.</p>
//       )}
//       <MobileStickyNav />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { FiPlus, FiEye, FiEdit, FiSearch } from "react-icons/fi";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import api from "../../userManagement/Api";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "live", label: "Live" },
  { key: "completed", label: "Completed" },
];

const statusMap = {
  upcoming: "bg-blue-100 text-blue-800",
  live: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function AuctionsInfo() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [auctionsByStatus, setAuctionsByStatus] = useState({
    upcoming: [],
    live: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await api.get("/get-all-auctions");
        const grouped = {
          upcoming: [],
          live: [],
          completed: [],
        };

        res.data.auctions.forEach((a) => {
          grouped[a.status]?.push(a);
        });

        setAuctionsByStatus(grouped);
      } catch (err) {
        console.error("Failed to fetch auctions:", err);
        setError("Failed to load auctions.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filtered = auctionsByStatus[activeTab].filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
  );

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleJoinClick = (auctionId) => {
    setSelectedAuctionId(auctionId);
    setShowJoinModal(true);
    setJoinError("");
    setJoinCode("");
  };

  const handleJoinSubmit = async () => {
    try {
      const res = await api.post(`/join-auction/${selectedAuctionId}`, {
        joinCode,
      });
      if (res.status === 200) {
        setShowJoinModal(false);
        // navigate(`/user-bidding-portal/${selectedAuctionId}`);
        navigate('/user-char-selection');
      }
    } catch (err) {
      console.error(err);
      setJoinError(
        err.response?.data?.message || "Failed to join the auction."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:pb-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
        <div className="flex space-x-2 w-full md:w-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
            />
          </div>
          <a
            href="/create-auction"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap max-md:hidden"
          >
            <FiPlus className="mr-2" /> Create Auction
          </a>
          <a
            href="/create-auction"
            className="md:hidden inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap"
          >
            <FiPlus className="mr-2" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 rounded-xl border-gray-200 max-md:text-sm max-md:px-2 max-md:py-2 shadow-lg border-[2px] whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-teal-600 text-white"
                : "bg-white text-gray-700 shadow"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Loading auctions…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row"
            >
              <img
                src={a.logo}
                alt=""
                className="w-14 h-14 rounded mr-4 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {a.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      statusMap[a.status]
                    }`}
                  >
                    {TABS.find((t) => t.key === a.status)?.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {a.date} · {a.time}
                </p>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <p>
                    <strong>Players:</strong> {a.selectedPlayers?.length || 0}
                  </p>
                  <p>
                    <strong>Teams:</strong> {a.selectedTeams?.length || 0}
                  </p>
                  {a.status === "upcoming" && a.countdownRemaining > 0 && (
                    <p className="text-sm text-orange-600 font-medium">
                      <strong>Starts in:</strong>{" "}
                      {formatCountdown(a.countdownRemaining)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 space-x-2 flex flex-col sm:flex-row sm:space-y-0 space-y-2">
                <a
                  href={`#`}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  <FiEye className="mr-1" /> View
                </a>

                {a.status === "live" && (
                  <button
                    onClick={() => handleJoinClick(a.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    🔑 Join Auction
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No {activeTab} auctions found.</p>
      )}

      {/* Join Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Enter Join Code</h2>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Join Code"
              className="w-full px-4 py-2 border rounded mb-3"
            />
            {joinError && <p className="text-red-500 mb-2">{joinError}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinSubmit}
                
                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileStickyNav />
    </div>
  );
}