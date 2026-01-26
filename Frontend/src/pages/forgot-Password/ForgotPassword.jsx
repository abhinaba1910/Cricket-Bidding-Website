import React, { useState } from "react";
import { X } from "lucide-react";
import Api from "../../userManagement/Api";
import { toast } from "react-hot-toast";

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await Api.post("/forgot-password", { email });
      toast.success("Reset link sent to your email.");
      setTimeout(() => {
        onClose(); // close modal
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-center text-gray-800 mb-4">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter your email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
