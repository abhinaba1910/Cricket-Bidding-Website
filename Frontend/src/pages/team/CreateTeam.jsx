import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import Api from "../../userManagement/Api";

export default function CreateTeam() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("teamName", data.teamName);
      formData.append("shortName", data.shortName);
      formData.append("purse", data.purse);
      formData.append("logoFile", data.logoFile);

      const response = await Api.post("/create-team", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Team created:", response.data);
      toast.success("Team created successfully!");

      // Reset form and preview image
      reset();
      setPreview(null);
    } catch (err) {
      console.error("Error creating team:", err.response?.data || err.message);
      const message =
        err.response?.data?.error || "Failed to create team. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8 max-md:px-0">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg">
        {/* Header */}
        <div className="flex items-center border-b px-6 py-4">
          <a
            href="/dashboard"
            className="p-2 rounded hover:bg-gray-100 transition"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </a>
          <h1 className="ml-4 text-2xl font-bold text-gray-800">
            Create New Team
          </h1>
        </div>

        {/* Form */}
        <div className="p-6 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Team Name */}
            <div>
              <label className="block font-medium mb-1">Team Name</label>
              <input
                {...register("teamName", { required: "Team name is required" })}
                placeholder="e.g., Royal Challengers"
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
                placeholder="e.g., RCB"
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
                rules={{ required: "Team logo is required" }}
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
                          alt="Logo preview"
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
              {errors.logoFile && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.logoFile.message}
                </p>
              )}
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
                placeholder="e.g., 9000000"
                className="w-full border px-3 py-2 rounded"
              />
              {errors.purse && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.purse.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded text-white ${
                  loading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {loading ? "Creating..." : "Create Team"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
