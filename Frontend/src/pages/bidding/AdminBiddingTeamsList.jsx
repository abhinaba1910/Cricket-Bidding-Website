import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiEye, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Api from "../../userManagement/Api";
import { formatIndianNumber } from "../../types/formatIndianNumber";

export default function AdminBiddingTeamsList() {
  const { id } = useParams(); // This is the auction ID
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [auctionDetails, setAuctionDetails] = useState(null);

  // Fetch auction details and selected teams
  // useEffect(() => {
  //   Api
  //     .get(`/get-auction/${id}`)
  //     .then((res) => {
  //       setAuctionDetails(res.data);
  //       setTeams(res.data.selectedTeams || []);
  //       console.log(res.data.selectedTeams);
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching auction details:", err);
  //       alert("Failed to fetch auction details.");
  //     })
  //     .finally(() => setLoading(false));
  // }, [id]);

  const user = JSON.parse(localStorage.getItem("user")); // or your user context/session
  const isAdmin = user?.role === "admin" || user?.role === "temp-admin";
  
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);

      try {
        const user = JSON.parse(localStorage.getItem("user")); // or however you're storing logged in user
        const isAdmin = user?.role === "admin" || user?.role === "temp-admin";

        const res = await Api.get(
          isAdmin ? `/get-auction/${id}` : `/get-auction-teams/${id}`
        );

        if (isAdmin) {
          setAuctionDetails(res.data);
          setTeams(res.data.selectedTeams || []);
        } else {
          setAuctionDetails({ auctionName: "Selected Auction" }); // fallback
          setTeams(res.data.selectedTeams || []);
          console.log(res.data.selectedTeams);
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
        alert("Failed to fetch auction teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [id]);

  // Filter by ID or teamName or shortName
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return teams.filter(
      (t) =>
        (t._id && t._id.toLowerCase().includes(term)) ||
        (t.teamName && t.teamName.toLowerCase().includes(term)) ||
        (t.shortName && t.shortName.toLowerCase().includes(term))
    );
  }, [teams, search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Back + Title */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(isAdmin?(`/admin/admin-bidding-dashboard/${id}`):(`/user-bidding-portal/${id}`))}
          className="flex items-center px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          <FiArrowLeft className="mr-2 text-gray-700" />
          Back
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Selected Teams</h1>
          {auctionDetails && (
            <p className="text-sm text-gray-600 mt-1">
              {auctionDetails.auctionName}
            </p>
          )}
        </div>
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading selected teams...</p>
      ) : (
        <>
          {/* Teams count info */}
          {teams.length > 0 && (
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Showing {filtered.length} of {teams.length} selected teams
              </p>
            </div>
          )}

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.length > 0 ? (
              filtered.map((team) => (
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
                      <strong>Total Purse:</strong> ₹
                      {formatIndianNumber(team.purse) || "0"}
                    </p>
                    <p>
                      <strong>Remaining:</strong> ₹
                      {formatIndianNumber(team.remaining) || "0"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/admin/bidding-teams-view/${id}/${team._id}`)
                    }
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                  >
                    <FiEye className="mr-1" /> View
                  </button>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                {teams.length === 0
                  ? "No teams selected for this auction."
                  : "No teams match your search."}
              </p>
            )}
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-4">
            {filtered.length > 0 ? (
              filtered.map((team) => (
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
                    <h3 className="font-medium text-gray-900">
                      {team.teamName}
                    </h3>
                    <p className="text-sm text-gray-600">({team.shortName})</p>
                    <div className="text-sm text-gray-700 mt-1">
                      <span>
                        <strong>Total:</strong> ₹
                        {formatIndianNumber(team.purse) || "0"}
                      </span>
                      <span className="ml-4">
                        <strong>Remaining:</strong> ₹
                        {formatIndianNumber(team.remaining) || "0"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/admin/bidding-teams-view/${id}/${team._id}`)
                    }
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                  >
                    <FiEye />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                {teams.length === 0
                  ? "No teams selected for this auction."
                  : "No teams match your search."}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
