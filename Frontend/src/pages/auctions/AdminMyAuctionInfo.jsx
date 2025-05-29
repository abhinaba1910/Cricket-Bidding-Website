// import React, { useEffect, useMemo, useState } from "react";
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

//   useEffect(() => {
//     const fetchAuctions = async () => {
//       try {
//         const res = await api.get("/get-auction");
//         console.log(res);
//         const current = new Date();

//         const categorized = res.data.auctions.map((a) => {
//           const auctionDate = new Date(`${a.date}T${a.time}`);
//           const now = new Date();

//           let status = "upcoming";

//           if (auctionDate.toDateString() === now.toDateString()) {
//             if (auctionDate > now) {
//               status = "upcoming";
//             } else {
//               status = "live";
//             }
//           } else if (auctionDate > now) {
//             status = "upcoming";
//           } else {
//             status = "completed";
//           }

//           return {
//             id: a.id,
//             name: a.name,
//             logo: a.logo,
//             date: a.date,
//             time: a.time,
//             players: a.selectedPlayers.length,
//             teams: a.selectedTeams.length,
//             joinCode: a.joinCode,
//             status,
//           };
//         });

//         console.log("Categories", categorized);
//         setAuctions(categorized);
//       } catch (error) {
//         console.error("Failed to fetch auctions:", error);
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
//           a.id.includes(search)
//       );
//   }, [auctions, activeTab, search]);

//   function formatTimeWithAmPm(time) {
//     return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

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
//             className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap"
//           >
//             <FiPlus className="mr-2" /> Create Auction
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

//       {/* Content */}
//       {filtered.length > 0 ? (
//         <div className="grid gap-4 md:grid-cols-2">
//           {filtered.map((a) => (
//             <div
//               key={a.id}
//               className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row"
//             >
//               <img
//                 src={a.logo}
//                 alt={a.name}
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
//                   {a.date} - {formatTimeWithAmPm(a.time)}
//                 </p>
//                 <div className="text-sm text-gray-600 mt-2 space-y-1">
//                   <p>
//                     <strong>Players:</strong> {a.players}
//                   </p>
//                   <p>
//                     <strong>Teams:</strong> {a.teams}
//                   </p>
//                   <p>
//                     <strong>Join Code:</strong>{" "}
//                     <code className="bg-gray-100 px-1 rounded">
//                       {a.joinCode}
//                     </code>
//                   </p>
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
import React, { useEffect, useMemo, useState } from "react";
import { FiEye, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import api from "../../userManagement/Api";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "live", label: "Live" },
  { key: "completed", label: "Completed" },
];

const statusMap = {
  upcoming: { color: "bg-blue-100 text-blue-800" },
  live: { color: "bg-green-100 text-green-800" },
  completed: { color: "bg-gray-100 text-gray-800" },
};

export default function AuctionsInfo() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [startedAuctions, setStarted] = useState(new Set());

  const secondsDiff = (from, to) => Math.floor((to - from) / 1000);

  useEffect(() => {
    const fetchAuctions = async () => {
      const res = await api.get("/get-auction");
      const now = new Date();

      const cats = res.data.auctions.map((a) => {
        const start = new Date(`${a.date}T${a.time}`);
        const durationMs = (a.durationMinutes || 60) * 60 * 1000;
        const end = new Date(start.getTime() + durationMs);
        const untilStart = secondsDiff(now, start);
        const untilEnd = secondsDiff(now, end);

        let status = "upcoming";
        if (untilEnd <= 0) status = "completed";
        else if (untilStart <= 600) status = "live";

        return {
          ...a,
          status,
          timer: status === "live" ? untilEnd : null,
        };
      });

      setAuctions(cats);
    };

    fetchAuctions();
    const iv = setInterval(fetchAuctions, 30_000);
    return () => clearInterval(iv);
  }, []);

  const filtered = useMemo(() => {
    return auctions
      .filter((a) => a.status === activeTab)
      .filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.id.includes(search)
      );
  }, [auctions, activeTab, search]);

  const fmtTime = (t) =>
    new Date(`1970-01-01T${t}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const fmtCount = (sec) => {
    const m = Math.floor(sec / 60),
      s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const onStartClick = (id) => {
    setStarted((prev) => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-16 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
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
          <Link
            to="/create-auction"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap"
          >
            <FiPlus className="mr-2" /> Create Auction
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl border-2 flex-shrink-0 ${
              activeTab === tab.key
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Auction Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((a) => {
            const isStarted = startedAuctions.has(a.id);

            return (
              <div
                key={a.id}
                className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4"
              >
                {/* Logo */}
                <img
                  src={a.logo}
                  alt={a.name}
                  className="w-16 h-16 rounded mx-auto sm:mx-0"
                />

                {/* Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{a.name}</h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${statusMap[a.status].color}`}
                    >
                      {TABS.find((t) => t.key === a.status)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {a.date} – {fmtTime(a.time)}
                  </p>
                  {a.status === "live" && a.timer != null && (
                    <p className="mt-1 text-sm text-green-700">
                      ⏱ {fmtCount(a.timer)}
                    </p>
                  )}
                  <p className="mt-1 text-sm">
                    Players: {a.selectedPlayers.length}, Teams:{" "}
                    {a.selectedTeams.length}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Join Code: <span className="font-semibold">{a.joinCode}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end">
                  {a.status === "upcoming" && (
                    <>
                      <Link
                        to={`/admin/auctions/${a.id}`}
                        className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <FiEye className="mr-1 inline" /> View
                      </Link>
                      <Link
                        to={`/admin/auctions/${a.id}/edit`}
                        className="px-3 py-1.5 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        <FiEdit className="mr-1 inline" /> Edit
                      </Link>
                    </>
                  )}

                  {a.status === "live" && !isStarted && (
                    <>
                      <button
                        onClick={() => onStartClick(a.id)}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700"
                      >
                        Start
                      </button>
                      <Link
                        to={`/admin/auctions/${a.id}`}
                        className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <FiEye className="mr-1 inline" /> View
                      </Link>
                    </>
                  )}

                  {a.status === "live" && isStarted && (
                    <Link
                      to={`/admin/admin-bidding-dashboard`}
                      className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Join Auction
                    </Link>
                  )}

                  {a.status === "completed" && (
                    <Link
                      to={`/admin/auctions`}
                      className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FiEye className="mr-1 inline" /> View
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No {activeTab} auctions found.</p>
      )}

      <MobileStickyNav />
    </div>
  );
}
