import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import Api from "../../userManagement/Api";

export default function AddPlayer() {
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
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
  
      // Append primitive fields
      for (const key in data) {
        if (
          key !== "photoFile" &&
          key !== "performanceStats" &&
          data[key] != null
        ) {
          formData.append(key, typeof data[key] === "boolean" ? data[key].toString() : data[key]);
        }
      }
  
      // Append photo file
      if (data.photoFile) {
        formData.append("photoFile", data.photoFile);
      }
  
      // Manually append performanceStats fields
      const ps = data.performanceStats || {};
      const appendNested = (obj, prefix) => {
        if (!obj) return;
        for (const key in obj) {
          formData.append(`performanceStats.${prefix}.${key}`, obj[key]);
        }
      };
  
      appendNested(ps.batting, "batting");
      appendNested(ps.bowling, "bowling");
      appendNested(ps.allRounder, "allRounder");
  
      const res = await Api.post("/add-player", formData);
      toast.success("Player added successfully!");
      reset();
      setPreview(null);
      navigate("/dashboard");
    } catch (err) {
      const backendError = err.response?.data?.error || "Failed to add player.";
      console.error("Failed to add player:", backendError);
      toast.error(backendError);
    } finally {
      setSubmitting(false);
    }
  };
  

  const handleFileChange = (e, onChange) => {
    const file = e.target.files?.[0];
    onChange(file);
    if (!file) return setPreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-md:px-0 md:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg">
        {/* Header */}
        <div className="flex items-center border-b px-6 py-4">
          <a
            href="/dashboard"
            className="p-2 rounded hover:bg-gray-100 transition"
            aria-label="Back to Dashboard"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </a>
          <h1 className="ml-4 text-2xl font-bold text-gray-800">
            Add Player for Bidding
          </h1>
        </div>

        {/* Form */}
        <div className="p-6 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
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

                {/* Photo Upload */}
                <div className="sm:col-span-2">
                  <label className="block font-medium mb-1">
                    Photo / Profile Image
                  </label>
                  <Controller
                    name="photoFile"
                    control={control}
                    rules={{ required: "Profile image is required" }}
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
                  {errors.photoFile && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.photoFile.message}
                    </p>
                  )}
                </div>

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
              <h2 className="text-xl font-semibold mb-4">Player Type & Role</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Primary Role</label>
                  <select
                    {...register("role", { required: "Role is required" })}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      // setValue("role", e.target.value);
                    }}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select role...</option>
                    {[
                      "Batsman",
                      "Fast all-rounder",
                      "Spin all-rounder",
                      "Wicket keeper batsman",
                      "Spin bowler",
                      "Fast bowler",
                    ].map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
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
                    {...register("battingStyle")}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select batting style...</option>
                    {["Right Handed Batsman", "Left Handed Batsman"].map(
                      (style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Bowling Style
                  </label>
                  <select
                    {...register("bowlingStyle")}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select bowling style...</option>
                    {[
                      "Not Applicable",
                      "Right Arm Fast",
                      "Left Arm Fast",
                      "Right Arm Medium",
                      "Left Arm Medium",
                      "Right Arm Off Break",
                      "Left Arm Orthodox",
                      "Right Arm Leg Break",
                      "Chinaman",
                      "Left Arm Fast Medium",
                      "Right Arm Fast Medium",
                    ].map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Auction/Bidding Details */}
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
                <div>
                  <label className="block font-medium mb-1">
                    Points / Rating
                  </label>
                  <input
                    {...register("points", { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g., 95"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Availability Status
                  </label>
                  <select
                    {...register("availability")}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="Available">Available</option>
                    {/* <option value="Sold">Sold</option>
                    <option value="Retained">Retained</option> */}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Player ID (optional)
                  </label>
                  <input
                    {...register("playerId")}
                    placeholder="Unique ID"
                    className="w-full border px-3 py-2 rounded"
                  />
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

            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Add Player"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

