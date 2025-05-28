// src/pages/EditTeam.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../userManagement/Api";
import toast from "react-hot-toast";

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

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/get-team/${id}`);
        const t = res.data;
        reset({
          teamName: t.teamName,
          shortName: t.shortName,
          purse: t.purse,
        });
        setPreview(t.logoUrl);
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
      if (data.logoFile instanceof File) {
        formData.append("logoFile", data.logoFile);
      }

      await api.put(`/update-team/${id}`, formData, {
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
                {...register("shortName", { required: "Short name is required" })}
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
              <label className="block font-medium mb-1">Team Logo / Photo</label>
              <Controller
                name="logoFile"
                control={control}
                render={({ field: { onChange } }) => (
                  <div className="space-y-2">
                    <div
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() => document.getElementById("logoInput").click()}
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

            {/* Save */}
            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded text-white ${
                  submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
