// import React, { useState } from 'react';
// import { X, Home, Users, Award, Briefcase, Settings, TrendingUp } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { RiAuctionLine } from "react-icons/ri";
// const Sidebar = ({ isOpen, onClose }) => {
//   const { user } = useAuth();
//   const isAdmin = user?.role === 'admin';
  
//   const navItems = [
//     { name: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/dashboard' },
//     { name: 'All Auctions', icon: <TrendingUp className="w-5 h-5" />, href: '/admin-auction-info' },
//     { name: 'My Auctions', icon: <RiAuctionLine className="w-5 h-5" />, href: '/admins-my-auction-info' },
//     { name: 'Teams', icon: <Briefcase className="w-5 h-5" />, href: '/admin-teams-info' },
//     { name: 'Players', icon: <Users className="w-5 h-5" />, href: '/admin-players-info' },
//   ];
  
//   const adminItems = [
//     { name: 'Manage Users', icon: <Users className="w-5 h-5" />, href: '#users' },
//     { name: 'Create Teams', icon: <Briefcase className="w-5 h-5" />, href: '/create-team' },
//     { name: 'Add Players', icon: <Users className="w-5 h-5" />, href: '/add-players' },
//     // { name: 'Add Players', icon: <Users className="w-5 h-5" />, href: '/add-players' },
//     { name: 'Settings', icon: <Settings className="w-5 h-5" />, href: '#settings' },
//   ];

//   const handleNavigation = (href) => {
//     window.location.href = href;
//     onClose();
//   };

//   return (
//     <>
//       {/* Mobile sidebar overlay */}
//       {isOpen && (
//         <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={onClose} />
//       )}
      
//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:translate-x-0 md:static md:z-0
//         `}
//       >
//         <div className="h-full flex flex-col">
//           {/* Sidebar header */}
//           <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 md:hidden">
//             <div className="flex-1 flex justify-center">
//               <span className="text-xl font-bold text-primary-600">BidMaster</span>
//             </div>
//             <button
//               type="button"
//               className="md:hidden flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
//               onClick={onClose}
//             >
//               <span className="sr-only">Close sidebar</span>
//               <X className="h-6 w-6 text-gray-500" aria-hidden="true" />
//             </button>
//           </div>
          
//           {/* Navigation */}
//           <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">

//                 <div className="px-2 mb-3">
//                   <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                      Navigation
//                   </h3>

//             </div>
//             {navItems.map((item) => (
              
//               <button
//                 key={item.name}
//                 className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
//                 onClick={() => handleNavigation(item.href)}
//               >
//                 <span className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600">
//                   {item.icon}
//                 </span>
//                 {item.name}
//               </button>
//             ))}
            
//             {isAdmin && (
//               <div className="pt-6 mt-6 border-t border-gray-200">
//                 <div className="px-2 mb-3">
//                   <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     Admin Controls
//                   </h3>
//                 </div>
                
//                 {adminItems.map((item) => (
//                   <button
//                     key={item.name}
//                     className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
//                     onClick={() => handleNavigation(item.href)}
//                   >
//                     <span className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600">
//                       {item.icon}
//                     </span>
//                     {item.name}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </nav>
          
//           {/* Info badge */}
//           <div className="p-4 border-t border-gray-200">
//             <div className="bg-primary-50 p-3 rounded-lg">
//               <div className="flex items-center">
//                 <Award className="h-6 w-6 text-primary-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-primary-800">
//                     {isAdmin ? 'Admin Access' : 'User Access'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;
import React, { useState, useEffect } from 'react'
import { X, Home, Users as UsersIcon, Award, Briefcase, Settings, TrendingUp } from 'lucide-react'
import { RiAuctionLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

const Sidebar = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isAdmin = user?.role === 'admin'
  const isTempAdmin = user?.role === 'temp-admin'
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

  const handleNavigation = (href) => {
    navigate(href)
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-0
        `}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 md:hidden">
            <div className="flex-1 flex justify-center">
              <span className="text-xl font-bold text-primary-600">BidMaster</span>
            </div>
            <button
              type="button"
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-gray-500" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <div className="px-2 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </h3>
            </div>
            <button
              className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
              onClick={() => handleNavigation('/dashboard')}
            >
              <Home className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
              Dashboard
            </button>
            <button
              className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
              onClick={() => handleNavigation('/admin-auction-info')}
            >
              <TrendingUp className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
              All Auctions
            </button>
            {(isAdmin || isTempAdmin) && (<button
              className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
              onClick={() => handleNavigation('/admins-my-auction-info')}
            >
              <RiAuctionLine className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
              My Auctions
            </button>)}
            {(isAdmin || isTempAdmin) && (<button
              className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
              onClick={() => handleNavigation('/admin-teams-info')}
            >
              <Briefcase className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
              Teams
            </button>)}
            {(isAdmin || isTempAdmin) && (<button
              className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
              onClick={() => handleNavigation('/admin-players-info')}
            >
              <UsersIcon className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
              Players
            </button>)}

            {isAdmin && (
              <>
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <div className="px-2 mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin Controls
                    </h3>
                  </div>
                  <button
                    className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
                    onClick={() => handleNavigation('#users')}
                  >
                    <UsersIcon className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
                    Manage Users
                  </button>
                  <button
                    className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
                    onClick={() => handleNavigation('/create-team')}
                  >
                    <Briefcase className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
                    Create Teams
                  </button>
                  <button
                    className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
                    onClick={() => handleNavigation('/add-players')}
                  >
                    <UsersIcon className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
                    Add Players
                  </button>
                  <button
                    className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 w-full text-left"
                    onClick={() => handleNavigation('#settings')}
                  >
                    <Settings className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary-600 w-5 h-5" />
                    Settings
                  </button>
                </div>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-primary-50 p-3 rounded-lg">
              <div className="flex items-center">
                <Award className="h-6 w-6 text-primary-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-800">
                    {isAdmin ? 'Admin Access' : 'User Access'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
