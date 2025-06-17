
import React, { useState } from 'react'
import { Lock, User } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { toast } from "react-hot-toast";
import Api from '../../userManagement/Api';

function LoginForm({ onSuccess, onToggleForm }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const response = await Api.post("/login", { username, password });
  
      const { token, user } = response.data;
      const { role, email, firstTime } = user;
  
      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify({ username, email, role }));
  
      toast.success("Login successful!");
  
      // If temp-admin and first login, redirect to set-password
      if (role === "temp-admin" && firstTime) {
        window.location.href = "/set-password";
      } else {
        window.location.href = "/dashboard";
      }
  
      onSuccess?.(user);
    } catch (err) {
      const serverMessage = err.response?.data?.error || "Login failed";
      setError(serverMessage);
      toast.error(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="h-5 w-5" />}
          placeholder="Enter your username"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-5 w-5" />}
          placeholder="Enter your password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-900">Remember me</span>
          </label>

          <a
            href="#forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
