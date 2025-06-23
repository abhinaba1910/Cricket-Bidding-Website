// import React, { useEffect, useMemo, useState } from "react";
// import { FiSearch, FiPlus, FiEdit } from "react-icons/fi";
// import { Link, useNavigate } from "react-router-dom";
// import MobileStickyNav from "../../components/layout/MobileStickyNav";
// import Api from "../../userManagement/Api";

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

// // Convert UTC date + time to IST Date object
// const convertUTCtoIST = (utcString) => {
//   const formatter = new Intl.DateTimeFormat("en-IN", {
//     timeZone: "Asia/Kolkata",
//     hour12: false,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
//   const parts = formatter.formatToParts(new Date(utcString));
//   const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
//   return new Date(
//     `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:00`
//   );
// };

// export default function AuctionsInfo() {
//   const [activeTab, setActiveTab] = useState("upcoming");
//   const [search, setSearch] = useState("");
//   const [auctions, setAuctions] = useState([]);
//   const [joinedAuctions, setJoinedAuctions] = useState({});
//   const navigate = useNavigate();

//   const fetchAuctions = async () => {
//     try {
//       const res = await Api.get("/get-auction");
//       const data = res.data.auctions;

//       const updated = data.map((a) => {
//         const startTime = convertUTCtoIST(a.startDate);
//         const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window

//         return {
//           ...a,
//           startTime,
//           endTime,
//         };
//       });

//       setAuctions(updated);
//     } catch (err) {
//       console.error("Error fetching auctions:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAuctions();
//     const interval = setInterval(fetchAuctions, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleStartAuction = async (id, status) => {
//     if (status !== "upcoming") return;
//     try {
//       const res = await Api.patch(`/start-auction/${id}`);
//       if (res.data.status === "live") {
//         setAuctions((prev) =>
//           prev.map((a) => (a.id === id ? { ...a, status: "live" } : a))
//         );
//         setJoinedAuctions((prev) => ({ ...prev, [id]: true }));
//         navigate(`/admin/admin-bidding-dashboard/${id}`);
//       }
//     } catch (err) {
//       console.error("Error starting auction:", err);
//       alert(err.response?.data?.error || "Error starting auction");
//     }
//   };

//   const formatISTTime = (dateObj) =>
//     dateObj.toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//   const formatISTDate = (dateObj) =>
//     dateObj.toLocaleDateString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//   const filteredAuctions = useMemo(() => {
//     return auctions
//       .filter((a) => a.status === activeTab)
//       .filter(
//         (a) =>
//           a.name.toLowerCase().includes(search.toLowerCase()) ||
//           a.id.includes(search)
//       );
//   }, [auctions, activeTab, search]);

//   const now = new Date();

//   return (
//     <div className="min-h-screen p-4 md:p-8 pb-16 bg-gray-50">
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
//         <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
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
//           <Link
//             to="/create-auction"
//             className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap"
//           >
//             <FiPlus className="mr-2" /> Create Auction
//           </Link>
//         </div>
//       </div>

//       <div className="flex space-x-4 mb-6 overflow-x-auto">
//         {TABS.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key)}
//             className={`px-4 py-2 rounded-xl border-2 flex-shrink-0 ${
//               activeTab === tab.key
//                 ? "bg-teal-600 text-white border-teal-600"
//                 : "bg-white text-gray-700 border-gray-200"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {filteredAuctions.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {filteredAuctions.map((a) => {
//             const canStart =
//               a.status === "upcoming" && now >= a.startTime && now <= a.endTime;

//             return (
//               <div
//                 key={a.id}
//                 className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4"
//               >
//                 <img
//                   src={a.logo}
//                   alt={a.name}
//                   className="w-16 h-16 rounded mx-auto sm:mx-0"
//                 />

//                 <div className="flex-1">
//                   <div className="flex justify-between items-center">
//                     <h2 className="text-lg font-semibold">{a.name}</h2>
//                     <span
//                       className={`px-2 py-1 text-xs font-medium rounded ${
//                         statusMap[a.status].color
//                       }`}
//                     >
//                       {a.status.toUpperCase()}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600 mb-2">{a.description}</p>
//                   <p className="text-sm text-gray-500">
//                     {formatISTDate(a.startTime)} at {formatISTTime(a.startTime)}{" "}
//                     (IST)
//                   </p>

//                   <p className="mt-1 text-sm text-gray-600">
//                     Join Code:{" "}
//                     <span className="font-semibold">{a.joinCode}</span>
//                   </p>

//                   {canStart && !joinedAuctions[a.id] && (
//                     <button
//                       onClick={() => handleStartAuction(a.id, a.status)}
//                       className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
//                     >
//                       Start Auction
//                     </button>
//                   )}

//                   {(a.status === "live" || joinedAuctions[a.id]) && (
//                     <button
//                       onClick={() =>
//                         navigate(`/admin/admin-bidding-dashboard/${a.id}`)
//                       }
//                       className="mt-2 bg-green-700 text-white px-4 py-2 rounded"
//                     >
//                       Return to Auction
//                     </button>
//                   )}

//                   <Link
//                     to={`/edit-auction/${a.id}`}
//                     className="inline-flex m-2 items-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-[9px] rounded text-sm"
//                   >
//                     <FiEdit className="mr-1" size={14} /> Edit
//                   </Link>

//                   {a.status === "live" && (
//                     <p className="mt-1 text-green-700 font-semibold">Started</p>
//                   )}

//                   {a.status === "completed" && (
//                     <p className="mt-1 text-gray-500 font-semibold">
//                       Completed
//                     </p>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <p className="text-center text-gray-500">No auctions found.</p>
//       )}
//       <MobileStickyNav />
//     </div>
//   );
// }





import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiPlus, FiEdit, FiClock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import Api from "../../userManagement/Api";
import io from "socket.io-client";

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

// Convert UTC date + time to IST Date object
const convertUTCtoIST = (utcString) => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = formatter.formatToParts(new Date(utcString));
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return new Date(
    `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:00`
  );
};

// Timer component for displaying countdown
const AuctionTimer = ({ auction, onTimerExpired }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!auction.countdownStartedAt || auction.status !== "upcoming") {
      setIsActive(false);
      return;
    }

    const startTime = new Date(auction.startDate);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window
    const now = new Date();

    if (now >= startTime && now <= endTime) {
      setIsActive(true);
      const remaining = endTime.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, remaining));
    }
  }, [auction]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1000);
        if (newTime === 0) {
          setIsActive(false);
          onTimerExpired(auction.id);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, auction.id, onTimerExpired]);

  if (!isActive || timeRemaining <= 0) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <div className="flex items-center mt-2 text-orange-600">
      <FiClock className="mr-1" size={16} />
      <span className="text-sm font-semibold">
        Time to start: {minutes}m {seconds}s
      </span>
    </div>
  );
};

export default function AuctionsInfo() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [joinedAuctions, setJoinedAuctions] = useState({});
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io("http://localhost:6001");
    setSocket(socketInstance);

    // Listen for auction timer events
    socketInstance.on("auction:timer-started", (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === data.auctionId
            ? { ...a, countdownStartedAt: data.countdownStartedAt }
            : a
        )
      );
    });

    // Listen for auto-completion events
    socketInstance.on("auction:auto-completed", (data) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === data.auctionId ? { ...a, status: "completed" } : a
        )
      );
      
      // Show notification to user
      if (data.message) {
        alert(data.message);
      }
    });

    // Listen for auction updates
    socketInstance.on("auction:update", (data) => {
      if (data.type === "auction-started") {
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === data.payload.auctionId
              ? { ...a, status: data.payload.status }
              : a
          )
        );
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchAuctions = async () => {
    try {
      const res = await Api.get("/get-auction");
      const data = res.data.auctions;

      const updated = data.map((a) => {
        const startTime = convertUTCtoIST(a.startDate);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window

        return {
          ...a,
          startTime,
          endTime,
          countdownStartedAt: a.countdownStartedAt ? new Date(a.countdownStartedAt) : null,
        };
      });

      setAuctions(updated);

      // Join socket rooms for all auctions
      if (socket) {
        updated.forEach((auction) => {
          socket.emit("join-auction", auction.id);
        });
      }
    } catch (err) {
      console.error("Error fetching auctions:", err);
    }
  };

  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 30000);
    return () => clearInterval(interval);
  }, [socket]);

  const handleStartAuction = async (id, status) => {
    if (status !== "upcoming") return;
    try {
      const res = await Api.patch(`/start-auction/${id}`);
      if (res.data.status === "live") {
        setAuctions((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "live" } : a))
        );
        setJoinedAuctions((prev) => ({ ...prev, [id]: true }));
        navigate(`/admin/admin-bidding-dashboard/${id}`);
      }
    } catch (err) {
      console.error("Error starting auction:", err);
      alert(err.response?.data?.error || "Error starting auction");
    }
  };

  const handleTimerExpired = (auctionId) => {
    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId ? { ...a, status: "completed" } : a
      )
    );
  };

  const formatISTTime = (dateObj) =>
    dateObj.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatISTDate = (dateObj) =>
    dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const filteredAuctions = useMemo(() => {
    return auctions
      .filter((a) => a.status === activeTab)
      .filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.id.includes(search)
      );
  }, [auctions, activeTab, search]);

  const now = new Date();

  return (
    <div className="min-h-screen p-4 md:p-8 pb-16 bg-gray-50">
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

      {filteredAuctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAuctions.map((a) => {
            const canStart =
              a.status === "upcoming" && now >= a.startTime && now <= a.endTime;
            const hasExpired = a.status === "upcoming" && now > a.endTime;

            return (
              <div
                key={a.id}
                className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4"
              >
                <img
                  src={a.logo}
                  alt={a.name}
                  className="w-16 h-16 rounded mx-auto sm:mx-0"
                />

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{a.name}</h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        statusMap[a.status].color
                      }`}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatISTDate(a.startTime)} at {formatISTTime(a.startTime)}{" "}
                    (IST)
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Join Code:{" "}
                    <span className="font-semibold">{a.joinCode}</span>
                  </p>

                  {/* Timer Display */}
                  {a.status === "upcoming" && a.countdownStartedAt && (
                    <AuctionTimer 
                      auction={a} 
                      onTimerExpired={handleTimerExpired}
                    />
                  )}

                  {/* Expired Notice */}
                  {hasExpired && (
                    <div className="mt-2 text-red-600 text-sm font-semibold">
                      ⚠️ Auction window expired - will be marked as completed
                    </div>
                  )}

                  {canStart && !joinedAuctions[a.id] && !hasExpired && (
                    <button
                      onClick={() => handleStartAuction(a.id, a.status)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Start Auction
                    </button>
                  )}

                  {(a.status === "live" || joinedAuctions[a.id]) && (
                    <button
                      onClick={() =>
                        navigate(`/admin/admin-bidding-dashboard/${a.id}`)
                      }
                      className="mt-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors"
                    >
                      Return to Auction
                    </button>
                  )}

                  <Link
                    to={`/edit-auction/${a.id}`}
                    className="inline-flex m-2 items-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-[9px] rounded text-sm transition-colors"
                  >
                    <FiEdit className="mr-1" size={14} /> Edit
                  </Link>

                  {a.status === "live" && (
                    <p className="mt-1 text-green-700 font-semibold">Started</p>
                  )}

                  {a.status === "completed" && (
                    <div className="mt-1">
                      <p className="text-gray-500 font-semibold">Completed</p>
                      {a.countdownStartedAt && (
                        <p className="text-xs text-gray-400">
                          Auto-completed due to timeout
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No auctions found.</p>
      )}
      <MobileStickyNav />
    </div>
  );
}