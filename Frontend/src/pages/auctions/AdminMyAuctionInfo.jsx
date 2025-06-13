import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
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
  const [joinedAuctions, setJoinedAuctions] = useState({}); // Track which auctions have been joined (started)

  const navigate = useNavigate();

  // Fetch auctions from backend and set state
  const fetchAuctions = async () => {
    try {
      const res = await api.get("/get-auction");
      const data = res.data.auctions;
      console.log(data);

      // Normalize auction data: parse start time, no countdown logic here (backend handles it)
      // const normalized = data.map((a) => ({
      //   ...a,
      //   startTime: new Date(`${a.date}T${a.time}:00`), // add seconds for correct Date
      // }));
      const normalized = data.map((a) => ({
        ...a,
        startTime: new Date(`${a.date} ${a.time}`), // ✅ local time
      }));

      setAuctions(normalized);
    } catch (err) {
      console.error("Error fetching auctions:", err);
    }
  };

  useEffect(() => {
    fetchAuctions();

    // Poll backend every 10 seconds for fresh data and status/timer updates
    const interval = setInterval(fetchAuctions, 200);
    return () => clearInterval(interval);
  }, []);

  // Handle starting auction (host clicks Join Auction)
  const handleStartAuction = async (id, status) => {
    if (status !== "upcoming") return;

    try {
      const res = await api.patch(`/start-auction/${id}`);

      if (res.data.status === "live") {
        // Update auction status locally to live and clear countdown timer
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "live", countdownRemaining: 0 } : a
          )
        );
        setJoinedAuctions((prev) => ({ ...prev, [id]: true }));

        // Navigate to auction dashboard or wherever the host should go
        navigate(`/admin/admin-bidding-dashboard/${id}`);
      }
    } catch (err) {
      console.error(
        "Error starting auction:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.error || "Error starting auction");
    }
  };

  // Format countdown seconds into MM:SS
  const formatCountdown = (seconds) => {
    if (seconds == null || seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Format auction time to readable string (e.g., "2:00 PM")
  const formatTime = (timeStr) =>
    new Date(`1970-01-01T${timeStr}:00`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Filter auctions by active tab and search term
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
      {/* Header and Search */}
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

      {/* Auctions List */}
      {filteredAuctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAuctions.map((a) => {
            // Determine if Join Auction button should be shown:
            // Only if auction is upcoming, current time is within start time + 60 min window, and timer > 0
            const startTime = a.startTime;
            const deadline = new Date(startTime.getTime() + 60 * 60 * 1000);
            const canJoin =
              a.status === "upcoming" &&
              now >= startTime &&
              now <= deadline &&
              a.countdownRemaining > 0;
            console.log("startTime:", startTime);
            console.log("now:", now);
            console.log("deadline:", deadline);
            console.log("remaining:", a.countdownRemaining);

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
                    {a.date} at {formatTime(a.time)}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Join Code:{" "}
                    <span className="font-semibold">{a.joinCode}</span>
                  </p>
                  {/* Show countdown timer if upcoming and countdownRemaining present */}
                  {a.status === "upcoming" && a.countdownRemaining > 0 && (
                    <p className="text-sm text-blue-600 font-semibold mt-1">
                      Starts in: {formatCountdown(a.countdownRemaining)}
                    </p>
                  )}

                  {/* Join Auction button */}
                  {canJoin && !joinedAuctions[a.id] && (
                    <button
                      onClick={() => handleStartAuction(a.id, a.status)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Start Auction
                    </button>
                  )}

                  {/* Return to Auction button if auction is live or already joined */}
                  {(a.status === "live" || joinedAuctions[a.id]) && (
                    <button
                      onClick={() =>
                        navigate(`/admin/admin-bidding-dashboard/${a.id}`)
                      }
                      className="mt-2 bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Return to Auction
                    </button>
                  )}

                  {/* Started label for live auctions */}
                  {a.status === "live" && (
                    <p className="mt-1 text-green-700 font-semibold">Started</p>
                  )}

                  {/* Completed label for completed auctions */}
                  {a.status === "completed" && (
                    <p className="mt-1 text-gray-500 font-semibold">
                      Completed
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No auctions found.</p>
      )}
    </div>
  );
}
