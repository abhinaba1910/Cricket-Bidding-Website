import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiPlus, FiEdit, FiClock, FiEye } from "react-icons/fi";
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
  const [viewAuction, setViewAuction] = useState(null);
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    // const socketInstance = io("http://localhost:6001");
    const socketInstance = io("https://cricket-bidding-website-production.up.railway.app");
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
      console.log(data);

      const updated = data.map((a) => {
        const startTime = convertUTCtoIST(a.startDate);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour window

        return {
          ...a,
          startTime,
          endTime,
          countdownStartedAt: a.countdownStartedAt
            ? new Date(a.countdownStartedAt)
            : null,
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
      prev.map((a) => (a.id === auctionId ? { ...a, status: "completed" } : a))
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:pb-14">
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
            className="md:hidden inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap"
          >
            <FiPlus className="mr-2" />
          </Link>
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
  
      {/* Auction Cards */}
      {filteredAuctions.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAuctions.map((a) => {
            const canStart =
              a.status === "upcoming" && now >= a.startTime && now <= a.endTime;
            const hasExpired = a.status === "upcoming" && now > a.endTime;
  
            return (
              <div
                key={a.id}
                className="rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-4 flex flex-col gap-2 h-full">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={a.logo}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover border"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {a.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatISTDate(a.startTime)} · {formatISTTime(a.startTime)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full mt-1 ${
                        statusMap[a.status]
                      }`}
                    >
                      {TABS.find((t) => t.key === a.status)?.label}
                    </span>
                  </div>
  
                  <div className="text-sm text-gray-600 mt-2">
                    <p>
                      <strong>Join Code:</strong> {a.joinCode}
                    </p>
                    <p>
                      <strong>Players:</strong> {a.selectedPlayers?.length || 0}
                    </p>
                    <p>
                      <strong>Teams:</strong> {a.selectedTeams?.length || 0}
                    </p>
                  </div>
  
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    {a.description}
                  </p>
  
                  {hasExpired && (
                    <p className="text-red-600 text-sm font-semibold mt-2">
                      ⚠️ Auction window expired
                    </p>
                  )}
  
                  {a.status === "upcoming" && a.countdownStartedAt && (
                    <AuctionTimer auction={a} onTimerExpired={handleTimerExpired} />
                  )}
  
                  {canStart && (
                    <button
                      onClick={() => handleStartAuction(a.id, a.status)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Start Auction
                    </button>
                  )}
  
                  {(a.status === "live" || joinedAuctions[a.id]) && (
                    <button
                      onClick={() =>
                        navigate(`/admin/admin-bidding-dashboard/${a.id}`)
                      }
                      className="mt-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
                    >
                      Return to Auction
                    </button>
                  )}
                </div>
  
                <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
                  <button
                    onClick={() => setViewAuction(a)}
                    className="text-sm text-blue-600 hover:underline inline-flex items-center"
                  >
                    <FiEye className="mr-1" /> View
                  </button>
  
                  <Link
                    to={`/edit-auction/${a.id}`}
                    className="text-sm bg-yellow-100 text-yellow-800 font-semibold px-3 py-1.5 rounded hover:bg-yellow-200 transition"
                  >
                    ✏️ Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No {activeTab} auctions found.</p>
      )}
  
      {/* View Modal */}
      {viewAuction && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setViewAuction(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
  
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewAuction.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatISTDate(viewAuction.startTime)} ·{" "}
                {formatISTTime(viewAuction.startTime)}
              </p>
            </div>
  
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📝 Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap border rounded-lg p-3 bg-gray-50">
                {viewAuction.description || "No description provided."}
              </p>
            </div>
  
            {/* Players */}
            <details className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="bg-teal-50 px-4 py-2 cursor-pointer font-medium text-teal-700 hover:bg-teal-100 transition-all">
                👤 Selected Players ({viewAuction.selectedPlayers?.length || 0})
              </summary>
              <div className="px-4 py-2">
                {viewAuction.selectedPlayers?.length > 0 ? (
                  <ul className="list-disc pl-6 text-gray-700 max-h-40 overflow-y-auto">
                    {viewAuction.selectedPlayers.map((p, i) => (
                      <li key={i}>{p.name || "Unnamed Player"}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No players selected.</p>
                )}
              </div>
            </details>
  
            {/* Teams */}
            <details className="mb-2 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="bg-indigo-50 px-4 py-2 cursor-pointer font-medium text-indigo-700 hover:bg-indigo-100 transition-all">
                🏏 Selected Teams ({viewAuction.selectedTeams?.length || 0})
              </summary>
              <div className="px-4 py-2">
                {viewAuction.selectedTeams?.length > 0 ? (
                  <ul className="list-disc pl-6 text-gray-700 max-h-40 overflow-y-auto">
                    {viewAuction.selectedTeams.map((t, i) => (
                      <li key={i}>{t?.name || "Unnamed Team"}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No teams selected.</p>
                )}
              </div>
            </details>
          </div>
        </div>
      )}
  
      <MobileStickyNav />
    </div>
  );
  
}
