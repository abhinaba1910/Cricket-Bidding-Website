import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Briefcase, Clock, PlusCircle } from "lucide-react";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import MobileStickyNav from "../components/layout/MobileStickyNav";
import Api from "../userManagement/Api";



const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [playersCount, setPlayersCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await Api.get("/dashboard-stats");
      setPlayersCount(res.data.totalPlayers);
      setTeamsCount(res.data.totalTeams);
      setAuctions(res.data.auctions);
      console.log(res.data.auctions);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchStats(); // Initial fetch

    const interval = setInterval(() => {
      fetchStats(); // Poll every 30 seconds
    }, 30000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const isAdmin = user?.role === "admin";
  const isTempAdmin = user?.role === "temp-admin";

  const upcomingAuctions = auctions.filter((a) => a.status === "upcoming");
  const liveAuctions = auctions.filter((a) => a.status === "live");

  const statsCards = [
    {
      title: "Total Auctions",
      value: auctions.length,
      icon: <TrendingUp className="h-6 w-6 text-primary-500" />,
      color: "bg-primary-50",
      href: "#auctions",
    },
    {
      title: "Total Players",
      value: playersCount,
      icon: <Users className="h-6 w-6 text-accent-500" />,
      color: "bg-accent-50",
      href: "#players",
    },
    {
      title: "Total Teams",
      value: teamsCount,
      icon: <Briefcase className="h-6 w-6 text-success-500" />,
      color: "bg-success-50",
      href: "#teams",
    },
  ];

  const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-md:pb-14">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {(isAdmin || isTempAdmin) && (
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 max-md:hidden">
            {isAdmin && (
              <Button
                variant="primary"
                leftIcon={<PlusCircle className="h-4 w-4" />}
                onClick={() => (window.location.href = "/add-temp-admin")}
              >
                Add Temp Admin
              </Button>
            )}
            <Button
              variant="primary"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              onClick={() => (window.location.href = "/create-auction")}
            >
              Create Auction
            </Button>
            <Button
              variant="primary"
              leftIcon={<Users className="h-4 w-4" />}
              onClick={() => (window.location.href = "/add-players")}
            >
              Add Players
            </Button>
            <Button
              variant="primary"
              leftIcon={<Briefcase className="h-4 w-4" />}
              onClick={() => (window.location.href = "/create-team")}
            >
              Create Team
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-md transition-shadow duration-200"
            onClick={() => (window.location.href = stat.href)}
          >
            <CardContent className="flex items-center p-6">
              <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Auctions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Live Auctions
        </h2>
        {liveAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveAuctions.map((auction) => (
              <Card
                key={auction.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {auction.name}
                  </h3>
                  <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    Live
                  </div>
                </CardHeader>
                <CardContent>
                  {auction.countdownRemaining > 0 && (
                    <div className="text-sm text-gray-500 mb-4">
                      ⏳ Ends in {formatCountdown(auction.countdownRemaining)}
                    </div>
                  )}
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() =>
                      (window.location.href = `#auction/${auction.id}`)
                    }
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
                <h3 className="text-lg font-medium text-gray-900">
                  No Live Auctions
                </h3>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Auctions
        </h2>
        {upcomingAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction) => (
              <Card
                key={auction.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {auction.name}
                  </h3>
                  <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                    Upcoming
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-2">
                    🕒 Starts at: {formatTime12Hour(auction.time)} on{" "}
                    {auction.date}
                  </div>

                  {auction.countdownRemaining > 0 && (
                    <div className="text-sm text-yellow-600 mb-4">
                      ⏳ Countdown:{" "}
                      {formatCountdown(auction.countdownRemaining)}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() =>
                      (window.location.href = `#auction/${auction.id}`)
                    }
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
                <h3 className="text-lg font-medium text-gray-900">
                  No Upcoming Auctions
                </h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  There are no upcoming auctions scheduled.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileStickyNav />
    </div>
  );
};

export default Dashboard;
