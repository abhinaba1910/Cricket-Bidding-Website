// import React, { useState, useEffect } from "react";
// import { Menu, X, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
// import Avatar from "../ui/Avatar";
// import Button from "../ui/Button";
// import { Link, useNavigate } from "react-router-dom";
// import logo from "../../assets/logo.jpeg";

// function Navbar({ onOpenSidebar }) {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const storedUser = localStorage.getItem("user");
//     if (token && storedUser) {
//       setIsAuthenticated(true);
//       setUser(JSON.parse(storedUser));
//     } else {
//       setIsAuthenticated(false);
//       setUser(null);
//     }
//   }, []);

//   const isAdmin = user?.role === "admin";
//   const isTemp = user?.role === "temp-admin";

//   const toggleMenu = () => setIsMenuOpen((v) => !v);
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setIsAuthenticated(false);
//     setUser(null);
//     setIsMenuOpen(false);
//     navigate("/");
//   };

//   const containerClasses = `
//     flex h-16
//     ${isAdmin || isTemp ? "justify-between" : "justify-center"}
//     md:justify-between
//   `;

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className={containerClasses.trim()}>
//           {(isAdmin || isTemp) && (
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
//           )}

// <Link to="/dashboard" className="flex items-center gap-2">
//   <img
//     src={logo}
//     alt="Logo"
//     className="h-10 w-10 object-contain rounded-full shadow-md transform transition-transform duration-300 group-hover:rotate-6"
//   />
//   <span className="relative text-3xl font-extrabold tracking-tight text-primary-600 group-hover:text-blue-700 transition-colors duration-300">
//     <span className="typewriter-loop text-primary-600">
//       Cric<span className="text-blue-500">Bid</span>
//     </span>
//   </span>
// </Link>




//           {isAuthenticated && (
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
//                       src={user.avatar}
//                       alt={user.username}
//                       size="sm"
//                       className="mr-2"
//                     />
//                     <span className="mr-1">{user.username}</span>
//                     <ChevronDown className="h-4 w-4 text-gray-500" />
//                   </button>
//                   {isMenuOpen && (
//                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
//                       <div className="py-1">
//                         <a
//                           href="/admin-profile"
//                           className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                           onClick={() => setIsMenuOpen(false)}
//                         >
//                           <UserIcon className="mr-2 h-4 w-4" />
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

//               {(isAdmin || isTemp) && (
//                 <div className="md:hidden flex items-center">
//                   <button
//                     type="button"
//                     className="flex rounded-full items-center"
//                     onClick={toggleMenu}
//                   >
//                     <Avatar src={user.avatar} alt={user.username} size="sm" />
//                   </button>
//                   {isMenuOpen && (
//                     <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-40">
//                       <div className="rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
//                         <div className="pt-4 pb-3 border-t border-gray-200">
//                           <div className="flex items-center px-4">
//                             <Avatar
//                               src={user.avatar}
//                               alt={user.username}
//                               size="md"
//                             />
//                             <div className="ml-3">
//                               <div className="text-base font-medium text-gray-800">
//                                 {user.username}
//                               </div>
//                               <div className="text-sm font-medium text-gray-500">
//                                 {user.email}
//                               </div>
//                             </div>
//                             <button
//                               type="button"
//                               className="ml-auto flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500"
//                               onClick={toggleMenu}
//                             >
//                               <span className="sr-only">Close menu</span>
//                               <X className="h-6 w-6" aria-hidden="true" />
//                             </button>
//                           </div>
//                           <div className="mt-3 space-y-1">
//                             <a
//                               href="/admin-profile"
//                               className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                               onClick={() => setIsMenuOpen(false)}
//                             >
//                               Your Profile
//                             </a>
//                             <button
//                               onClick={handleLogout}
//                               className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                             >
//                               Sign out
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {!isAuthenticated && (
//             <div className="flex items-center md:flex-none">
//               <Button variant="primary" size="sm" onClick={() => navigate("/")}>
//                 Log in
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }
// export default Navbar;



import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

function TypewriterText() {
  const words = ["Welcome", "To", "CricBid"];
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const baseSpeed = isDeleting ? 120 : 160;

    if (pause) {
      const pauseTimeout = setTimeout(() => {
        setPause(false);
        if (isDeleting) {
          setCharIndex((prev) => prev - 1);
        } else {
          setIsDeleting(true);
        }
      }, 5000); // ← Increased pause duration here

      return () => clearTimeout(pauseTimeout);
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      } else {
        setDisplayText(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex === currentWord.length) {
          setPause(true);
        }
      }
    }, baseSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, pause, wordIndex]);

  return (
    <span className="text-3xl font-extrabold tracking-tight text-primary-600 group-hover:text-blue-700 transition-colors duration-300">
      {displayText}
      <span className="border-r-2 border-blue-500 animate-pulse ml-1" />
    </span>
  );
}


function Navbar({ onOpenSidebar }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const isAdmin = user?.role === "admin";
  const isTemp = user?.role === "temp-admin";

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setIsMenuOpen(false);
    navigate("/");
  };

  const containerClasses = `
    flex h-16
    ${isAdmin || isTemp ? "justify-between" : "justify-center"}
    md:justify-between
  `;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={containerClasses.trim()}>
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

          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-12 object-contain rounded-full shadow-md transform transition-transform duration-300 group-hover:rotate-6"
            />
            <TypewriterText />
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="relative ml-3">
                  <button
                    type="button"
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={toggleMenu}
                  >
                    <span className="sr-only">Open user menu</span>
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      size="sm"
                      className="mr-2"
                    />
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

              {(isAdmin || isTemp) && (
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
                            <Avatar
                              src={user.avatar}
                              alt={user.username}
                              size="md"
                            />
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
              )}
            </div>
          ) : (
            <div className="flex items-center md:flex-none">
              <Button variant="primary" size="sm" onClick={() => navigate("/")}>Log in</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
