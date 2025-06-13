// import React, { useState } from 'react';
// import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import Avatar from '../ui/Avatar';
// import Button from '../ui/Button';

// const Navbar = ({ onOpenSidebar }) => {
//   const { user, logout, isAuthenticated } = useAuth();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
  
//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };
  
//   const handleLogout = () => {
//     logout();
//     setIsMenuOpen(false);
//   };

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex">
//             {/* Mobile menu button */}
//             <div className="flex items-center md:hidden">
//               <button
//                 type="button"
//                 className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
//                 onClick={onOpenSidebar}
//               >
//                 <span className="sr-only">Open sidebar</span>
//                 <Menu className="h-6 w-6" aria-hidden="true" />
//               </button>
//             </div>
            
//             {/* Logo */}
//             <div className="flex-shrink-0 flex items-center">
//               <span className="text-xl font-bold text-primary-600">BidMaster</span>
//             </div>
//           </div>
          
//           {/* User menu */}
//           {isAuthenticated ? (
//             <div className="flex items-center">
//               <div className="hidden md:ml-4 md:flex md:items-center">
//                 <div className="relative ml-3">
//                   <button
//                     type="button"
//                     className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//                     onClick={toggleMenu}
//                   >
//                     <span className="sr-only">Open user menu</span>
//                     <Avatar 
//                       src={user?.avatar} 
//                       alt={user?.username || ''} 
//                       size="sm" 
//                       className="mr-2" 
//                     />
//                     <span className="mr-1">{user?.username}</span>
//                     <ChevronDown className="h-4 w-4 text-gray-500" />
//                   </button>
                  
//                   {isMenuOpen && (
//                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
//                       <div className="py-1">
//                         <a 
//                           href="#profile" 
//                           className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                           onClick={() => setIsMenuOpen(false)}
//                         >
//                           <User className="mr-2 h-4 w-4" />
//                           Your Profile
//                         </a>
//                         <button
//                           onClick={handleLogout}
//                           className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <LogOut className="mr-2 h-4 w-4" />
//                           Sign out
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Mobile User Menu */}
//               <div className="md:hidden flex items-center">
//                 <button
//                   type="button"
//                   className="flex rounded-full items-center"
//                   onClick={toggleMenu}
//                 >
//                   <Avatar src={user?.avatar} alt={user?.username || ''} size="sm" />
//                 </button>
                
//                 {isMenuOpen && (
//                   <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-40">
//                     <div className="rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
//                       <div className="pt-4 pb-3 border-t border-gray-200">
//                         <div className="flex items-center px-4">
//                           <div className="flex-shrink-0">
//                             <Avatar src={user?.avatar} alt={user?.username || ''} size="md" />
//                           </div>
//                           <div className="ml-3">
//                             <div className="text-base font-medium text-gray-800">{user?.username}</div>
//                             <div className="text-sm font-medium text-gray-500">{user?.email}</div>
//                           </div>
//                           <button
//                             type="button"
//                             className="ml-auto flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500"
//                             onClick={toggleMenu}
//                           >
//                             <span className="sr-only">Close menu</span>
//                             <X className="h-6 w-6" aria-hidden="true" />
//                           </button>
//                         </div>
//                         <div className="mt-3 space-y-1">
//                           <a
//                             href="#profile"
//                             className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                             onClick={() => setIsMenuOpen(false)}
//                           >
//                             Your Profile
//                           </a>
//                           <button
//                             onClick={handleLogout}
//                             className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                           >
//                             Sign out
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-center">
//               <Button 
//                 variant="primary" 
//                 size="sm" 
//                 className="ml-4"
//                 onClick={() => window.location.href = '#login'}
//               >
//                 Log in
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };
import React, { useState, useEffect } from 'react'
import { Menu, X, User as UserIcon, LogOut, ChevronDown } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'

function Navbar({ onOpenSidebar }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(storedUser))
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [])

  const isAdmin = user?.role === 'admin'
  const isTemp  = user?.role === 'temp-admin'

  const toggleMenu = () => setIsMenuOpen(v => !v)
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setIsMenuOpen(false)
    navigate('/')
  }

  // decide mobile container alignment:
  // - admin/temp → justify-between
  // - regular user → justify-center
  const containerClasses = `
    flex h-16
    ${isAdmin || isTemp ? 'justify-between' : 'justify-center'}
    md:justify-between
  `

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={containerClasses.trim()}>
          {/* Left side: only show on mobile for admins */}
          {(isAdmin || isTemp) && (
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={onOpenSidebar}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Logo always visible, centered for regular users on mobile */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-3xl font-bold text-primary-600">BidMaster</span>
          </div>

          {/* Right side: desktop menu + mobile avatar for admins */}
          {isAuthenticated && (isAdmin || isTemp) && (
            <div className="flex items-center">
              {/* Desktop user menu */}
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="relative ml-3">
                  <button
                    type="button"
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={toggleMenu}
                  >
                    <span className="sr-only">Open user menu</span>
                    <Avatar src={user.avatar} alt={user.username} size="sm" className="mr-2" />
                    <span className="mr-1">{user.username}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <a
                          href="/admin-profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserIcon className="mr-2 h-4 w-4" />
                          Your Profile
                        </a>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile avatar dropdown for admins */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  className="flex rounded-full items-center"
                  onClick={toggleMenu}
                >
                  <Avatar src={user.avatar} alt={user.username} size="sm" />
                </button>
                {isMenuOpen && (
                  <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-40">
                    <div className="rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                      <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-4">
                          <Avatar src={user.avatar} alt={user.username} size="md" />
                          <div className="ml-3">
                            <div className="text-base font-medium text-gray-800">
                              {user.username}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                              {user.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ml-auto flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500"
                            onClick={toggleMenu}
                          >
                            <span className="sr-only">Close menu</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-3 space-y-1">
                          <a
                            href="/admin-profile"
                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Your Profile
                          </a>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unauthenticated / regular user on mobile: show login button if not signed in */}
          {!isAuthenticated && (
            <div className="flex items-center md:flex-none">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/')}
              >
                Log in
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
