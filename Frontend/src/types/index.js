// User roles as constants (optional)
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Example user object shape (for reference)
export const exampleUser = {
  id: '',
  username: '',
  email: '',
  avatar: '',      // optional
  role: USER_ROLES.USER,
};

// Auction statuses
export const AUCTION_STATUS = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  COMPLETED: 'completed',
};

// Example auction object
export const exampleAuction = {
  id: '',
  name: '',
  shortName: '',
  logo: '',       // optional
  startTime: new Date(),
  endTime: new Date(),
  joinCode: '',
  status: AUCTION_STATUS.UPCOMING,
  createdBy: '',
};

// Player roles
export const PLAYER_ROLES = {
  BATSMAN: 'batsman',
  BOWLER: 'bowler',
  ALL_ROUNDER: 'all-rounder',
  WICKET_KEEPER: 'wicket-keeper',
};

// Example player object
export const examplePlayer = {
  id: '',
  name: '',
  role: PLAYER_ROLES.BATSMAN,
  basePrice: 0,
  avatar: '',   // optional
  stats: {      // optional
    matches: 0,
    runs: 0,
    wickets: 0,
    average: 0,
    strikeRate: 0,
    economyRate: 0,
  },
  teamId: '',     // optional
  soldAmount: 0,  // optional
};

// Example team object
export const exampleTeam = {
  id: '',
  name: '',
  shortName: '',
  logo: '',          // optional
  ownerName: '',
  purse: 0,
  auctionId: '',
  players: [],       // array of player ids
};

// Example bid object
export const exampleBid = {
  id: '',
  auctionId: '',
  playerId: '',
  teamId: '',
  amount: 0,
  timestamp: new Date(),
};

// Example auth state
export const exampleAuthState = {
  user: null,             // or exampleUser
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Example auction state
export const exampleAuctionState = {
  auctions: [],           // array of auctions
  currentAuction: null,   // or exampleAuction
  isLoading: false,
  error: null,
};

// Example player state
export const examplePlayerState = {
  players: [],            // array of players
  currentPlayer: null,    // or examplePlayer
  isLoading: false,
  error: null,
};

// Example team state
export const exampleTeamState = {
  teams: [],              // array of teams
  currentTeam: null,      // or exampleTeam
  isLoading: false,
  error: null,
};

// Example bid state
export const exampleBidState = {
  bids: [],               // array of bids
  currentBid: null,       // or exampleBid
  isLoading: false,
  error: null,
};
