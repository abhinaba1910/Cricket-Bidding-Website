// UserBiddingDashboardMobile.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import BidButton from '../../components/ui/BidButton';

// ─── Shared “CriteriaTable” for Mobile ──────────────────────────────────
function CriteriaTable() {
  const totalCriteria = 24;
  const foreignCount   = 0;
  const foreignMax     = 15;
  const indianCount    = 0;
  const indianMax      = 9;
  const batCount       = 0;
  const ballCount      = 0;
  const jerseyCount    = 0;
  const gloveCount     = 0;

  return (
    <motion.div
      className="bg-blue-700 rounded-xl overflow-hidden shadow-lg w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
    >
      <div className="flex justify-between items-center bg-blue-900/80 px-3 py-2">
        <span className="text-xs font-medium uppercase text-gray-200">Criteria</span>
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
            <span className="text-sm font-medium text-white">{jerseyCount}</span>
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
  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-4 w-full max-w-md shadow-xl mb-4 flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', delay: 0.2 }}
      whileHover={{ y: -5 }}
    >
      <motion.div 
        className="rounded-full bg-gray-700 w-14 h-14 flex items-center justify-center mr-3 flex-shrink-0"
        whileHover={{ rotate: 10 }}
      >
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={player.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-2xl">👤</span>
        )}
      </motion.div>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold truncate">{player.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-blue-600/30 px-2 py-1 rounded-full">
            {player.role}
          </span>
          <span className="text-xs bg-amber-600/30 px-2 py-1 rounded-full font-semibold">
            {player.basePrice}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Mobile Component ─────────────────────────────────────────────
export default function UserBiddingDashboardMobile() {
  const navigate = useNavigate();
  const [fullScreen, setFullScreen] = useState(false);
  const [rtmCount, setRtmCount]     = useState(1);
  const [mobileTab, setMobileTab]   = useState('bid');

  const toggleFullScreen = () => setFullScreen(fs => !fs);

  // ─── Sample Auction Data ────────────────────────────────────────
  const sampleAuction = {
    lastSold:      { name: 'N. Sciver-Brunt', price: '5 CR', team: 'Mumbai' },
    mostExpensive: { name: 'Chamari Athapaththu', price: '6 CR', team: 'Delhi' },
    currentLot:    {
      id: 'lot7',
      name: 'Richa Ghosh',
      role: 'Wicket-Keeper',
      batting: 'RHB',
      bowling: 'Right Arm Offbreak',
      basePrice: '40L',
      avatarUrl: null,
    },
    currentBid:    {
      amount:  '45L',
      team:    'Royal Challengers',
      teamLogo: '/logos/rcb.png',
    },
    purseBalance: '200 CR',
    adminImageUrl: null,
  };
  const { currentLot, adminImageUrl } = sampleAuction;

  // ─── Swipe Handlers for Mobile Tabs ──────────────────────────
  const handleSwipe = dir => {
    if (dir === 'left') {
      setMobileTab('stats');
    } else if (dir === 'right') {
      setMobileTab('bid');
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft:  () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackMouse: true,
  });

  // ─── Container Classes (Full-screen toggle) ───────────────────
  const containerClasses = [
    'text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900',
    fullScreen
      ? 'fixed inset-0 z-[9999] overflow-auto'
      : 'relative mx-auto',
    'h-screen overflow-auto',
  ].join(' ');

  // ─── Button handlers ──────────────────────────────────────────
  const handlePlaceBid = () => {
    // alert('Bid functionality');
  };

  const handleUseRTM = () => {
    if (rtmCount > 0) {
      setRtmCount(c => c - 1);
      alert('RTM used!');
    } else {
      alert('No RTMs left');
    }
  };

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
          {fullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </motion.button>
      </div>

      {/* ─── Mobile Tabs Navigation ──────────────────────────────── */}
      <div className="flex justify-around border-b border-blue-700 bg-gray-800">
        <motion.button
          className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
            mobileTab === 'bid'
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-gray-300'
          }`}
          onClick={() => setMobileTab('bid')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Bidding
        </motion.button>
        <motion.button
          className={`py-3 px-4 text-sm font-medium flex-1 text-center ${
            mobileTab === 'stats'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-gray-300'
          }`}
          onClick={() => setMobileTab('stats')}
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
  className="flex items-center justify-center space-x-2 w-full mb-1  md:hidden"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.2 }}
>
  {/* “Teams List” */}
  <motion.button
    onClick={() => navigate('/user/teams-list')}
    className="flex-1 min-w-[60px] py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md text-center"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    Teams
  </motion.button>

  {/* “Players List” */}
  <motion.button
    onClick={() => navigate('/user/players-list')}
    className="flex-1 min-w-[80px]  py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl text-xs sm:text-sm shadow-md text-center"
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
    <p className="text-xs pr-8 text-gray-300 text-right mb-4">{rtmCount} RTM(s)</p>

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
              <p className="text-lg font-mono text-green-400">{sampleAuction.purseBalance}</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 shadow-lg flex-1 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xs font-medium mb-1">Bid Now</h3>
              {/* ▶︎ Pass handlePlaceBid here (instead of handleBid) and include amount */}
              <BidButton amount="50L" onClick={handlePlaceBid} />
              <p className="mt-1 text-xs opacity-75">Next: 50L</p>
            </motion.div>
          </div>
        </div>

{/* ─── MOBILE: Bidding / Stats Sections ─────────────── */}
        <AnimatePresence mode="wait">
          {/* Bidding Tab */}
          {mobileTab === 'bid' && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              key="bid-tab"
            >
              {/* Small Player Card */}
              <SmallPlayerCard player={currentLot} />
              
              {/* Current Bid Section */}
              <motion.div
                className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-5 w-full text-center shadow-xl mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              >
                <div className="mb-3">
                  <span className="text-xs uppercase opacity-75">Current Highest Bid</span>
                </div>
                <motion.div
                  className="rounded-xl bg-amber-500 py-3 font-bold text-xl text-black shadow-lg mb-4"
                  whileHover={{ scale: 1.03 }}
                >
                  {sampleAuction.currentBid.amount}
                </motion.div>
                
                <div className="flex items-center justify-center mb-4">
                  <motion.div 
                    className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-2"
                    whileHover={{ rotate: 10 }}
                  >
                    {sampleAuction.currentBid.teamLogo ? (
                      <img
                        src={sampleAuction.currentBid.teamLogo}
                        alt={sampleAuction.currentBid.team}
                        className="w-6 h-6"
                      />
                    ) : (
                      <span>🏏</span>
                    )}
                  </motion.div>
                  <p className="text-sm">by {sampleAuction.currentBid.team}</p>
                </div>
                

              </motion.div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {mobileTab === 'stats' && (
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
                transition={{ type: 'spring', delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center">
                  <motion.div 
                    className="rounded-full bg-gray-700 w-16 h-16 flex items-center justify-center mr-3"
                    whileHover={{ rotate: 10 }}
                  >
                    {currentLot.avatarUrl ? (
                      <img
                        src={currentLot.avatarUrl}
                        alt={currentLot.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </motion.div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold">{currentLot.name}</h2>
                    <p className="text-xs bg-blue-600/30 inline-block px-2 py-1 rounded-full">
                      {currentLot.role}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <motion.div 
                    className="bg-blue-800/40 p-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Batting</span>
                    <p>{currentLot.batting}</p>
                  </motion.div>
                  <motion.div 
                    className="bg-blue-800/40 p-2 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Bowling</span>
                    <p>{currentLot.bowling}</p>
                  </motion.div>
                  <motion.div 
                    className="bg-blue-800/40 p-2 rounded-lg col-span-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="opacity-75 text-xs">Base Price</span>
                    <p className="font-semibold">{currentLot.basePrice}</p>
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
                <CriteriaTable />
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
                    <h4 className="text-sm font-medium mb-1">Last Sold Player</h4>
                    <div className="bg-blue-800/40 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>{sampleAuction.lastSold.name}</span>
                        <span className="text-amber-400">{sampleAuction.lastSold.price}</span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">{sampleAuction.lastSold.team}</div>
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
                        <span>{sampleAuction.mostExpensive.name}</span>
                        <span className="text-green-400">{sampleAuction.mostExpensive.price}</span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">{sampleAuction.mostExpensive.team}</div>
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
          <motion.div className="flex justify-center">
            <div className="flex flex-col items-center bg-gradient-to-br from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg w-full">
              <motion.div 
                className="flex items-center w-full"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="rounded-full bg-gray-700 w-16 h-16 flex items-center justify-center mr-3"
                  whileHover={{ rotate: 10 }}
                >
                  {adminImageUrl ? (
                    <img
                      src={adminImageUrl}
                      alt="Admin"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </motion.div>
                <div>
                  <p className="text-sm font-medium">Auction Controller</p>
                  <p className="text-xs opacity-75">Admin</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}