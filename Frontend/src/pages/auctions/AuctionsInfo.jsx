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
  const [viewModalAuction, setViewModalAuction] = useState(null);
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
        console.log(res.data);
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

      {/* Auction Cards */}
      {loading ? (
        <p className="text-gray-500">Loading auctions…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
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
                        {a.date} · {a.time}
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
                    <strong>Players:</strong> {a.selectedPlayers?.length || 0}
                  </p>
                  <p>
                    <strong>Teams:</strong> {a.selectedTeams?.length || 0}
                  </p>
                </div>

                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {a.description}
                </p>
              </div>

              <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
                <button
                  onClick={() => setViewModalAuction(a)}
                  className="text-sm text-blue-600 hover:underline inline-flex items-center"
                >
                  <FiEye className="mr-1" /> View
                </button>

                {a.status === "live" && (
                  <button
                    onClick={() => handleJoinClick(a.id)}
                    className="text-sm bg-green-100 text-green-800 font-semibold px-3 py-1.5 rounded hover:bg-green-200 transition"
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

      {/* View Modal */}
      {viewModalAuction && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setViewModalAuction(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewModalAuction.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {viewModalAuction.date} · {viewModalAuction.time}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📝 Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap border rounded-lg p-3 bg-gray-50">
                {viewModalAuction.description || "No description provided."}
              </p>
            </div>

            {/* Players Dropdown */}
            <details className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="bg-teal-50 px-4 py-2 cursor-pointer font-medium text-teal-700 hover:bg-teal-100 transition-all">
                👤 Selected Players (
                {viewModalAuction.selectedPlayers?.length || 0})
              </summary>
              <div className="px-4 py-2">
                {viewModalAuction.selectedPlayers?.length > 0 ? (
                  <ul className="list-disc pl-6 text-gray-700 max-h-40 overflow-y-auto">
                    {viewModalAuction.selectedPlayers.map((p, i) => (
                      <li key={i}>{p.name || "Unnamed Player"}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No players selected.</p>
                )}
              </div>
            </details>

            {/* Teams Dropdown */}
            <details className="mb-2 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="bg-indigo-50 px-4 py-2 cursor-pointer font-medium text-indigo-700 hover:bg-indigo-100 transition-all">
                🏏 Selected Teams ({viewModalAuction.selectedTeams?.length || 0}
                )
              </summary>
              <div className="px-4 py-2">
                {viewModalAuction.selectedTeams?.length > 0 ? (
                  <ul className="list-disc pl-6 text-gray-700 max-h-40 overflow-y-auto">
                    {viewModalAuction.selectedTeams.map((t, i) => (
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
              disabled={isJoining}
            />
            {joinError && <p className="text-red-500 mb-2">{joinError}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                disabled={isJoining}
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
