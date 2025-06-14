// // UserBiddingDashboardMobile.jsx
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { useSwipeable } from 'react-swipeable';
// import BidButton from '../../components/ui/BidButton';
// import CharacterCard from '../characters/CharacterCard';

// // ─── Shared “CriteriaTable” for Mobile ──────────────────────────────────
// function CriteriaTable() {
//   const totalCriteria = 24;
//   const foreignCount   = 0;
//   const foreignMax     = 15;
//   const indianCount    = 0;
//   const indianMax      = 9;
//   const batCount       = 0;
//   const ballCount      = 0;
//   const jerseyCount    = 0;
//   const gloveCount     = 0;

//   return (
//     <motion.div
//       className="bg-blue-700 rounded-xl overflow-hidden shadow-lg w-full"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
//     >
//       <div className="flex justify-between items-center bg-blue-900/80 px-3 py-2">
//         <span className="text-xs font-medium uppercase text-gray-200">Criteria</span>
//         <span className="text-xs font-semibold text-gray-100">
//           {`${foreignCount + indianCount}/${totalCriteria}`}
//         </span>
//       </div>

//       <div className="grid grid-cols-2 divide-x divide-blue-800 bg-blue-700">
//         <div className="flex flex-col items-start px-3 py-2 space-y-2">
//           <div className="flex items-center space-x-2">
//             <span className="text-lg">✈️</span>
//             <span className="text-sm font-medium text-white">{`${foreignCount}/${foreignMax}`}</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-lg">🇮🇳</span>
//             <span className="text-sm font-medium text-white">{`${indianCount}/${indianMax}`}</span>
//           </div>
//         </div>

//         <div className="flex flex-col items-end px-3 py-2 space-y-2">
//           <div className="flex items-center space-x-2">
//             <span className="text-lg">🏏</span>
//             <span className="text-sm font-medium text-white">{batCount}</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-lg">🏐</span>
//             <span className="text-sm font-medium text-white">{ballCount}</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-lg">🎽</span>
//             <span className="text-sm font-medium text-white">{jerseyCount}</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-lg">🥊</span>
//             <span className="text-sm font-medium text-white">{gloveCount}</span>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
// function SmallPlayerCard({ player }) {
//   return (
//     <motion.div
//       className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl mb-4 flex items-center"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ type: 'spring', delay: 0.2 }}
//       whileHover={{ y: -5 }}
//     >
//       <motion.div
//         className="rounded-full bg-gray-700 w-14 h-14 flex items-center justify-center mr-3 flex-shrink-0"
//         whileHover={{ rotate: 10 }}
//       >
//         {player.avatarUrl ? (
//           <img
//             src={player.avatarUrl}
//             alt={player.name}
//             className="w-full h-full object-cover rounded-full"
//           />
//         ) : (
//           <span className="text-2xl">👤</span>
//         )}
//       </motion.div>
//       <div className="flex flex-col">
//         <h2 className="text-lg font-bold truncate">{player.name}</h2>
//         <div className="flex items-center gap-2 mt-1">
//           <span className="text-xs bg-blue-600/30 px-2 py-1 rounded-full">
//             {player.role}
//           </span>
//           <span className="text-xs bg-amber-600/30 px-2 py-1 rounded-full font-semibold">
//             {player.basePrice}
//           </span>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Main Mobile Component ─────────────────────────────────────────────
// export default function UserBiddingDashboardMobile() {
//   const navigate = useNavigate();
//   const [fullScreen, setFullScreen] = useState(false);
//   const [rtmCount, setRtmCount]     = useState(1);
//   const [mobileTab, setMobileTab]   = useState('bid');

//   const toggleFullScreen = () => setFullScreen(fs => !fs);

//   // ─── Sample Auction Data ────────────────────────────────────────
//   const sampleAuction = {
//     lastSold:      { name: 'N. Sciver-Brunt', price: '5 CR', team: 'Mumbai' },
//     mostExpensive: { name: 'Chamari Athapaththu', price: '6 CR', team: 'Delhi' },
//     currentLot:    {
//       id: 'lot7',
//       name: 'Richa Ghosh',
//       role: 'Wicket-Keeper',
//       batting: 'RHB',
//       bowling: 'Right Arm Offbreak',
//       basePrice: '40L',
//       avatarUrl: null,
//     },
//     currentBid:    {
//       amount:  '45L',
//       team:    'Royal Challengers',
//       teamLogo: '/logos/rcb.png',
//     },
//     purseBalance: '200 CR',
//     adminImageUrl: null,
//   };
//   const { currentLot, adminImageUrl } = sampleAuction;

//   // ─── Swipe Handlers for Mobile Tabs ──────────────────────────
//   const handleSwipe = dir => {
//     if (dir === 'left') {
//       setMobileTab('stats');
//     } else if (dir === 'right') {
//       setMobileTab('bid');
//     }
//   };

//   const handlers = useSwipeable({
//     onSwipedLeft:  () => handleSwipe('left'),
//     onSwipedRight: () => handleSwipe('right'),
//     trackMouse: true,
//   });

//   // ─── Container Classes (Full-screen toggle) ───────────────────
//   const containerClasses = [
//     'text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900',
//     fullScreen
//       ? 'fixed inset-0 z-[9999] overflow-auto'
//       : 'relative mx-auto',
//     'h-screen overflow-auto',
//   ].join(' ');

//   // ─── Button handlers ──────────────────────────────────────────
//   const handlePlaceBid = () => {
//     // alert('Bid functionality');
//   };

//   const handleUseRTM = () => {
//     if (rtmCount > 0) {
//       setRtmCount(c => c - 1);
//       alert('RTM used!');
//     } else {
//       alert('No RTMs left');
//     }
//   };

//   return (
//     <div className={`${containerClasses} md:hidden`} {...handlers}>
//       {/* ─── Header ───────────────────────────────────────────── */}
//       <div className="flex justify-between items-center px-4 py-3 bg-gray-800/60 backdrop-blur-sm">
//         <motion.h1
//           className="text-xl sm:text-2xl font-bold"
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           IPL Auction
//         </motion.h1>
//         <motion.button
//           onClick={toggleFullScreen}
//           className="px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-xs sm:text-sm transition-all duration-200"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {fullScreen ? 'Exit Full Screen' : 'Full Screen'}
//         </motion.button>
//       </div>

//       {/* ─── Mobile Tabs Navigation ──────────────────────────────── */}
//       <div className="flex justify-around border-b border-blue-700 bg-gray-800">
//         <motion.button
//           className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
//             mobileTab === 'bid'
//               ? 'border-b-2 border-amber-500 text-amber-500'
//               : 'text-gray-300'
//           }`}
//           onClick={() => setMobileTab('bid')}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           Bidding
//         </motion.button>
//         <motion.button
//           className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
//             mobileTab === 'stats'
//               ? 'border-b-2 border-emerald-400 text-emerald-400'
//               : 'text-gray-300'
//           }`}
//           onClick={() => setMobileTab('stats')}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           Stats
//         </motion.button>
//       </div>

//       {/* ─── Mobile Content (swipeable) ─────────────────────────── */}
//       <div className="px-4 pt-4 w-full">
//         {/* ─── Teams List & Players List Buttons ─────────────── */}
//        <motion.div
//   className="flex items-center justify-center space-x-2 w-full mb-1  md:hidden"
//   initial={{ opacity: 0 }}
//   animate={{ opacity: 1 }}
//   transition={{ delay: 0.2 }}
// >
//   {/* “Teams List” */}
//   <motion.button
//     onClick={() => navigate('/user/teams-list')}
//     className="flex-1 min-w-[60px] py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md text-center"
//     whileHover={{ scale: 1.05 }}
//     whileTap={{ scale: 0.95 }}
//   >
//     Teams
//   </motion.button>

//   {/* “Players List” */}
//   <motion.button
//     onClick={() => navigate('/user/players-list')}
//     className="flex-1 min-w-[80px]  py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md text-center"
//     whileHover={{ scale: 1.05 }}
//     whileTap={{ scale: 0.95 }}
//   >
//     Players
//   </motion.button>

//   {/* RTM button + remaining count */}
//   <div className="flex-1 min-w-[80px] flex flex-col items-center">
//     <motion.button
//       onClick={handleUseRTM}
//       className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl text-xs sm:text-sm text-white font-medium shadow-md"
//       whileHover={{ scale: 1.03 }}
//       whileTap={{ scale: 0.97 }}
//     >
//       USE RTM
//     </motion.button>
//   </div>
// </motion.div>
//     <p className="text-xs pr-8 text-gray-300 text-right mb-4">{rtmCount} RTM(s)</p>

//         {/* ─── Mobile Purse Balance & RTM ───────────────────── */}
//         <div className="w-full max-w-md mb-4">
//           <div className="flex gap-3">
//             <motion.div
//               className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 shadow-lg flex-1"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//             >
//               <h3 className="text-xs font-medium mb-1">Purse</h3>
//               <p className="text-lg font-mono text-green-400">{sampleAuction.purseBalance}</p>
//             </motion.div>

//             <motion.div
//               className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 shadow-lg flex-1 text-center"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               <h3 className="text-xs font-medium mb-1">Bid Now</h3>
//               {/* ▶︎ Pass handlePlaceBid here (instead of handleBid) and include amount */}
//               <BidButton amount="50L" onClick={handlePlaceBid} />
//               <p className="mt-1 text-xs opacity-75">Next: 50L</p>
//             </motion.div>
//           </div>
//         </div>

// {/* ─── MOBILE: Bidding / Stats Sections ─────────────── */}
//         <AnimatePresence mode="wait">
//           {/* Bidding Tab */}
//           {mobileTab === 'bid' && (
//             <motion.div
//               className="w-full"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               key="bid-tab"
//             >
//               {/* Small Player Card */}
//               <SmallPlayerCard player={currentLot} />

//               {/* Current Bid Section */}
//               <motion.div
//                 className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-5 w-full text-center shadow-xl mb-6"
//                 initial={{ scale: 0.9 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
//               >
//                 <div className="mb-3">
//                   <span className="text-xs uppercase opacity-75">Current Highest Bid</span>
//                 </div>
//                 <motion.div
//                   className="rounded-xl bg-amber-500 py-3 font-bold text-xl text-black shadow-lg mb-4"
//                   whileHover={{ scale: 1.03 }}
//                 >
//                   {sampleAuction.currentBid.amount}
//                 </motion.div>

//                 <div className="flex items-center justify-center mb-4">
//                   <motion.div
//                     className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-2"
//                     whileHover={{ rotate: 10 }}
//                   >
//                     {sampleAuction.currentBid.teamLogo ? (
//                       <img
//                         src={sampleAuction.currentBid.teamLogo}
//                         alt={sampleAuction.currentBid.team}
//                         className="w-6 h-6"
//                       />
//                     ) : (
//                       <span>🏏</span>
//                     )}
//                   </motion.div>
//                   <p className="text-sm">by {sampleAuction.currentBid.team}</p>
//                 </div>

//               </motion.div>
//             </motion.div>
//           )}

//           {/* Stats Tab */}
//           {mobileTab === 'stats' && (
//             <motion.div
//               className="w-full"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 10 }}
//               transition={{ delay: 0.1 }}
//               key="stats-tab"
//             >
//               {/* Detailed Player Card */}
//               <motion.div
//                 className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl mb-6"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ type: 'spring', delay: 0.2 }}
//                 whileHover={{ y: -5 }}
//               >
//                 <div className="flex items-center">
//                   <motion.div
//                     className="rounded-full bg-gray-700 w-16 h-16 flex items-center justify-center mr-3"
//                     whileHover={{ rotate: 10 }}
//                   >
//                     {currentLot.avatarUrl ? (
//                       <img
//                         src={currentLot.avatarUrl}
//                         alt={currentLot.name}
//                         className="w-full h-full object-cover rounded-full"
//                       />
//                     ) : (
//                       <span className="text-2xl">👤</span>
//                     )}
//                   </motion.div>
//                   <div className="text-left">
//                     <h2 className="text-xl font-bold">{currentLot.name}</h2>
//                     <p className="text-xs bg-blue-600/30 inline-block px-2 py-1 rounded-full">
//                       {currentLot.role}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
//                   <motion.div
//                     className="bg-blue-800/40 p-2 rounded-lg"
//                     whileHover={{ scale: 1.02 }}
//                   >
//                     <span className="opacity-75 text-xs">Batting</span>
//                     <p>{currentLot.batting}</p>
//                   </motion.div>
//                   <motion.div
//                     className="bg-blue-800/40 p-2 rounded-lg"
//                     whileHover={{ scale: 1.02 }}
//                   >
//                     <span className="opacity-75 text-xs">Bowling</span>
//                     <p>{currentLot.bowling}</p>
//                   </motion.div>
//                   <motion.div
//                     className="bg-blue-800/40 p-2 rounded-lg col-span-2"
//                     whileHover={{ scale: 1.02 }}
//                   >
//                     <span className="opacity-75 text-xs">Base Price</span>
//                     <p className="font-semibold">{currentLot.basePrice}</p>
//                   </motion.div>
//                 </div>
//               </motion.div>

//               {/* Criteria Table */}
//               <motion.div
//                 className="mb-6"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <CriteriaTable />
//               </motion.div>

//               {/* Auction Stats */}
//               <motion.div
//                 className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-5 w-full shadow-xl"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.1 }}
//               >
//                 <h3 className="text-lg font-bold mb-3">Auction Stats</h3>

//                 <div className="space-y-4">
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.1 }}
//                   >
//                     <h4 className="text-sm font-medium mb-1">Last Sold Player</h4>
//                     <div className="bg-blue-800/40 p-3 rounded-lg">
//                       <div className="flex justify-between">
//                         <span>{sampleAuction.lastSold.name}</span>
//                         <span className="text-amber-400">{sampleAuction.lastSold.price}</span>
//                       </div>
//                       <div className="text-xs opacity-75 mt-1">{sampleAuction.lastSold.team}</div>
//                     </div>
//                   </motion.div>

//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2 }}
//                   >
//                     <h4 className="text-sm font-medium mb-1">Most Expensive</h4>
//                     <div className="bg-blue-800/40 p-3 rounded-lg">
//                       <div className="flex justify-between">
//                         <span>{sampleAuction.mostExpensive.name}</span>
//                         <span className="text-green-400">{sampleAuction.mostExpensive.price}</span>
//                       </div>
//                       <div className="text-xs opacity-75 mt-1">{sampleAuction.mostExpensive.team}</div>
//                     </div>
//                   </motion.div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* ─── Admin Card (Always visible) ───────────────────── */}
//         <motion.div
//           className="mt-4 px-4"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//         >
//                 <div className='bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl'>

//                   <CharacterCard/>
//                 </div>
//           </motion.div>

//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import BidButton from "../../components/ui/BidButton";
import CharacterCard from "../characters/CharacterCard";
import toast from "react-hot-toast";
import api from "../../userManagement/Api";

// ─── Shared "CriteriaTable" for Mobile ──────────────────────────────────
function CriteriaTable({ tableNumbers }) {
  const totalCriteria = 24;

  // Calculate counts from tableNumbers
  const foreignCount = tableNumbers?.foreign
    ? Object.values(tableNumbers.foreign).reduce((sum, count) => sum + count, 0)
    : 0;
  const indianCount = tableNumbers?.indian
    ? Object.values(tableNumbers.indian).reduce((sum, count) => sum + count, 0)
    : 0;

  const foreignMax = 15;
  const indianMax = 9;

  // These would need to come from your actual data structure
  const batCount =
    (tableNumbers?.foreign?.Batsman || 0) +
    (tableNumbers?.indian?.Batsman || 0);
  const ballCount =
    (tableNumbers?.foreign?.Bowler || 0) + (tableNumbers?.indian?.Bowler || 0);
  const jerseyCount =
    (tableNumbers?.foreign?.["All-Rounder"] || 0) +
    (tableNumbers?.indian?.["All-Rounder"] || 0);
  const gloveCount =
    (tableNumbers?.foreign?.["Wicket-Keeper"] || 0) +
    (tableNumbers?.indian?.["Wicket-Keeper"] || 0);

  return (
    <motion.div
      className="bg-blue-700 rounded-xl overflow-hidden shadow-lg w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
    >
      <div className="flex justify-between items-center bg-blue-900/80 px-3 py-2">
        <span className="text-xs font-medium uppercase text-gray-200">
          Criteria
        </span>
        <span className="text-xs font-semibold text-gray-100">
          {`${foreignCount + indianCount}/${totalCriteria}`}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-blue-800 bg-blue-700">
        <div className="flex flex-col items-start px-3 py-2 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">✈️</span>
            <span className="text-sm font-medium text-white">{`${foreignCount}/${foreignMax}`}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🇮🇳</span>
            <span className="text-sm font-medium text-white">{`${indianCount}/${indianMax}`}</span>
          </div>
        </div>

        <div className="flex flex-col items-end px-3 py-2 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏏</span>
            <span className="text-sm font-medium text-white">{batCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏐</span>
            <span className="text-sm font-medium text-white">{ballCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎽</span>
            <span className="text-sm font-medium text-white">
              {jerseyCount}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🥊</span>
            <span className="text-sm font-medium text-white">{gloveCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SmallPlayerCard({ player }) {
  const currentPlayer = player || {};

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl mb-4 flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", delay: 0.2 }}
      whileHover={{ y: -5 }}
    >
      <motion.div
        className="rounded-full bg-gray-700 w-14 h-14 flex items-center justify-center mr-3 flex-shrink-0"
        whileHover={{ rotate: 10 }}
      >
        {currentPlayer.playerPic ? (
          <img
            src={currentPlayer.playerPic}
            alt={currentPlayer.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-2xl">👤</span>
        )}
      </motion.div>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold truncate">
          {currentPlayer.name || "--/--"}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-blue-600/30 px-2 py-1 rounded-full">
            {currentPlayer.role || "--/--"}
          </span>
          <span className="text-xs bg-amber-600/30 px-2 py-1 rounded-full font-semibold">
            {currentPlayer.basePrice || "--/--"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Mobile Component ─────────────────────────────────────────────
export default function UserBiddingDashboardMobile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fullScreen, setFullScreen] = useState(false);
  const [rtmCount, setRtmCount] = useState(0);
  const [mobileTab, setMobileTab] = useState("bid");
  const [isBidding, setIsBidding] = useState(false);
  const [emoteToPlay, setEmoteToPlay] = useState(null);
  const [lastSoldTeam, setLastSoldTeam] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const toggleFullScreen = () => setFullScreen((fs) => !fs);

  // ─── Sample Auction Data (Default/Fallback) ────────────────────────────────────────
  const sampleAuction = {
    lastSold: { name: "--/--", price: "--/--", team: "--/--" },
    mostExpensive: { name: "--/--", price: "--/--", team: "--/--" },
    currentPlayer: {
      id: null,
      name: "--/--",
      role: "--/--",
      batting: "--/--",
      bowling: "--/--",
      basePrice: "--/--",
      avatarUrl: null,
    },
    currentBid: {
      amount: "--/--",
      team: "--/--",
      teamLogo: null,
    },
    purseBalance: "--/--",
    bidAmount: "--/--",
    tableNumbers: {
      foreign: {
        Batsman: 0,
        Bowler: 0,
        "All-Rounder": 0,
        "Wicket-Keeper": 0,
      },
      indian: {
        Batsman: 0,
        Bowler: 0,
        "All-Rounder": 0,
        "Wicket-Keeper": 0,
      },
    },
    team: {
      teamId: null,
      purse: "--/--",
      rtmCount: 0,
      avatar: null,
    },
    adminImageUrl: null,
  };

  const [auctionData, setAuctionData] = useState(sampleAuction);

  // Modal functions
  const openPlayerModal = () => {
    if (auctionData.currentPlayer) {
      setSelectedPlayer(auctionData.currentPlayer);
      setShowModal(true);
    }
  };

  const closePlayerModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

  // ─── Fetch Auction Data (from Desktop) ──────────────────────────
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const response = await api.get(`/bidding-portal/${id}`);
        const data = response.data;
        console.log("Fetched Auction Data:", data);
        setAuctionData(data);

        if (data.team?.avatar) {
          const raw = data.team.avatar; // e.g. "Frontend/public/models/char2.glb"
          const idx = raw.indexOf("/models"); // find where the real path starts
          const publicPath = idx >= 0 ? raw.slice(idx) : raw; // "/models/char2.glb"
          console.log("Loading GLB from:", publicPath);
          setAvatarUrl(publicPath);
        }

        setRtmCount(data.team?.rtmCount || 0);
        console.log("avatar from back:", data.team?.avatar);

        const history = data.biddingHistory || [];
        const lastEntry = history[history.length - 1] || null;
        if (lastEntry) {
          const soldTeamId = lastEntry.team._id || lastEntry.team;
          if (soldTeamId !== lastSoldTeam) {
            setLastSoldTeam(soldTeamId);

            if (soldTeamId === data.team?.teamId) {
              setEmoteToPlay("BidWon");
            } else {
              setEmoteToPlay("LostBid");
            }
            setTimeout(() => setEmoteToPlay(null), 5000);
          }
        }

        const formatPlayerData = (entry) => {
          if (!entry || !entry.player || !entry.team)
            return {
              name: "--/--",
              price: "--/--",
              team: "--/--",
            };

          return {
            name: entry.player.name || "--/--",
            price: entry.bidAmount || "--/--",
            team: entry.team.shortName || "--/--",
          };
        };

        setAuctionData((prev) => ({
          ...prev,
          lastSold: formatPlayerData(data.lastSoldPlayer),
          mostExpensive: formatPlayerData(data.mostExpensivePlayer),
        }));
      } catch (error) {
        console.error("Error fetching auction data:", error);
        setError("Failed to fetch auction data");
        toast.error("Error fetching auction data");
      }
    };

    if (id) {
      fetchAuctionData();
      const interval = setInterval(fetchAuctionData, 800);

      // Cleanup to stop interval on unmount
      return () => clearInterval(interval);
    }
  }, [id, lastSoldTeam]);

  // ─── Handle Bid (from Desktop) ──────────────────────────────────────
  const handleBid = async () => {
    const playerId = auctionData?.currentPlayer?._id;
    const teamId = auctionData?.team?.teamId;
    const visibleBid = auctionData?.bidAmount;

    if (!playerId || !teamId) {
      alert("Missing team or player information.");
      return;
    }

    if (!visibleBid || visibleBid <= 0) {
      alert("Invalid bid amount.");
      return;
    }

    const payload = {
      auctionId: id,
      playerId,
      teamId,
      bidAmount: visibleBid, // ✅ send what is visible, NOT incremented
    };

    try {
      setIsBidding(true);
      const res = await api.post(`/place-bid/${id}`, payload);
      setEmoteToPlay(null);
      setTimeout(() => setEmoteToPlay("HandRaise"), 10);

      toast.success("Bid Placed Successfully");
      // Refresh data
      const updated = await api.get(`/bidding-portal/${id}`);
      setAuctionData(updated.data);
    } catch (error) {
      console.error("Failed to place bid:", error);
      toast.error(error.response?.data?.error || "Failed to place bid");
    } finally {
      setIsBidding(false);
    }
  };

  // ─── Handle RTM (from Desktop) ──────────────────────────────────────
  const handleUseRTM = async () => {
    if (rtmCount <= 0) {
      alert("No RTMs left");
      return;
    }

    const myTeamId = auctionData?.team?.teamId;
    try {
      const response = await api.post(`/use-rtm/${id}`, {
        teamId: myTeamId, // The current user's selected team ID
      });

      toast.success("RTM successful!");
      setRtmCount((prev) => prev - 1);

      // Optionally refetch auction state or update local UI
      // await fetchAuctionData();
    } catch (err) {
      console.error("RTM error:", err);
      toast.error(err.response?.data?.message || "Failed to use RTM");
    }
  };

  // ─── Swipe Handlers for Mobile Tabs ──────────────────────────
  const handleSwipe = (dir) => {
    if (dir === "left") {
      setMobileTab("stats");
    } else if (dir === "right") {
      setMobileTab("bid");
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    trackMouse: true,
  });

  // ─── Container Classes (Full-screen toggle) ───────────────────
  const containerClasses = [
    "text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
    fullScreen ? "fixed inset-0 z-[9999] overflow-auto" : "relative mx-auto",
    "h-screen overflow-auto",
  ].join(" ");

  // Extract data for easier access
  const { tableNumbers, currentPlayer, adminImageUrl } = auctionData;
  const currentBid = auctionData.currentBid || {
    amount: "--/--",
    team: "--/--",
    teamLogo: null,
  };
  const purseBalance =
    auctionData.team?.purse || auctionData.purseBalance || "--/--";
  const nextBidAmount = auctionData.bidAmount || "--/--";

  return (
    <div className={`${containerClasses} md:hidden`} {...handlers}>
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-800/60 backdrop-blur-sm">
        <motion.h1
          className="text-xl sm:text-2xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          IPL Auction
        </motion.h1>
        <motion.button
          onClick={toggleFullScreen}
          className="px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-xs sm:text-sm transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {fullScreen ? "Exit Full Screen" : "Full Screen"}
        </motion.button>
      </div>

      {/* ─── Mobile Tabs Navigation ──────────────────────────────── */}
      <div className="flex justify-around border-b border-blue-700 bg-gray-800">
        <motion.button
          className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
            mobileTab === "bid"
              ? "border-b-2 border-amber-500 text-amber-500"
              : "text-gray-300"
          }`}
          onClick={() => setMobileTab("bid")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Bidding
        </motion.button>
        <motion.button
          className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
            mobileTab === "stats"
              ? "border-b-2 border-emerald-400 text-emerald-400"
              : "text-gray-300"
          }`}
          onClick={() => setMobileTab("stats")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Stats
        </motion.button>
      </div>

      {/* ─── Mobile Content (swipeable) ─────────────────────────── */}
      <div className="px-4 pt-4 w-full">
        {/* ─── Teams List & Players List Buttons ─────────────── */}
        <motion.div
          className="flex items-center justify-center space-x-2 w-full mb-1 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* "Teams List" */}
          <motion.button
            onClick={() => navigate("/user/teams-list")}
            className="flex-1 min-w-[60px] py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Teams
          </motion.button>

          {/* "Players List" */}
          <motion.button
            onClick={() => navigate("/user/players-list")}
            className="flex-1 min-w-[80px] py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Players
          </motion.button>

          {/* RTM button + remaining count */}
          <div className="flex-1 min-w-[80px] flex flex-col items-center">
            <motion.button
              onClick={handleUseRTM}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl text-xs sm:text-sm text-white font-medium shadow-md"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              USE RTM
            </motion.button>
          </div>
        </motion.div>
        <p className="text-xs pr-8 text-gray-300 text-right mb-4">
          {rtmCount} RTM(s)
        </p>

        {/* ─── Mobile Purse Balance & RTM ───────────────────── */}
        <div className="w-full max-w-md mb-4">
          <div className="flex gap-3">
            <motion.div
              className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 shadow-lg flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xs font-medium mb-1">Purse</h3>
              <p className="text-lg font-mono text-green-400">{purseBalance}</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 shadow-lg flex-1 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xs font-medium mb-1">Bid Now</h3>
              <BidButton
                amount={nextBidAmount}
                onClick={handleBid}
                disabled={isBidding}
              />
              <p className="mt-1 text-xs opacity-75">Next: {nextBidAmount}</p>
            </motion.div>
          </div>
        </div>

        {/* ─── MOBILE: Bidding / Stats Sections ─────────────── */}
        <AnimatePresence mode="wait">
          {/* Bidding Tab */}
          {mobileTab === "bid" && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              key="bid-tab"
            >
              {/* Small Player Card */}
              <SmallPlayerCard player={currentPlayer} />

              {/* Current Bid Section */}
              <motion.div
                className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-5 w-full text-center shadow-xl mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <div className="mb-3">
                  <span className="text-xs uppercase opacity-75">
                    Current Highest Bid
                  </span>
                </div>
                <motion.div
                  className="rounded-xl bg-amber-500 py-3 font-bold text-xl text-black shadow-lg mb-4"
                  whileHover={{ scale: 1.03 }}
                >
                  {currentBid.amount}
                </motion.div>

                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-2"
                    whileHover={{ rotate: 10 }}
                  >
                    {currentBid.team && currentBid.team.logoUrl ? (
                      <img
                        src={currentBid.team.logoUrl}
                        alt={currentBid.team.shortName || "Team"}
                        className="w-6 h-6"
                      />
                    ) : (
                      <span>🏏</span>
                    )}
                  </motion.div>
                  <p className="text-sm">
                    by{" "}
                    {typeof currentBid.team === "object"
                      ? currentBid.team?.shortName ||
                        currentBid.team?.teamName ||
                        "Unknown Team"
                      : currentBid.team || "Unknown Team"}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {mobileTab === "stats" && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
              key="stats-tab"
            >
              {/* Detailed Player Card */}
              <motion.div
                className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                whileHover={{ y: -5 }}
                onClick={openPlayerModal}
              >
                <div className="flex items-center">
                  <motion.div
                    className="rounded-full bg-gray-700 w-16 h-16 flex items-center justify-center mr-3"
                    whileHover={{ rotate: 10 }}
                  >
                    {currentPlayer?.playerPic ? (
                      <img
                        src={currentPlayer.playerPic}
                        alt={currentPlayer.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </motion.div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold">
                      {currentPlayer?.name || "--/--"}
                    </h2>
                    <p className="text-xs bg-blue-600/30 inline-block px-2 py-1 rounded-full">
                      {currentPlayer?.role || "--/--"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <motion.div
                    className="bg-blue-800/40 p-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Batting</span>
                    <p>{currentPlayer?.battingStyle || "--/--"}</p>
                  </motion.div>
                  <motion.div
                    className="bg-blue-800/40 p-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Bowling</span>
                    <p>{currentPlayer?.bowlingStyle || "--/--"}</p>
                  </motion.div>
                  <motion.div
                    className="bg-blue-800/40 p-2 rounded-lg col-span-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Base Price</span>
                    <p className="font-semibold">
                      {currentPlayer?.basePrice || "--/--"}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Criteria Table */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CriteriaTable tableNumbers={tableNumbers} />
              </motion.div>

              {/* Auction Stats */}
              <motion.div
                className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-5 w-full shadow-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-bold mb-3">Auction Stats</h3>

                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="text-sm font-medium mb-1">
                      Last Sold Player
                    </h4>
                    <div className="bg-blue-800/40 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>
                          {typeof auctionData.lastSold === "object"
                            ? auctionData.lastSold?.name
                            : auctionData.lastSold || "--/--"}
                        </span>
                        <span className="text-amber-400">
                          {typeof auctionData.lastSold === "object"
                            ? auctionData.lastSold?.price
                            : "--/--"}
                        </span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {typeof auctionData.lastSold === "object"
                          ? auctionData.lastSold?.team
                          : "--/--"}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-sm font-medium mb-1">Most Expensive</h4>
                    <div className="bg-blue-800/40 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>
                          {typeof auctionData.mostExpensive === "object"
                            ? auctionData.mostExpensive?.name
                            : auctionData.mostExpensive || "--/--"}
                        </span>
                        <span className="text-green-400">
                          {typeof auctionData.mostExpensive === "object"
                            ? auctionData.mostExpensive?.price
                            : "--/--"}
                        </span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {typeof auctionData.mostExpensive === "object"
                          ? auctionData.mostExpensive?.team
                          : "--/--"}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Admin Card (Always visible) ───────────────────── */}
        <motion.div
          className="mt-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl">
            <CharacterCard
              modelPath={avatarUrl}
              adminImageUrl={adminImageUrl}
              emoteToPlay={emoteToPlay}
            />
          </div>
        </motion.div>
      </div>

      {/* ─── Player Modal ─────────────────────────────────────── */}
      {showModal && selectedPlayer && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePlayerModal}
        >
          <motion.div
            className="bg-gradient-to-br from-indigo-800 to-blue-700 rounded-xl p-6 max-w-sm w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-gray-700 w-20 h-20 flex items-center justify-center mr-4">
                {selectedPlayer.playerPic ? (
                  <img
                    src={selectedPlayer.playerPic}
                    alt={selectedPlayer.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedPlayer.name}
                </h2>
                <p className="text-blue-200">{selectedPlayer.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-800/40 p-3 rounded-lg">
                <span className="opacity-75 text-sm">Batting</span>
                <p className="font-semibold">{selectedPlayer.batting}</p>
              </div>
              <div className="bg-blue-800/40 p-3 rounded-lg">
                <span className="opacity-75 text-sm">Bowling</span>
                <p className="font-semibold">{selectedPlayer.bowling}</p>
              </div>
              <div className="bg-blue-800/40 p-3 rounded-lg col-span-2">
                <span className="opacity-75 text-sm">Base Price</span>
                <p className="font-semibold text-lg">
                  {selectedPlayer.basePrice}
                </p>
              </div>
            </div>

            <button
              onClick={closePlayerModal}
              className="w-full py-2 bg-red-600 rounded-lg text-white font-medium"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
