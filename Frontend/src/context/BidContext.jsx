import React, { createContext, useContext, useState } from 'react';
import { useAuction } from './AuctionContext';
import { usePlayer } from './PlayerContext';
import { useTeam } from './TeamContext';

const BidContext = createContext(undefined);

export const BidProvider = ({ children }) => {
  const { currentAuction } = useAuction();
  const { updatePlayer } = usePlayer();
  const { addPlayerToTeam } = useTeam();

  const [bids, setBids] = useState([]);
  const [currentBid, setCurrentBid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const placeBid = async (teamId, playerId, amount) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!currentAuction) {
        throw new Error('No active auction');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newBid = {
        id: `bid_${Date.now()}`,
        auctionId: currentAuction.id,
        playerId,
        teamId,
        amount,
        timestamp: new Date(),
      };

      setBids(prev => [...prev, newBid]);
      setCurrentBid(newBid);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentBidsForPlayer = (playerId) => {
    if (!currentAuction) return [];
    return bids.filter(
      bid => bid.playerId === playerId && bid.auctionId === currentAuction.id
    );
  };

  const getHighestBidForPlayer = (playerId) => {
    const playerBids = getCurrentBidsForPlayer(playerId);
    if (playerBids.length === 0) return null;

    return playerBids.reduce((highest, current) =>
      current.amount > highest.amount ? current : highest
    );
  };

  const resetBidsForPlayer = (playerId) => {
    if (!currentAuction) return;

    setBids(prev =>
      prev.filter(bid => !(bid.playerId === playerId && bid.auctionId === currentAuction.id))
    );

    if (currentBid?.playerId === playerId) {
      setCurrentBid(null);
    }
  };

  const finalizeBid = async (playerId) => {
    const highestBid = getHighestBidForPlayer(playerId);
    if (!highestBid) return;

    try {
      await updatePlayer(playerId, {
        teamId: highestBid.teamId,
        soldAmount: highestBid.amount,
      });

      await addPlayerToTeam(highestBid.teamId, playerId, highestBid.amount);

      resetBidsForPlayer(playerId);
    } catch (err) {
      setError('Failed to finalize bid');
    }
  };

  return (
    <BidContext.Provider
      value={{
        bids,
        currentBid,
        isLoading,
        error,
        placeBid,
        getCurrentBidsForPlayer,
        getHighestBidForPlayer,
        resetBidsForPlayer,
      }}
    >
      {children}
    </BidContext.Provider>
  );
};

export const useBid = () => {
  const context = useContext(BidContext);
  if (context === undefined) {
    throw new Error('useBid must be used within a BidProvider');
  }
  return context;
};
