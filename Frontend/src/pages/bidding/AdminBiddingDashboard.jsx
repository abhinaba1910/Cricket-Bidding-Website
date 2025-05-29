import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminBiddingDashboard() {
  // --- sample data ---
  const sampleAuction = {
    lastSold:      { name: 'N. Sciver-Brunt', price: '5 CR', team: 'Mumbai' },
    mostExpensive: { name: 'N. Sciver-Brunt', price: '5 CR', team: 'Mumbai' },
    currentLot:    {
      id: 'lot1',
      name: 'Sabbineni Meghana',
      role: 'Batter',
      batting: 'RHB',
      bowling: 'Right Arm Medium',
      basePrice: '30L',
      avatarUrl: null
    },
    currentBid:    {
      amount: '35L',
      team: 'Chennai Super Kings',
      teamLogo: '/logos/csk.png',
    },
  };

  // --- local state & handlers ---
  const [status, setStatus] = useState('live');
  const [showEdit, setShowEdit] = useState(false);
  const [bidAmount, setBidAmount] = useState(sampleAuction.currentBid.amount);
  const [fullScreen, setFullScreen] = useState(false);

  const toggleFullScreen   = () => setFullScreen(fs => !fs);
  const onStopBidding      = () => setStatus('paused');
  const onResumeBidding    = () => setStatus('live');
  const onSell             = () => setStatus('selling');
  const onMoveToUnsell     = () => setStatus('live');
  const onPauseAuction     = onStopBidding;
  const onEditBid          = () => setShowEdit(true);
  const onApplyBid         = () => setShowEdit(false);
  const onResetBid         = () => {
    setBidAmount(sampleAuction.currentBid.amount);
    setShowEdit(false);
  };

  // --- container classes toggle full-screen vs normal ---
  const containerClasses = [
    ' p-4 text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900',
    fullScreen
      ? 'fixed inset-0 z-[9999] overflow-auto'
      : 'relative mx-auto max-w-7xl',
  ].join(' ');

  return (
    <div className={containerClasses+ " pt-2 md:pt-4"}>
      {/* Full-screen toggle */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleFullScreen}
          className="px-3 py-1 bg-black bg-opacity-50 rounded hover:bg-opacity-75 text-xs sm:text-sm"
        >
          {fullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>

      {/* Responsive grid: 1-col mobile, 4-col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(85vh-4rem)]">
        {/* === Left Sidebar (desktop only) === */}
        <div className="hidden md:flex flex-col space-y-4 md:h-full md:justify-between">
          <div>
            {[['Last Sold', sampleAuction.lastSold], ['Most Expensive', sampleAuction.mostExpensive]].map(
                ([title, info]) => (
                    <div key={title} className="bg-white bg-opacity-10 rounded p-3 mt-2 text-sm">
                  <h4 className="uppercase text-xs font-medium">{title}</h4>
                  <p className="font-semibold text-sm">{info.name}</p>
                  <p className="text-xs">{info.price} — {info.team}</p>
                </div>
              )
            )}
          </div>

          {/* Bottom item only on desktop */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
            <h2 className="font-bold text-lg sm:text-xl">{sampleAuction.currentLot.name}</h2>
            <p className="text-sm">{sampleAuction.currentLot.role}</p>
            <p className="mt-1 text-xs">Bat: {sampleAuction.currentLot.batting}</p>
            <p className="text-xs">Ball: {sampleAuction.currentLot.bowling}</p>
            <p className="mt-2 text-base font-semibold">
              Base Price: {sampleAuction.currentLot.basePrice}
            </p>
          </div>
        </div>

        {/* === Center Section === */}
        <div className="md:col-span-2 flex flex-col items-center space-y-4">
          {/* Top Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button className="px-3 py-2 bg-blue-500 rounded hover:bg-blue-600 text-xs sm:text-sm">
              Player List
            </button>
            <button className="px-3 py-2 bg-blue-500 rounded hover:bg-blue-600 text-xs sm:text-sm">
              Teams
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={onEditBid}
              className="px-3 py-2 bg-blue-500 rounded hover:bg-blue-600 text-xs sm:text-sm"
            >
              Edit Bid
            </button>
            <button
              onClick={onResetBid}
              className="px-3 py-2 bg-red-500 rounded hover:bg-red-600 text-xs sm:text-sm"
            >
              Reset Bid
            </button>
          </div>

          {/* Avatar & Current Bid */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center w-full max-w-md">
            <div className="mx-auto mb-4 rounded-full bg-gray-700 w-24 h-24 sm:w-32 sm:h-32" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block rounded-lg bg-white px-5 py-3 font-bold text-xl sm:text-2xl text-black"
            >
              {bidAmount}
            </motion.div>
          </div>

          {/* MOBILE ONLY: Player Details and Bid Team Info side-by-side */}
          <div className="md:hidden w-full max-w-md grid grid-cols-2 gap-3">
            {/* Player Details Card */}
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
              <h2 className="font-bold text-sm truncate">{sampleAuction.currentLot.name}</h2>
              <p className="text-xs">{sampleAuction.currentLot.role}</p>
              <p className="mt-1 text-[10px]">Bat: {sampleAuction.currentLot.batting}</p>
              <p className="text-[10px]">Ball: {sampleAuction.currentLot.bowling}</p>
              <p className="mt-1 text-xs font-semibold">
                Base: {sampleAuction.currentLot.basePrice}
              </p>
            </div>
            
            {/* Bid Team Info Card */}
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center flex flex-col justify-center">
              <img
                src={sampleAuction.currentBid.teamLogo}
                alt="team logo"
                className="mx-auto mb-1 h-8"
              />
              <p className="text-[10px]">Bid By</p>
              <h3 className="text-xs font-semibold truncate">
                {sampleAuction.currentBid.team}
              </h3>
            </div>
          </div>
          
          <button
            onClick={onSell}
            className="w-32 px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-xs sm:text-sm"
          >
            Sell
          </button>
        </div>

        {/* === Right Sidebar (desktop only) === */}
        <div className="hidden md:flex space-y-4 md:col-span-1 md:h-full md:flex-col md:justify-between">
          <div className='space-y-1'>
            {status === 'live' ? (
              <button
                onClick={onStopBidding}
                className="w-full px-4 py-2 bg-red-500 rounded hover:bg-red-600 text-xs sm:text-sm"
              >
                Stop Bidding
              </button>
            ) : (
              <button
                onClick={onResumeBidding}
                className="w-full px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-xs sm:text-sm"
              >
                Resume Bidding
              </button>
            )}
            
            <button
              onClick={onMoveToUnsell}
              className="w-full px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 text-xs sm:text-sm"
            >
              Move to Unsell
            </button>
            <button
              onClick={onPauseAuction}
              className="w-full px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 text-xs sm:text-sm"
            >
              Pause Auction
            </button>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
            <img
              src={sampleAuction.currentBid.teamLogo}
              alt="team logo"
              className="mx-auto mb-2 h-12 sm:h-16"
            />
            <p className="text-xs sm:text-sm">Bid By</p>
            <h3 className="text-sm sm:text-base font-semibold">
              {sampleAuction.currentBid.team}
            </h3>
          </div>
        </div>
      </div>

      {/* === Mobile-only Bottom Section === */}
      <div className="md:hidden mt-4 space-y-4">
        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2">
          {status === 'live' ? (
            <button
              onClick={onStopBidding}
              className="w-full px-3 py-2 bg-red-500 rounded hover:bg-red-600 text-xs"
            >
              Stop Bidding
            </button>
          ) : (
            <button
              onClick={onResumeBidding}
              className="w-full px-3 py-2 bg-green-500 rounded hover:bg-green-600 text-xs"
            >
              Resume Bidding
            </button>
          )}
          
          <button
            onClick={onMoveToUnsell}
            className="w-full px-3 py-2 bg-purple-600 rounded hover:bg-purple-700 text-xs"
          >
            Move to Unsell
          </button>
          <button
            onClick={onPauseAuction}
            className="w-full px-3 py-2 bg-yellow-600 rounded hover:bg-yellow-700 text-xs"
          >
            Pause Auction
          </button>
        </div>

        {/* Last Sold & Most Expensive (Mobile) */}
        <div className="flex gap-2">
          {[['Last Sold', sampleAuction.lastSold], ['Most Expensive', sampleAuction.mostExpensive]].map(
            ([title, info]) => (
              <div key={title} className="flex-1 bg-white bg-opacity-10 rounded p-2 text-xs">
                <h4 className="uppercase text-[10px] font-medium">{title}</h4>
                <p className="font-semibold text-xs truncate">{info.name}</p>
                <p className="text-[10px]">{info.price} — {info.team}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* --- Edit Bid Modal --- */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 text-black">
            <h2 className="text-lg font-bold">Edit Bid</h2>
            <input
              type="text"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                onClick={onApplyBid}
                className="flex-1 rounded bg-green-500 px-4 py-2 hover:bg-green-600 text-sm"
              >
                Apply
              </button>
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 rounded bg-red-500 px-4 py-2 hover:bg-red-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}