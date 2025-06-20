import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import MobileStickyNav from "../../components/layout/MobileStickyNav";
import Api from "../../userManagement/Api";

export default function ViewTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    async function loadTeam() {
      try {
        const res = await Api.get(`/get-team/${id}`);
        console.log(res.data);
        setTeam(res.data);
      } catch (err) {
        console.error("Failed to load team:", err);
        const errorMsg =
          err.response?.data?.error || "Could not load team data";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadTeam(); // Initial fetch

    interval = setInterval(() => {
      loadTeam();
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Loading team…</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-4"
        >
          <FiChevronLeft className="mr-1" /> Back
        </button>
        <p className="text-center text-gray-600">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-6"
      >
        <FiChevronLeft className="mr-1" /> Back
      </button>

      <div className="bg-white shadow rounded-lg overflow-hidden md:flex">
        {/* Logo */}
        <div
          className="md:w-1/3 bg-cover bg-center"
          style={{
            backgroundImage: `url(${team.logoUrl || "/default-logo.png"})`,
            minHeight: "200px",
          }}
        />

        {/* Details */}
        <div className="p-6 md:w-2/3 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{team.teamName}</h2>
          {/* <p className="text-sm text-gray-600">ID: {team._id}</p> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700">
                Short Name
              </h4>
              <p className="mt-1 text-gray-800">{team.shortName}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">
                Purse Amount
              </h4>
              <p className="mt-1 text-gray-800">
                ₹{Number(team.purse).toLocaleString()}
              </p>
            </div>
          </div>

          {team.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700">
                Description
              </h4>
              <p className="mt-1 text-gray-800 whitespace-pre-line">
                {team.description}
              </p>
            </div>
          )}

          {team.founded && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Founded</h4>
              <p className="mt-1 text-gray-800">{team.founded}</p>
            </div>
          )}
          {team.players && team.players.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Bought Players
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border-b">#</th>
                      <th className="px-4 py-2 border-b">Player Name</th>
                      <th className="px-4 py-2 border-b">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.players
                      .filter((entry) => entry.player !== null)
                      .map((entry, index) => (
                        <tr key={entry.player._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">{index + 1}</td>
                          <td className="px-4 py-2 border-b">
                            {entry.player.name}
                          </td>
                          <td className="px-4 py-2 border-b">
                            ₹{Number(entry.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(`/admin/teams/${team._id}/edit`)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Edit Team
          </button>
        </div>
      </div>
      <MobileStickyNav />
    </div>
  );
}
