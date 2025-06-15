// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import SplashScreen from "./components/splashScreen";
import AuthPage from "./pages/authentication/AuthPage";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CreateAuction from "./pages/CreateAuction";
import CreateTeam from "./pages/team/CreateTeam";
import AddPlayer from "./pages/player/AddPlayer";
import AuctionsInfo from "./pages/auctions/AuctionsInfo";
import TeamsInfo from "./pages/team/TeamsInfo";
import PlayersInfo from "./pages/player/PlayersInfo";
import AdminMyAuctionInfo from "./pages/auctions/AdminMyAuctionInfo";
import AddTempAdmin from "./pages/adminPages/AddTempAdmin";
import AdminProfilePage from "./pages/profile/AdminProfilePage";
// import ViewPlayer from "./pages/player/ViewPlayer";
import "./App.css";
import SetPassword from "./pages/set-Password/SetPassword";
import { Toaster } from "react-hot-toast";
import ViewPlayer from "./pages/player/ViewPlayer";
import EditPlayer from "./pages/player/EditPlayer";
import ViewTeam from "./pages/team/ViewTeam";
import EditTeam from "./pages/team/EditTeam";
import AutoLogout from "./AutoLogout";
import AdminBiddingDashboard from "./pages/bidding/AdminBiddingDashboard";
import ManualPlayerSelection from "./pages/bidding/ManualPlayerSelection";
import BiddingPlayerList from "./pages/bidding/BiddingPlayerList";
import AdminBiddingTeamsList from "./pages/bidding/AdminBiddingTeamsList";
import AdminBiddingTeamView from "./pages/bidding/AdminBiddingTeamView";
// import UserBiddngPortalDesktop from "./pages/userBidding/UserBiddngPortalDesktop";
// import UserBiddingDashboardMobile from "./pages/userBidding/UserBiddingPortalMobile";
import UserBiddingRoute from "./pages/userBidding/UserBiddingRoute";
import UserBiddingCharSelection from "./pages/userBidding/UserBiddingCharSelection";
import UserBiddingPlayerList from "./pages/userBidding/UserBiddingPlayerList";
import UserBiddingPlayerView from "./pages/userBidding/UserBiddingPlayerView";
function ProtectedLayout({ isAuthenticated }) {
  if (!isAuthenticated) return <AuthPage />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(
    sessionStorage.getItem("splashShown") !== "true"
  );

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuth(); // Run initially
    window.addEventListener("storage", checkAuth); // Optional: for multi-tab sync
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("splashShown", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) return <SplashScreen />;

  return (
    <Router>
      <Toaster position="top-right" />
      <AutoLogout/>
      <Routes>
        <Route
          path="/"
          element={<AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />}
        />
        <Route path="/set-password" element={<SetPassword/>} />
        {/* <Route path="/user-bidding-portal" element={<UserBiddngPortalDesktop/>} /> */}
        {/* <Route path="/user-bidding-portal" element={<UserBiddingDashboardMobile/>} /> */}
        <Route path="/user-bidding-portal/:id" element={<UserBiddingRoute />}/>
        <Route path="/user-char-selection/:id" element={<UserBiddingCharSelection/>}/>
        <Route
          path="/user-bidding-portal/:id/players"
          element={<UserBiddingPlayerList />}
        />
        <Route
          path="/user-bidding-portal/:id/players/:playerId"
          element={<UserBiddingPlayerView />}
        />




        <Route path="/user-bidding-portal/user-bidding-player-list/:id" element={<UserBiddingPlayerList />} />
        <Route path="/user-bidding-portal/user-bidding-player-view/:id" element={<UserBiddingPlayerView />} />
        <Route element={<ProtectedLayout isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/add-temp-admin" element={<AddTempAdmin />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/add-players" element={<AddPlayer />} />
          <Route path="/admin-auction-info" element={<AuctionsInfo />} />
          <Route path="/admins-my-auction-info" element={<AdminMyAuctionInfo />} />
          <Route path="/admin-teams-info" element={<TeamsInfo />} />
          <Route path="/admin-players-info" element={<PlayersInfo />} />
          <Route path="/admin-profile" element={<AdminProfilePage />} />
          <Route path="/admin/player/:id" element={<ViewPlayer />} />
          <Route path="/admin/player/:id/edit" element={<EditPlayer />} />
          <Route path="/admin/teams/:id" element={<ViewTeam />} />
          <Route path="/admin/teams/:id/edit" element={<EditTeam />} />
          <Route path="/admin/admin-bidding-dashboard/:id" element={<AdminBiddingDashboard />} />
          <Route path="/admin/admin-manual-player-selection/:id" element={<ManualPlayerSelection />} />
          <Route path="/admin/bidding-teams-list/:id" element={<AdminBiddingTeamsList />} />
          <Route path="/admin/bidding-teams-view/:id/:teamId" element={<AdminBiddingTeamView />} />
          <Route path="/bidding/players-list/:id" element={<BiddingPlayerList/>} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;