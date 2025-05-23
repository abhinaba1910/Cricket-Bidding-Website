import React, { useState } from 'react'
import { Mail, Lock, User } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AvatarUpload from './AvatarUpload'
import api from '../../userManagement/Api'
import { useNavigate } from 'react-router-dom'

function RegisterForm({ onSuccess, onToggleForm }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setFormError('')

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    const formData = new FormData()
    formData.append('username', username)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('role', 'user')

    if (avatar instanceof File) {
      formData.append('profilePic', avatar)
    }

    setIsLoading(true)
    try {
      const response = await api.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.status === 201) {
        onSuccess?.()
        navigate('/login')
      } else {
        setFormError('Registration failed. Please try again.')
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
        <p className="text-gray-600 mt-1">Join the auction platform</p>
      </div>

      {formError && (
        <div className="text-error-600 text-sm p-2 bg-error-50 rounded-md">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AvatarUpload value={avatar} onChange={setAvatar} />

        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="h-5 w-5" />}
          placeholder="Choose a username"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-5 w-5" />}
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-5 w-5" />}
          placeholder="Create a password"
          required
          helperText="Must be at least 8 characters"
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="h-5 w-5" />}
          placeholder="Confirm your password"
          required
          error={passwordError}
        />

        <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
