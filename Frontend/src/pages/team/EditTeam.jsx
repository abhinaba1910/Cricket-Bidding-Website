// src/pages/EditTeam.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Api from "../../userManagement/Api";

export default function EditTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [retainedPlayers, setRetainedPlayers] = useState([]);
  const [releasedPlayers, setReleasedPlayers] = useState([]);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedReleasePlayer, setSelectedReleasePlayer] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await Api.get(`/get-team/${id}`);
        const t = res.data;
        console.log(t)
        reset({ teamName: t.teamName, shortName: t.shortName, purse: t.purse });
        setPreview(t.logoUrl);
        setTeamPlayers(t.players || []); // Assuming populated players
      } catch (err) {
        console.error(err);
        toast.error("Failed to load team");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, reset]);

  const handleFileChange = (e, onChange) => {
    const file = e.target.files?.[0];
    onChange(file);
    if (!file) return setPreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("teamName", data.teamName);
      formData.append("shortName", data.shortName);
      formData.append("purse", data.purse);
      formData.append("retainedPlayers", JSON.stringify(retainedPlayers));
      formData.append("releasedPlayers", JSON.stringify(releasedPlayers));

      if (data.logoFile instanceof File) {
        formData.append("logoFile", data.logoFile);
      }

      await Api.put(`/update-team/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Team updated successfully!");
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

// 🔥 Delete handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this team? This cannot be undone.")) {
      return;
    }
    try {
      setSubmitting(true);
      await Api.delete(`/delete-team/${id}`); // adjust your endpoint if needed
      toast.success("Team deleted permanently.");
      navigate(-1);
    } catch (err) {
      console.error("Failed to delete team", err);
      toast.error(err.response?.data?.error || "Deletion failed");
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="flex items-center border-b px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="ml-4 text-2xl font-bold text-gray-800">Edit Team</h1>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Team Name */}
            <div>
              <label className="block font-medium mb-1">Team Name</label>
              <input
                {...register("teamName", { required: "Team name is required" })}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.teamName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.teamName.message}
                </p>
              )}
            </div>

            {/* Short Name */}
            <div>
              <label className="block font-medium mb-1">
                Short Name / Code
              </label>
              <input
                {...register("shortName", {
                  required: "Short name is required",
                })}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.shortName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.shortName.message}
                </p>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block font-medium mb-1">
                Team Logo / Photo
              </label>
              <Controller
                name="logoFile"
                control={control}
                render={({ field: { onChange } }) => (
                  <div className="space-y-2">
                    <div
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() =>
                        document.getElementById("logoInput").click()
                      }
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Logo"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-gray-400">Click to upload</span>
                      )}
                    </div>
                    <input
                      id="logoInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, onChange)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Purse */}
            <div>
              <label className="block font-medium mb-1">Purse Amount</label>
              <input
                {...register("purse", {
                  required: "Purse amount is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Must be non-negative" },
                })}
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
              {errors.purse && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.purse.message}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Players</h2>
              {teamPlayers.map(({ player, price }) => (
                <div
                  key={player._id}
                  className="border p-3 rounded mb-2 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-gray-500">
                      Current: ₹{price}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Retain */}
                    {player.availability!=="Retained" &&<label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRetainedPlayers((prev) => [
                              ...prev,
                              { playerId: player._id, price },
                            ]);
                            setReleasedPlayers((prev) =>
                              prev.filter((id) => id !== player._id)
                            );
                          } else {
                            setRetainedPlayers((prev) =>
                              prev.filter((p) => p.playerId !== player._id)
                            );
                          }
                        }}
                        checked={retainedPlayers.some(
                          (p) => p.playerId === player._id
                        )}
                      />
                      Retain
                    </label>}

                    {/* Retain Price */}
                    <input
                      type="number"
                      className="w-24 border px-2 py-1 rounded"
                      value={
                        retainedPlayers.find((p) => p.playerId === player._id)
                          ?.price || ""
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setRetainedPlayers((prev) =>
                          prev.map((p) =>
                            p.playerId === player._id ? { ...p, price: val } : p
                          )
                        );
                      }}
                      disabled={
                        !retainedPlayers.some((p) => p.playerId === player._id)
                      }
                    />

                    {/* Release */}
                    {releasedPlayers.includes(player._id) ? (
                      <span className="text-gray-500 italic">Released</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReleasePlayer({
                            id: player._id,
                            name: player.name,
                          });
                          setShowReleaseModal(true);
                        }}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Release
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Save */}
            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded text-white ${
                  submitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete Team
              </button>
            </div>
          </form>
        </div>
      </div>
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Release</h2>
            <p className="mb-4">
              Are you sure you want to release{" "}
              <strong>{selectedReleasePlayer?.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReleaseModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReleasedPlayers((prev) => [
                    ...prev,
                    selectedReleasePlayer.id,
                  ]);
                  setRetainedPlayers((prev) =>
                    prev.filter((p) => p.playerId !== selectedReleasePlayer.id)
                  );
                  setShowReleaseModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
