import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { Award } from 'lucide-react'
function AuthPage() {
  const [showLogin, setShowLogin] = useState(true)

  const toggleForm = () => {
    setShowLogin(!showLogin)
  }
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Award className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            BidMaster
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            The ultimate auction platform for cricket leagues
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {showLogin ? (
            <LoginForm  onToggleForm={toggleForm} />
          ) : (
            <RegisterForm  onToggleForm={toggleForm} />
          )}
        </div>
      </div>

      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 BidMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AuthPage
