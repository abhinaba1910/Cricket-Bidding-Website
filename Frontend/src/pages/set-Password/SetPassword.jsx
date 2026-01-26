import React, { useState } from "react";
import Api from "../../userManagement/Api";

function SetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await Api.post(
        "/set-password",
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess("Password updated! Redirecting to login...");
        setTimeout(() => {
          localStorage.removeItem("token"); // force re-login
          window.location.href = "/";
        }, 1500);
      } else {
        setError("Something went wrong.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded shadow">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Set Your Password
        </h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 p-2 block w-full border rounded-md shadow-sm focus:ring focus:ring-indigo-300"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? "Setting Password..." : "Set Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetPassword;
