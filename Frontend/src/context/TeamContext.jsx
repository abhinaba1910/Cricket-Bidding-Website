import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuction } from './AuctionContext';

const TeamContext = createContext(undefined);

// Mock teams for demo purposes
const MOCK_TEAMS = [
  {
    id: '1',
    name: 'Mumbai Indians',
    shortName: 'MI',
    logo: 'https://example.com/mi-logo.png',
    ownerName: 'Reliance Industries',
    purse: 9000000,
    auctionId: '1',
    players: [],
  },
  {
    id: '2',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    logo: 'https://example.com/csk-logo.png',
    ownerName: 'India Cements',
    purse: 8500000,
    auctionId: '1',
    players: [],
  },
  {
    id: '3',
    name: 'Royal Challengers Bangalore',
    shortName: 'RCB',
    logo: 'https://example.com/rcb-logo.png',
    ownerName: 'United Spirits',
    purse: 7800000,
    auctionId: '1',
    players: [],
  },
  {
    id: '4',
    name: 'Delhi Capitals',
    shortName: 'DC',
    logo: 'https://example.com/dc-logo.png',
    ownerName: 'JSW Group',
    purse: 8900000,
    auctionId: '1',
    players: [],
  },
];

export const TeamProvider = ({ children }) => {
  const { currentAuction } = useAuction();
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (currentAuction) {
          // Filter teams by auction in a real app
          const filteredTeams = MOCK_TEAMS.filter(
            team => team.auctionId === currentAuction.id
          );
          setTeams(filteredTeams);
        } else {
          setTeams(MOCK_TEAMS);
        }
      } catch (err) {
        setError('Failed to fetch teams');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [currentAuction]);

  const createTeam = async (teamData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTeam = {
        ...teamData,
        id: `${teams.length + 1}`,
      };
      
      setTeams(prev => [...prev, newTeam]);
      setCurrentTeam(newTeam);
    } catch (err) {
      setError('Failed to create team');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeam = async (id, teamData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTeams(prev => 
        prev.map(team => 
          team.id === id ? { ...team, ...teamData } : team
        )
      );
      
      if (currentTeam?.id === id) {
        setCurrentTeam(prev => prev ? { ...prev, ...teamData } : null);
      }
    } catch (err) {
      setError('Failed to update team');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTeams(prev => prev.filter(team => team.id !== id));
      
      if (currentTeam?.id === id) {
        setCurrentTeam(null);
      }
    } catch (err) {
      setError('Failed to delete team');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const filterTeamsByAuction = (auctionId) => {
    return teams.filter(team => team.auctionId === auctionId);
  };

  const addPlayerToTeam = async (teamId, playerId, amount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTeams(prev => 
        prev.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              players: [...team.players, playerId],
              purse: team.purse - amount,
            };
          }
          return team;
        })
      );
    } catch (err) {
      setError('Failed to add player to team');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeam,
        isLoading,
        error,
        createTeam,
        updateTeam,
        deleteTeam,
        setCurrentTeam,
        filterTeamsByAuction,
        addPlayerToTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
