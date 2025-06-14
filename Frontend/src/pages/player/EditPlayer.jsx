// src/pages/EditPlayer.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../userManagement/Api";
import toast from "react-hot-toast";

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

  // 1️⃣ Load existing player
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/get-player/${id}`); // 🔗 TODO: adjust endpoint
        const p = res.data;
        // fill form
        reset({
          name: p.name,
          country: p.country,
          dob: p.dob?.split("T")[0], // format for <input type=date>
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
        });
        setPreview(p.playerPic); // show existing photo
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
      Object.entries(data).forEach(([key, val]) => {
        if (key === "photoFile" && val instanceof File) {
          formData.append("photoFile", val);
        } else if (typeof val === "boolean") {
          formData.append(key, val.toString());
        } else if (val != null) {
          formData.append(key, val);
        }
      });

      await api.put(`/update-player/${id}`, formData); // 🔗 TODO: adjust endpoint
      toast.success("Player updated successfully!");
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      console.error("Failed to update player", err);
      toast.error(err.response?.data?.error || "Update failed");
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
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select role...</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Fast all-rounder">Fast-All-Rounder</option>
                    <option value="Spin all-rounder">Spin-All-Rounder</option>
                    <option value="Wicket keeper batsman">Wicket-Keeper-Batsman</option>
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
            <section>
              <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
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
                <textarea
                  {...register("bio")}
                  rows={3}
                  placeholder="Player Bio"
                  className="w-full border px-3 py-2 rounded sm:col-span-2"
                />
              </div>
            </section>

            {/* Submit */}
            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Player"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
