import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import api from "../../userManagement/api";

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
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      for (const key in data) {
        if (key === "photoFile") {
          formData.append("photoFile", data.photoFile);
        } else if (typeof data[key] === "boolean") {
          formData.append(key, data[key].toString());
        } else if (data[key] != null) {
          formData.append(key, data[key]);
        }
      }

      const res = await api.post("/add-player", formData);
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
                    <option value="Sold">Sold</option>
                    <option value="Retained">Retained</option>
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
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Performance Stats (optional)
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  {...register("matchesPlayed", { valueAsNumber: true })}
                  type="number"
                  placeholder="Matches Played"
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  {...register("runs", { valueAsNumber: true })}
                  type="number"
                  placeholder="Runs"
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  {...register("wickets", { valueAsNumber: true })}
                  type="number"
                  placeholder="Wickets"
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  {...register("strikeRate", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="Strike Rate"
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  {...register("previousTeams")}
                  placeholder="Previous Teams"
                  className="w-full border px-3 py-2 rounded"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    {...register("isCapped")}
                    className="h-4 w-4"
                  />
                  <label className="font-medium">
                    International Experience
                  </label>
                </div>
                <textarea
                  {...register("bio")}
                  rows={3}
                  placeholder="Player Bio"
                  className="w-full border px-3 py-2 rounded sm:col-span-2"
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
