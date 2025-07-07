import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Api from "../../userManagement/Api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await Api.post("/reset-password", { token, newPassword });
      toast.success("Password reset successful. Please log in.");
      setTimeout(()=>{
        navigate("/");
      },4000)
      
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        className="w-full p-2 border rounded"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
        Reset Password
      </button>
    </form>
  );
}

export default ResetPassword;
