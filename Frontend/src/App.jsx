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

import "./App.css";
import SetPassword from "./pages/set-Password/SetPassword";
import { Toaster } from "react-hot-toast";

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
      <Routes>
        <Route
          path="/"
          element={<AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />}
        />
        <Route path="/set-password" element={<SetPassword/>} />
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
