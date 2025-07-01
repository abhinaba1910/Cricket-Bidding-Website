import React, { useState, useEffect } from "react";
import { FiPlus, FiEye, FiEdit, FiSearch } from "react-icons/fi";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import { useNavigate } from "react-router-dom";
import Api from "../../userManagement/Api";
import toast from "react-hot-toast";

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
  const [isJoining, setIsJoining] = useState(false); // ✅ Added
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await Api.get("/get-all-auctions");
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

  const handleJoinClick = (auctionId) => {
    setSelectedAuctionId(auctionId);
    setShowJoinModal(true);
    setJoinError("");
    setJoinCode("");
  };

  const handleJoinSubmit = async () => {
    setIsJoining(true); // ✅ Start loading
    try {
      const teamRes = await Api.get(`/join-auction/${selectedAuctionId}/teams`);
      const res = await Api.post(`/join-auction/${selectedAuctionId}`, {
        joinCode,
      });

      setShowJoinModal(false);
      if (res.data.alreadyJoined) {
        toast.success("Already joined. Redirecting...");
        setTimeout(() => {
          navigate(`/user-bidding-portal/${selectedAuctionId}`);
        }, 1000); // waits 2 seconds
      } else {
        toast.success("Redirecting...");
        setTimeout(() => {
          navigate(`/user-char-selection/${selectedAuctionId}`);
        }, 1000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to join the auction.";
      toast.error(errorMessage);
      setJoinError(errorMessage);
    } finally {
      setIsJoining(false); // ✅ Stop loading
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
          {/* <a
            href="/create-auction"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap max-md:hidden"
          >
            <FiPlus className="mr-2" /> Create Auction
          </a> */}
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
                  {/* {a.status === "upcoming" && a.countdownRemaining > 0 && (
                    <p className="text-sm text-orange-600 font-medium">
                      <strong>Starts in:</strong>{" "}
                      {formatCountdown(a.countdownRemaining)}
                    </p>
                  )} */}
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
              disabled={isJoining} // ✅ Prevent input during loading
            />
            {joinError && <p className="text-red-500 mb-2">{joinError}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                disabled={isJoining} // ✅ Prevent cancel during loading
              >
                Cancel
              </button>
              <button
                onClick={handleJoinSubmit}
                disabled={isJoining}
                className={`px-4 py-2 rounded text-white ${
                  isJoining
                    ? "bg-teal-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isJoining ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileStickyNav />
    </div>
  );
}
