// src/pages/EditPlayer.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Api from "../../userManagement/Api";

export default function EditPlayer() {
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
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // 1️⃣ Load existing player
  useEffect(() => {
    async function load() {
      try {
        const res = await Api.get(`/get-player/${id}`); // 🔗 TODO: adjust endpoint
        const p = res.data;
        console.log(p)


        reset({
          name: p.name,
          country: p.country,
          dob: p.dob?.split("T")[0],
          role: p.role,
          battingStyle: p.battingStyle,
          bowlingStyle: p.bowlingStyle,
          basePrice: p.basePrice,
          grade: p.grade,
          points: p.points,
          availability: p.availability,
          playerId: p.playerId,
          matchesPlayed: p.matchesPlayed,
          runs: p.runs,
          wickets: p.wickets,
          strikeRate: p.strikeRate,
          previousTeams: p.previousTeams,
          isCapped: p.isCapped,
          bio: p.bio,
        
          // ✅ Add these to initialize form fields correctly
          performanceStats: {
            batting: {
              matches: p.performanceStats?.batting?.matches ?? "",
              runs: p.performanceStats?.batting?.runs ?? "",
              highScore: p.performanceStats?.batting?.highScore ?? "",
              average: p.performanceStats?.batting?.average ?? "",
              strikeRate: p.performanceStats?.batting?.strikeRate ?? "",
              centuries: p.performanceStats?.batting?.centuries ?? "",
              fifties: p.performanceStats?.batting?.fifties ?? "",
            },
            bowling: {
              matches: p.performanceStats?.bowling?.matches ?? "",
              wickets: p.performanceStats?.bowling?.wickets ?? "",
              bestBowling: p.performanceStats?.bowling?.bestBowling ?? "",
              average: p.performanceStats?.bowling?.average ?? "",
              economy: p.performanceStats?.bowling?.economy ?? "",
              fiveWicketHauls: p.performanceStats?.bowling?.fiveWicketHauls ?? "",
            },
            allRounder: {
              matches: p.performanceStats?.allRounder?.matches ?? "",
              runs: p.performanceStats?.allRounder?.runs ?? "",
              highScore: p.performanceStats?.allRounder?.highScore ?? "",
              battingAverage: p.performanceStats?.allRounder?.battingAverage ?? "",
              battingStrikeRate:
                p.performanceStats?.allRounder?.battingStrikeRate ?? "",
              centuries: p.performanceStats?.allRounder?.centuries ?? "",
              fifties: p.performanceStats?.allRounder?.fifties ?? "",
              wickets: p.performanceStats?.allRounder?.wickets ?? "",
              bestBowling: p.performanceStats?.allRounder?.bestBowling ?? "",
              bowlingAverage: p.performanceStats?.allRounder?.bowlingAverage ?? "",
              economy: p.performanceStats?.allRounder?.economy ?? "",
              fiveWicketHauls:
                p.performanceStats?.allRounder?.fiveWicketHauls ?? "",
            },
          },
        });
        
        setPreview(p.playerPic); 
        setSelectedRole(p.role);
      } catch (err) {
        console.error("Failed to load player", err);
        toast.error("Could not load player data");
      }
    }
    load();
  }, [id, reset]);

  // 2️⃣ On submit, PUT updated data
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
  
      const flatten = (obj, prefix = "") => {
        for (const [key, val] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (
            typeof val === "object" &&
            val !== null &&
            !(val instanceof File)
          ) {
            flatten(val, path);
          } else {
            formData.append(path, val);
          }
        }
      };
  
      flatten(data);
  
      await Api.put(`/update-player/${id}`, formData);
      toast.success("Player updated successfully!");
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      console.error("Failed to update player", err);
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };
  

  // 🔥 Delete handler
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this player?"
      )
    ) {
      return;
    }
    try {
      setSubmitting(true);
      await Api.delete(`/delete-player/${id}`); // adjust your endpoint if needed
      toast.success("Player deleted permanently.");
      navigate(-1);
    } catch (err) {
      console.error("Failed to delete player", err);
      toast.error(err.response?.data?.error || "Deletion failed");
    } finally {
      setSubmitting(false);
    }
  };

  // 3️⃣ handle image preview
  const handleFileChange = (e, onChange) => {
    const file = e.target.files?.[0];
    onChange(file);
    if (!file) return setPreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg">
        {/* Header */}
        <div className="flex items-center border-b px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded hover:bg-gray-100 transition"
            aria-label="Back"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="ml-4 text-2xl font-bold text-gray-800">Edit Player</h1>
        </div>

        {/* Form */}
        <div className="p-6 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block font-medium mb-1">Full Name</label>
                  <input
                    {...register("name", { required: "Full name is required" })}
                    placeholder="e.g., Virat Kohli"
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Photo */}
                <div className="sm:col-span-2">
                  <label className="block font-medium mb-1">
                    Photo / Profile Image
                  </label>
                  <Controller
                    name="photoFile"
                    control={control}
                    render={({ field: { onChange } }) => (
                      <div className="space-y-2">
                        <div
                          className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden"
                          onClick={() =>
                            document.getElementById("photoInput").click()
                          }
                        >
                          {preview ? (
                            <img
                              src={preview}
                              alt="Preview"
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-gray-400">
                              Click to upload
                            </span>
                          )}
                        </div>
                        <input
                          id="photoInput"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, onChange)}
                        />
                      </div>
                    )}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block font-medium mb-1">Country</label>
                  <input
                    {...register("country", {
                      required: "Country is required",
                    })}
                    placeholder="e.g., India"
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.country && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    {...register("dob", {
                      required: "Date of birth is required",
                    })}
                    type="date"
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.dob && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.dob.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Role Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Player Role</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Primary Role</label>
                  <select
                    {...register("role", { required: "Role is required" })}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select role...</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Fast all-rounder">Fast-All-Rounder</option>
                    <option value="Spin all-rounder">Spin-All-Rounder</option>
                    <option value="Wicket keeper batsman">
                      Wicket-Keeper-Batsman
                    </option>
                    <option value="Spin bowler">Spin Bowler</option>
                    <option value="Fast bowler">Fast Bowler</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Batting Style
                  </label>
                  <select
                    {...register("battingStyle", {
                      required: "Batting style is required",
                    })}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select batting style...</option>
                    <option value="Right Handed Batsman">
                      Right Handed Batsman
                    </option>
                    <option value="Left Handed Batsman">
                      Left Handed Batsman
                    </option>
                  </select>
                  {errors.battingStyle && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.battingStyle.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Bowling Style
                  </label>
                  <select
                    {...register("bowlingStyle", {
                      required: "Bowling style is required",
                    })}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select bowling style...</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Right Arm Fast">Right Arm Fast</option>
                    <option value="Left Arm Fast">Left Arm Fast</option>
                    <option value="Right Arm Medium">Right Arm Medium</option>
                    <option value="Left Arm Medium">Left Arm Medium</option>
                    <option value="Right Arm Offbreak">
                      Right Arm Offbreak
                    </option>
                    <option value="Left Arm Orthodox">Left Arm Orthodox</option>
                    <option value="Right Arm Legbreak">
                      Right Arm Legbreak
                    </option>
                    <option value="Left Arm Chinaman">Left Arm Chinaman</option>
                    <option value="Right Arm Fast Medium">
                      Right Arm Fast Medium
                    </option>
                    <option value="Left Arm Fast Medium">
                      Left Arm Fast Medium
                    </option>
                  </select>
                  {errors.bowlingStyle && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.bowlingStyle.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Auction Details */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Auction / Bidding Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Base Price</label>
                  <input
                    {...register("basePrice", {
                      valueAsNumber: true,
                      required: "Base price is required",
                    })}
                    type="number"
                    placeholder="e.g., 2000000"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Grade</label>
                  <select
                    {...register("grade")}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select grade...</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Performance */}
            <section className="bg-white p-6 rounded-xl shadow-md border mt-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
                🎯 Performance Stats{" "}
                <span className="text-sm text-gray-500">(optional)</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Batting Stats */}
                {["Batsman", "Wicket keeper batsman"].includes(
                  selectedRole
                ) && (
                  <div className="sm:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-teal-700">
                      Batting Stats
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <input
                        {...register("performanceStats.batting.matches", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Matches"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.batting.runs", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Runs"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.batting.highScore", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="High Score"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.batting.average", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Average"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.batting.strikeRate", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Strike Rate"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.batting.centuries", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="100s"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.batting.fifties", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="50s"
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                {/* Bowling Stats */}
                {["Fast bowler", "Spin bowler"].includes(selectedRole) && (
                  <div className="sm:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-indigo-700">
                      Bowling Stats
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <input
                        {...register("performanceStats.bowling.matches", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Matches"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.bowling.wickets", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Wickets"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.bowling.bestBowling")}
                        type="text"
                        placeholder="BBM (e.g. 5/24)"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.bowling.average", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Average"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.bowling.economy", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Economy"
                        className="input-field"
                      />
                      <input
                        {...register(
                          "performanceStats.bowling.fiveWicketHauls",
                          { valueAsNumber: true }
                        )}
                        type="number"
                        placeholder="5W Hauls"
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                {/* All-Rounder Stats */}
                {["Fast all-rounder", "Spin all-rounder"].includes(
                  selectedRole
                ) && (
                  <div className="sm:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-purple-700">
                      All-Rounder Stats
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <input
                        {...register("performanceStats.allRounder.matches", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Matches"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.allRounder.runs", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Runs"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.allRounder.highScore", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="High Score"
                        className="input-field"
                      />
                      <input
                        {...register(
                          "performanceStats.allRounder.battingAverage",
                          { valueAsNumber: true }
                        )}
                        type="number"
                        placeholder="Batting Avg"
                        className="input-field"
                      />
                      <input
                        {...register(
                          "performanceStats.allRounder.battingStrikeRate",
                          { valueAsNumber: true }
                        )}
                        type="number"
                        placeholder="Batting S/R"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.allRounder.centuries", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="100s"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.allRounder.fifties", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="50s"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.allRounder.wickets", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Wickets"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.allRounder.bestBowling")}
                        type="text"
                        placeholder="BBM"
                        className="input-field"
                      />
                      <input
                        {...register(
                          "performanceStats.allRounder.bowlingAverage",
                          { valueAsNumber: true }
                        )}
                        type="number"
                        placeholder="Bowling Avg"
                        className="input-field"
                      />
                      <input
                        {...register("performanceStats.allRounder.economy", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Econ"
                        className="input-field"
                      />
                      <input
                        {...register(
                          "performanceStats.allRounder.fiveWicketHauls",
                          { valueAsNumber: true }
                        )}
                        type="number"
                        placeholder="5W Hauls"
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                {/* Common Section */}
                <div className="flex items-center space-x-2 mt-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    {...register("isCapped")}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    International Experience
                  </label>
                </div>

                <textarea
                  {...register("bio")}
                  rows={3}
                  placeholder="Player Bio"
                  className="w-full border px-3 py-2 rounded sm:col-span-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </section>

            {/* Submit */}
            <div className="text-right space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Player"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete Player
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
