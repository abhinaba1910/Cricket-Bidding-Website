import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuction } from './AuctionContext';

const PlayerContext = createContext(undefined);

// Mock players for demo purposes
const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'Virat Kohli',
    role: 'batsman',
    basePrice: 2000000,
    avatar: 'https://example.com/virat.jpg',
    stats: {
      matches: 200,
      runs: 6000,
      average: 50.5,
      strikeRate: 140.2,
    },
  },
  {
    id: '2',
    name: 'Jasprit Bumrah',
    role: 'bowler',
    basePrice: 1500000,
    avatar: 'https://example.com/bumrah.jpg',
    stats: {
      matches: 120,
      wickets: 130,
      economyRate: 6.7,
    },
  },
  {
    id: '3',
    name: 'Ben Stokes',
    role: 'all-rounder',
    basePrice: 1800000,
    avatar: 'https://example.com/stokes.jpg',
    stats: {
      matches: 110,
      runs: 2500,
      wickets: 90,
      average: 35.6,
      strikeRate: 145.3,
      economyRate: 8.2,
    },
  },
  {
    id: '4',
    name: 'MS Dhoni',
    role: 'wicket-keeper',
    basePrice: 1700000,
    avatar: 'https://example.com/dhoni.jpg',
    stats: {
      matches: 220,
      runs: 4000,
      average: 40.5,
      strikeRate: 150.3,
    },
  },
];

export const PlayerProvider = ({ children }) => {
  const { currentAuction } = useAuction();
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, we would filter based on auction
        setPlayers(MOCK_PLAYERS);
      } catch (err) {
        setError('Failed to fetch players');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [currentAuction]);

  const createPlayer = async (playerData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPlayer = {
        ...playerData,
        id: `${players.length + 1}`,
      };
      
      setPlayers(prev => [...prev, newPlayer]);
      setCurrentPlayer(newPlayer);
    } catch (err) {
      setError('Failed to create player');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlayer = async (id, playerData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlayers(prev => 
        prev.map(player => 
          player.id === id ? { ...player, ...playerData } : player
        )
      );
      
      if (currentPlayer?.id === id) {
        setCurrentPlayer(prev => prev ? { ...prev, ...playerData } : null);
      }
    } catch (err) {
      setError('Failed to update player');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlayer = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlayers(prev => prev.filter(player => player.id !== id));
      
      if (currentPlayer?.id === id) {
        setCurrentPlayer(null);
      }
    } catch (err) {
      setError('Failed to delete player');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlayersByAuction = (auctionId) => {
    // In a real app, we would filter players based on the auction
    return players;
  };

  return (
    <PlayerContext.Provider
      value={{
        players,
        currentPlayer,
        isLoading,
        error,
        createPlayer,
        updatePlayer,
        deletePlayer,
        setCurrentPlayer,
        filterPlayersByAuction,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
