import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  const handleOpenSidebar = () => setSidebarOpen(true)
  const handleCloseSidebar = () => setSidebarOpen(false)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar onOpenSidebar={handleOpenSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
