import React from 'react';
import { Users, TrendingUp, Briefcase, Clock, PlusCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import { usePlayer } from '../context/PlayerContext';
import { useTeam } from '../context/TeamContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { auctions } = useAuction();
  const { players } = usePlayer();
  const { teams } = useTeam();
  const isAdmin = user?.role === 'admin';
  
  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');
  const liveAuctions = auctions.filter(a => a.status === 'live');
  
  const statsCards = [
    {
      title: 'Total Auctions',
      value: auctions.length,
      icon: <TrendingUp className="h-6 w-6 text-primary-500" />,
      color: 'bg-primary-50',
      href: '#auctions',
    },
    {
      title: 'Total Players',
      value: players.length,
      icon: <Users className="h-6 w-6 text-accent-500" />,
      color: 'bg-accent-50',
      href: '#players',
    },
    {
      title: 'Total Teams',
      value: teams.length,
      icon: <Briefcase className="h-6 w-6 text-success-500" />,
      color: 'bg-success-50',
      href: '#teams',
    },
  ];

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {isAdmin && (
  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 max-md:hidden">
    <Button
      variant="primary"
      leftIcon={<PlusCircle className="h-4 w-4" />}
      onClick={() => window.location.href = '/create-auction'}
    >
      Create Auction
    </Button>
    <Button className=''
      variant="primary"
      leftIcon={<Users className="h-4 w-4" />}
      onClick={() => window.location.href = '/add-players'}
    >
      Add Players
    </Button>
    <Button className=''
      variant="primary"
      leftIcon={<Briefcase className="h-4 w-4" />}
      onClick={() => window.location.href = '/create-team'}
    >
      Create Team
    </Button>
  </div>
)}

      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = stat.href}>
            <CardContent className="flex items-center p-6">
              <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Live Auctions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Auctions</h2>
        
        {liveAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveAuctions.map((auction) => (
              <Card key={auction.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{auction.name}</h3>
                  <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    Live
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Ends {new Date(auction.endTime).toLocaleString()}</span>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => window.location.href = `#auction/${auction.id}`}
                  >
                    Join Auction
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-4">
                <TrendingUp className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Live Auctions</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  There are no auctions currently in progress.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Upcoming Auctions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Auctions</h2>
        
        {upcomingAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction) => (
              <Card key={auction.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{auction.name}</h3>
                  <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                    Upcoming
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Starts {new Date(auction.startTime).toLocaleString()}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    fullWidth
                    onClick={() => window.location.href = `#auction/${auction.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-4">
                <Clock className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Upcoming Auctions</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  There are no upcoming auctions scheduled.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
