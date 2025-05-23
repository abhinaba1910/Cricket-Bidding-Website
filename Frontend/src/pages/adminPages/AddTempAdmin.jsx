import React, { useState } from "react";
import api from "../../userManagement/Api";

const AddTempAdmin = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const isAdmin=localStorage.getItem("role");

  if(isAdmin!=="admin"){
    window.location.href="/dashboard";
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post("/add-temp-admin", form);
      setMessage(res.data.message || "Temp admin added successfully.");
      setForm({ name: "", email: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-xl rounded-xl p-8 mt-10 border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
        Add Temp Admin
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-600">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-600">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
            placeholder="Enter email address"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>
      </form>

      {message && (
        <div className="mt-4 text-green-600 font-medium text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-600 font-medium text-center">{error}</div>
      )}
    </div>
  );
};

export default  AddTempAdmin;
