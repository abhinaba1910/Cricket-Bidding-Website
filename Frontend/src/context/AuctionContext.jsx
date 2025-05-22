import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Mock auctions for demo purposes
const MOCK_AUCTIONS = [
  {
    id: '1',
    name: 'IPL Super Auction 2025',
    shortName: 'IPL 2025',
    logo: 'https://example.com/ipl-logo.png',
    startTime: new Date('2025-01-15T10:00:00Z'),
    endTime: new Date('2025-01-16T18:00:00Z'),
    joinCode: 'IPL2025',
    status: 'upcoming',
    createdBy: '1',
  },
  {
    id: '2',
    name: 'Cricket Champions Auction',
    shortName: 'CCA 2024',
    logo: 'https://example.com/cca-logo.png',
    startTime: new Date('2024-12-05T09:00:00Z'),
    endTime: new Date('2024-12-05T17:00:00Z'),
    joinCode: 'CCA2024',
    status: 'upcoming',
    createdBy: '1',
  },
];

const AuctionContext = createContext(undefined);

export const AuctionProvider = ({ children }) => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setAuctions(MOCK_AUCTIONS);
      } catch (err) {
        setError('Failed to fetch auctions');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, [user]);

  const createAuction = async (auctionData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to create an auction');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAuction = {
        ...auctionData,
        id: `${auctions.length + 1}`,
        createdBy: user.id,
      };

      setAuctions(prev => [...prev, newAuction]);
      setCurrentAuction(newAuction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create auction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAuction = async (id, auctionData) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAuctions(prev =>
        prev.map(auction =>
          auction.id === id ? { ...auction, ...auctionData } : auction
        )
      );

      if (currentAuction?.id === id) {
        setCurrentAuction(prev => prev ? { ...prev, ...auctionData } : null);
      }
    } catch (err) {
      setError('Failed to update auction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAuction = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAuctions(prev => prev.filter(auction => auction.id !== id));

      if (currentAuction?.id === id) {
        setCurrentAuction(null);
      }
    } catch (err) {
      setError('Failed to delete auction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const joinAuctionByCode = async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const auction = auctions.find(a => a.joinCode === code);

      if (!auction) {
        throw new Error('Invalid auction code');
      }

      setCurrentAuction(auction);
      return auction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join auction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        auctions,
        currentAuction,
        isLoading,
        error,
        createAuction,
        updateAuction,
        deleteAuction,
        setCurrentAuction,
        joinAuctionByCode,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
