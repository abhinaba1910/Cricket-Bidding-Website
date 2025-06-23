import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Api from "../../userManagement/Api";
import RTMApprovalPopup from "./RTMApprovalPopup";

const SAMPLE_AUCTION = {
  lastSold: { name: "--/--", price: "--/--", team: "--/--" },
  mostExpensive: { name: "--/--", price: "--/--", team: "--/--" },
  currentLot: {
    id: "--/--",
    name: "--/--",
    role: "--/--",
    batting: "--/--",
    bowling: "--/--",
    basePrice: "--/--",
    avatarUrl: null,
  },
  currentBid: {
    amount: "--/--",
    team: "--/--",
    teamLogo: "--/--",
  },
};

export default function AdminBiddingDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const incoming = location.state?.selectedPlayers || [];
  const socketRef = useRef(null);
  const { id } = useParams(); // auctionId

  // STATE
  const [auctionData, setAuctionData] = useState(SAMPLE_AUCTION);
  const [status, setStatus] = useState("live"); // may be updated from fetchAuctionData
  const [showEdit, setShowEdit] = useState(false);
  const [bidAmount, setBidAmount] = useState(SAMPLE_AUCTION.currentBid.amount);
  const [fullScreen, setFullScreen] = useState(false);
  const [selectionMode, setSelectionMode] = useState("automatic");
  const [role, setRole] = useState("Batsman");
  const [biddingStarted, setBiddingStarted] = useState(false);
  const [automaticFilter, setAutomaticFilter] = useState("All");
  const [manualPlayerQueue, setManualPlayerQueue] = useState([]);
  const [currentQueuePosition, setCurrentQueuePosition] = useState(0);
  const [canChangeMode, setCanChangeMode] = useState(true);

  const [playerPic, setPlayerPic] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);

  const [showStartPopup, setShowStartPopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [popupSelection, setPopupSelection] = useState("automatic");
  const [showAddMorePlayers, setShowAddMorePlayers] = useState(false);
  const [queueDisplay, setQueueDisplay] = useState({ current: 0, total: 0 });
  const lastBidTeamRef = useRef(null); // holds previous team name
  const [showRTMPopup, setShowRTMPopup] = useState(false);
  const [pendingRTMRequest, setPendingRTMRequest] = useState(null);
  const [isProcessingRTM, setIsProcessingRTM] = useState(false);

  // -------------------------------
  // SOCKET.IO: connect, join room, listeners
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found. Cannot connect socket.");
      return;
    }
    const SOCKET_SERVER_URL = "https://cricket-bidding-website-backend.onrender.com"; // ← replace with your real URL
    // const SOCKET_SERVER_URL = "http://localhost:6001";
    const socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ["websocket"], // enforce WS transport for reliability
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (id) {
        socket.emit("join-auction", id);
        console.log(`Joined auction room ${id}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // ── CATCH THE OTHER BID EVENT (some routes emit “bid:updated”) ──
    socket.on("bid:updated", (payload) => {
      console.log("Received bid:updated", payload);
      // update your current bid amount
      setAuctionData((prev) => ({
        ...prev,
        currentBid: {
          amount: prev.newBidAmount,
          team: prev.currentBid.team,
          teamLogo: prev.currentBid.teamLogo,
        },
      }));
      setBidAmount(payload.newBidAmount);
      toast.success(`Bid updated: ₹${payload.newBidAmount.toLocaleString()}`);
    });

    // 1. Bidding started
    socket.on("bidding:started", (payload) => {
      console.log("Received bidding:started", payload);
      const {
        currentPlayer,
        selectionMode: newMode,
        automaticFilter: newFilter,
      } = payload;
      if (currentPlayer) {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: currentPlayer._id,
            name: currentPlayer.name,
            role: currentPlayer.role,
            batting: currentPlayer.battingStyle,
            bowling: currentPlayer.bowlingStyle,
            basePrice: currentPlayer.basePrice,
            avatarUrl: currentPlayer.photo,
          },
          currentBid: {
            amount: currentPlayer.basePrice || 0,
            team: null,
            teamLogo: null,
          },
        }));
        setBidAmount(currentPlayer.basePrice || 0);
        setBiddingStarted(true);
      }
      if (newMode) setSelectionMode(newMode);
      if (newFilter) setAutomaticFilter(newFilter);
      fetchQueueStatus();
      fetchPlayerPic();
    });

    // 2. Bid placed
    socket.on("bid:placed", (data) => {
      console.log("Received bid:placed", data);
      const { newBid } = data;
      if (newBid) {
        setAuctionData((prev) => ({
          ...prev,
          currentBid: {
            amount: newBid.amount,
            team: newBid.team,
            teamLogo: newBid.teamLogo,
          },
        }));
        setShowEdit(true);
        setBidAmount(newBid.amount);
        toast.success(`New bid: ₹${newBid.amount.toLocaleString()}`);
      }
    });

    // 3. Player sold
    socket.on("player:sold", (payload) => {
      console.log("Received player:sold", payload);
      const {
        nextPlayer,
        amount,
        currentQueuePosition: newPos,
        totalQueueLength,
        isPaused: pausedFlag,
      } = payload;
      toast.success(`Player sold for ₹${amount.toLocaleString()}`);
      setIsPaused(pausedFlag);
      if (nextPlayer) {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: nextPlayer._id,
            name: nextPlayer.name,
            role: nextPlayer.role,
            batting: nextPlayer.battingStyle,
            bowling: nextPlayer.bowlingStyle,
            basePrice: nextPlayer.basePrice,
            avatarUrl: nextPlayer.photo,
          },
          currentBid: {
            amount: nextPlayer.basePrice || 0,
            team: null,
            teamLogo: null,
          },
        }));
        setBidAmount(nextPlayer.basePrice || 0);
        setCurrentQueuePosition(newPos);
        setQueueDisplay({
          current: newPos + 1,
          total: totalQueueLength,
        });
      } else {
        // Ended
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: "--/--",
            name: "No more players",
            role: "--/--",
            batting: "--/--",
            bowling: "--/--",
            basePrice: 0,
            avatarUrl: null,
          },
          currentBid: {
            amount: 0,
            team: null,
            teamLogo: null,
          },
        }));
        setBiddingStarted(false);
        setStatus("completed");
        setCanChangeMode(true);
      }
      fetchAuctionData();
      fetchQueueStatus();
      fetchPlayerPic();
    });

    // 4. Auction paused
    socket.on("auction:paused", (payload) => {
      console.log("Received auction:paused", payload);
      toast.success("Auction paused");
      setIsPaused(true);
      setBiddingStarted(false);
      setPlayerPic(null);
    });
    // 5. Auction resumed
    socket.on("auction:resumed", (payload) => {
      console.log("Received auction:resumed", payload);
      toast.success("Auction resumed");
      setIsPaused(false);
    });
    // 6. Pending pause
    socket.on("auction:pause-pending", (payload) => {
      console.log("Received auction:pause-pending", payload);
      toast.success("Auction will pause after current player is sold");
    });
    // 7. Auction ended
    socket.on("auction:ended", (payload) => {
      console.log("Received auction:ended", payload);
      toast.success("Auction ended");
      setStatus("completed");
      setBiddingStarted(false);
      setIsPaused(true);
    });

    // 8. Player unsold
    socket.on("player:unsold", (payload) => {
      console.log("Received player:unsold", payload);
      toast.success("Player marked as Unsold, moving to next");
      const {
        nextPlayer,
        currentQueuePosition: newPos,
        totalQueueLength,
        isPaused: pausedFlag,
      } = payload;
      setIsPaused(pausedFlag);
      if (nextPlayer) {
        fetchAuctionData();
      } else {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: "--/--",
            name: "No more players",
            role: "--/--",
            batting: "--/--",
            bowling: "--/--",
            basePrice: 0,
            avatarUrl: null,
          },
          currentBid: {
            amount: 0,
            team: null,
            teamLogo: null,
          },
        }));
        // setBiddingStarted(false);
        // setStatus("completed");
      }
      setCurrentQueuePosition(newPos);
      setQueueDisplay({
        current: newPos + 1,
        total: totalQueueLength,
      });
      fetchQueueStatus();
      fetchPlayerPic();
    });

    // 9. Team joined
    socket.on("team:joined", (payload) => {
      console.log("Received team:joined", payload);
      toast.success("A manager joined the auction");
      // Optionally refetch teams
    });

    // 10. RTM used
    // socket.on("player:rtm", (payload) => {
    //   console.log("Received player:rtm", payload);
    //   toast.success("RTM used: player transferred");
    //   fetchAuctionData();
    // });

    socket.on("player:rtm", (payload) => {
      console.log("Received player:rtm", payload);
      toast.success("RTM used: player transferred");
      fetchAuctionData();
    });

    // NEW: Listen for RTM requests (for admin approval)
    // ✅ Only show popup on new socket event
    socket.on("rtm:request", (payload) => {
      console.log("Received RTM request", payload);
      setPendingRTMRequest(payload);
      setShowRTMPopup(true); // 👈 Show only here
      toast.success(
        `RTM request from ${payload.teamName} for ${payload.playerName}`
      );
    });

    // RTM approved - clear the request
    socket.on("rtm:approved", (payload) => {
      console.log("RTM approved", payload);
      setShowRTMPopup(false);
      setPendingRTMRequest(null); // ✅ Clear here
      setIsProcessingRTM(false);
      toast.success(`RTM approved: ${payload.playerName} transferred`);
      fetchAuctionData();
    });

    // RTM rejected - clear the request
    socket.on("rtm:rejected", (payload) => {
      console.log("RTM rejected", payload);
      setShowRTMPopup(false);
      setPendingRTMRequest(null); // ✅ Clear here
      setIsProcessingRTM(false);
      toast.success(`RTM rejected for ${payload.playerName}`);
    });
    // 11. Selection-mode updated
    socket.on("selection-mode:updated", (payload) => {
      console.log("Received selection-mode:updated", payload);
      const { selectionMode: newMode, automaticFilter: newFilter } = payload;
      setSelectionMode(newMode);
      if (newFilter) setAutomaticFilter(newFilter);
      fetchQueueStatus();
    });

    // 12. Queue updated
    socket.on("queue:updated", (payload) => {
      console.log("Received queue:updated", payload);
      const { manualPlayerQueue: newQueue, currentQueuePosition: newPos } =
        payload;
      setManualPlayerQueue(newQueue);
      setCurrentQueuePosition(newPos);
      setQueueDisplay({
        current: newPos + 1,
        total: newQueue.length,
      });
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-auction", id); // always leave room
        socketRef.current.disconnect();
      }
      socket.off("player:rtm");
      socket.off("rtm:request");
      socket.off("rtm:approved");
      socket.off("rtm:rejected");
    };
  }, [id]);

  // Initial fetch once
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchAuctionData();
    fetchQueueStatus();
    fetchPlayerPic();
  }, [id]);

  // -------------------------------
  // Helper functions and handlers
  // -------------------------------

  // near the top of AdminBiddingDashboard, alongside other handlers:
  const handleStartBidding = async () => {
    // show popup to choose manual/automatic
    setShowStartPopup(true);

    try {
      // In case auction was paused, resume it:
      await Api.patch(`/pause-auction/${id}`, {
        isPaused: false,
      });
      setIsPaused(false);
    } catch (error) {
      console.error("Error starting bidding:", error);
      alert("Internal server error");
    }
  };

  const handleRTMApprove = async () => {
    setIsProcessingRTM(true);
    try {
      await Api.post(`/rtm-decision/${id}`, {
        decision: "approve",
      });
      // Success will be handled by socket listener
    } catch (error) {
      console.error("RTM approval error:", error);
      toast.error(error.response?.data?.message || "Failed to approve RTM");
      setIsProcessingRTM(false);
    }
  };

  const handleRTMReject = async () => {
    setIsProcessingRTM(true);
    try {
      await Api.post(`/rtm-decision/${id}`, {
        decision: "reject",
      });
      // Success will be handled by socket listener
    } catch (error) {
      console.error("RTM rejection error:", error);
      toast.error(error.response?.data?.message || "Failed to reject RTM");
      setIsProcessingRTM(false);
    }
  };

  const handleCloseRTMPopup = () => {
    if (!isProcessingRTM) {
      setShowRTMPopup(false);
      // DON'T clear pendingRTMRequest here - keep it so we can reopen the popup
      // setPendingRTMRequest(null); // Comment out or remove this line
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const response = await Api.get(`/queue-status/${id}`);
      const data = response.data;
      console.log("Fetched queue status:", data);

      setCanChangeMode(data.canChangeMode);
      setBiddingStarted(data.biddingStarted);
      setSelectionMode(data.selectionMode);
      setAutomaticFilter(data.automaticFilter);

      const currentPos = data.currentQueuePosition;
      setCurrentQueuePosition(currentPos);

      const manualQueue = data.manualPlayerQueue || [];
      setManualPlayerQueue(manualQueue);

      if (data.selectionMode === "manual" && manualQueue.length > 0) {
        const queueDisplayObj = {
          current: Math.max(1, currentPos + 1),
          total: manualQueue.length,
        };
        setQueueDisplay(queueDisplayObj);
      } else {
        setQueueDisplay({ current: 0, total: 0 });
      }

      if (data.currentPlayer) {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: data.currentPlayer._id,
            name: data.currentPlayer.name,
            role: data.currentPlayer.role,
            batting: data.currentPlayer.battingStyle,
            bowling: data.currentPlayer.bowlingStyle,
            basePrice: data.currentPlayer.basePrice,
            avatarUrl: data.currentPlayer.photo,
          },
        }));
      }

      console.log("Queue Status Summary:", {
        selectionMode: data.selectionMode,
        currentPosition: currentPos,
        totalQueue: manualQueue.length,
        remainingPlayers: manualQueue.length - currentPos - 1,
        biddingStarted: data.biddingStarted,
      });
    } catch (error) {
      console.error("Error fetching queue status:", error);
    }
  };

  const startBiddingWithPlayer = async () => {
    try {
      const response = await Api.post(`/start-bidding/${id}`, {
        selectionMode: selectionMode,
        automaticFilter: automaticFilter,
      });
      console.log("Bidding started successfully:", response.data);
      setAuctionData((prev) => ({
        ...prev,
        currentLot: {
          id: response.data.currentPlayer?._id,
          name: response.data.currentPlayer?.name,
          role: response.data.currentPlayer?.role,
          batting: response.data.currentPlayer?.battingStyle,
          bowling: response.data.currentPlayer?.bowlingStyle,
          basePrice: response.data.currentPlayer?.basePrice,
          avatarUrl: response.data.currentPlayer?.photo,
        },
        currentBid: {
          amount: response.data.currentPlayer?.basePrice || 0,
          team: null,
          teamLogo: null,
        },
      }));
      setBiddingStarted(true);
      setBidAmount(response.data.currentPlayer?.basePrice || 0);
      await fetchQueueStatus();
      return true;
    } catch (error) {
      toast.error("Error starting bidding:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to start bidding. Please try again."
      );
      return false;
    }
  };

  const getFirstAvailablePlayer = async () => {
    try {
      if (incoming.length > 0) {
        return incoming[0]?.id || incoming[0]?._id;
      }
      const response = await Api.get(`/get-auction/${id}`);
      const selectedPlayers = response.data.selectedPlayers;
      if (selectedPlayers && selectedPlayers.length > 0) {
        if (typeof selectedPlayers[0] === "string") {
          return selectedPlayers[0];
        }
        return selectedPlayers[0]._id || selectedPlayers[0].id;
      }
      return null;
    } catch (error) {
      toast.error("Error getting first available player:", error);
      return null;
    }
  };

  const handleSaveStartSelection = async () => {
    try {
      const filterToUse = popupSelection === "automatic" ? role : "All";
      await updateSelectionMode(popupSelection, filterToUse);
      setSelectionMode(popupSelection);
      setAutomaticFilter(filterToUse);

      if (popupSelection === "manual") {
        if (incoming.length > 0) {
          const playerQueue = incoming.map((player, index) => ({
            player: player.id || player._id,
            position: index + 1,
            playerData: player,
          }));
          await Api.post(`/set-manual-queue/${id}`, { playerQueue });
          setManualPlayerQueue(playerQueue);
          setQueueDisplay({ current: 1, total: playerQueue.length });
        }
        const success = await startBiddingWithPlayer();
        if (success) {
          setBiddingStarted(true);
          setCanChangeMode(false);
          setShowStartPopup(false);
          return;
        }
      } else if (popupSelection === "automatic") {
        const response = await Api.post(`/start-automatic-bidding/${id}`, {
          automaticFilter: filterToUse,
        });
        console.log("Automatic bidding started:", response.data);
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: response.data.currentPlayer?._id,
            name: response.data.currentPlayer?.name,
            role: response.data.currentPlayer?.role,
            batting: response.data.currentPlayer?.battingStyle,
            bowling: response.data.currentPlayer?.bowlingStyle,
            basePrice: response.data.currentPlayer?.basePrice,
            avatarUrl: response.data.currentPlayer?.photo,
          },
          currentBid: {
            amount: response.data.currentPlayer?.basePrice || 0,
            team: null,
            teamLogo: null,
          },
        }));
        setBiddingStarted(true);
        setBidAmount(response.data.currentPlayer?.basePrice || 0);
        setCanChangeMode(false);
        setShowStartPopup(false);
        await fetchQueueStatus();
        return;
      }
      // If reached here: resume from paused
      await Api.patch(`/pause-auction/${id}`, { isPaused: false });
      setIsPaused(false);
    } catch (error) {
      toast.error("Error in handleSaveStartSelection:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while starting bidding."
      );
    }
    setShowStartPopup(false);
  };

  const fetchAuctionData = async () => {
    try {
      const res = await Api.get(`/get-auction/${id}`);
      const data = res.data;
      console.log("Fetched auction data:", data);

      const newBidTeam = data.currentBid?.team?.teamName;
      if (
        newBidTeam &&
        lastBidTeamRef.current &&
        newBidTeam !== lastBidTeamRef.current
      ) {
        setShowEdit(true);
      }
      lastBidTeamRef.current = newBidTeam;

      setAuctionData((prev) => ({
        ...prev,
        lastSold: {
          name: data.lastSoldPlayer?.player?.name || prev.lastSold.name,
          price: data.lastSoldPlayer?.bidAmount || prev.lastSold.price,
          team: data.lastSoldPlayer?.team?.shortName || prev.lastSold.team,
        },
        mostExpensive: {
          name:
            data.mostExpensivePlayer?.player?.name || prev.mostExpensive.name,
          price:
            data.mostExpensivePlayer?.bidAmount || prev.mostExpensive.price,
          team:
            data.mostExpensivePlayer?.team?.shortName ||
            prev.mostExpensive.team,
        },
        currentLot: {
          id: data.currentPlayerOnBid?._id || prev.currentLot.id,
          name: data.currentPlayerOnBid?.name || prev.currentLot.name,
          role: data.currentPlayerOnBid?.role || prev.currentLot.role,
          batting:
            data.currentPlayerOnBid?.battingStyle || prev.currentLot.batting,
          bowling:
            data.currentPlayerOnBid?.bowlingStyle || prev.currentLot.bowling,
          basePrice:
            data.currentPlayerOnBid?.basePrice || prev.currentLot.basePrice,
          playerPic:
            data.currentPlayerOnBid?.playerPic || prev.currentLot.playerPic,
        },
        currentBid: {
          amount: data.currentBid?.amount || prev.currentBid.amount,
          team: data.currentBid?.team?.teamName || prev.currentBid.team,
          teamLogo: data.currentBid?.team?.logoUrl || prev.currentBid.teamLogo,
        },
      }));
      if (data.pendingRTMRequest) {
        setPendingRTMRequest(data.pendingRTMRequest);
      } else {
        setPendingRTMRequest(null);
        setShowRTMPopup(false);
      }

      setBiddingStarted(data.biddingStarted || false);
      setSelectionMode(data.selectionMode || "automatic");
      setAutomaticFilter(data.automaticFilter || "All");
      setManualPlayerQueue(data.manualPlayerQueue || []);
      setCurrentQueuePosition(data.currentQueuePosition || 0);
      setIsPaused(data.isPaused);

      if (data.automaticFilter && data.automaticFilter !== "All") {
        setRole(data.automaticFilter);
      }

      if (data.bidAmount?.amount !== undefined) {
        setBidAmount(data.bidAmount.amount);
      } else if (data.currentPlayerOnBid?.basePrice) {
        setBidAmount(data.currentPlayerOnBid.basePrice);
      }

      if (data.status) {
        setStatus(
          data.status === "started" || data.status === "live"
            ? "live"
            : data.status
        );
      }

      await fetchQueueStatus();
      await fetchPlayerPic();
    } catch (err) {
      console.error("Error while fetching auction:", err);
    }
  };

  const getNextPlayer = async () => {
    try {
      const response = await Api.get(`/next-player/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting next player:", error);
      return null;
    }
  };

  const fetchPlayerPic = async () => {
    try {
      const res = await Api.get(`/get-auction/${id}`);
      const data = res.data;
      const newPlayer = data.currentPlayerOnBid;
      const newPlayerId = newPlayer?._id;
      if (newPlayerId && newPlayerId !== currentPlayerId) {
        console.log("New player entered:", newPlayer.name);
        setPlayerPic(newPlayer.playerPic || null);
        setCurrentPlayerId(newPlayerId);
      }
    } catch (err) {
      console.error("Error fetching player pic:", err);
    }
  };

  // Removed old polling useEffect

  const updateSelectionMode = async (newMode, filter = "All") => {
    try {
      await Api.post(`/update-selection-mode/${id}`, {
        selectionMode: newMode,
        automaticFilter: filter,
      });
      console.log(`Selection mode updated to ${newMode} with filter ${filter}`);
      await fetchQueueStatus();
    } catch (error) {
      console.error("Error updating selection mode:", error);
    }
  };

  const startAutomaticBiddingWithRole = async (selectedRole) => {
    try {
      const response = await Api.get(`/get-auction/${id}`);
      const selectedPlayers = response.data.selectedPlayers;
      if (!selectedPlayers || selectedPlayers.length === 0) {
        alert("No players available for bidding.");
        return false;
      }
      let playerToStart = null;
      if (
        selectedPlayers.length > 0 &&
        typeof selectedPlayers[0] === "object"
      ) {
        const playersWithRole = selectedPlayers.filter(
          (player) => player.role === selectedRole
        );
        playerToStart =
          playersWithRole.length > 0 ? playersWithRole[0] : selectedPlayers[0];
      } else {
        playerToStart = { _id: selectedPlayers[0] };
      }
      const playerId = playerToStart._id || playerToStart.id;
      return await startBiddingWithPlayer(playerId);
    } catch (error) {
      console.error("Error in automatic bidding with role:", error);
      return false;
    }
  };

  const handleRoleBasedStart = async () => {
    if (selectionMode === "automatic") {
      const success = await startAutomaticBiddingWithRole(role);
      if (!success) {
        const firstPlayerId = await getFirstAvailablePlayer();
        if (firstPlayerId) {
          await startBiddingWithPlayer(firstPlayerId);
        }
      }
    }
  };

  const handleManualSell = async () => {
    if (!auctionData.currentLot.id || auctionData.currentLot.id === "--/--") {
      alert("No player currently on bid");
      return;
    }
    try {
      const response = await Api.post(
        `/manual-sell/${id}/${auctionData.currentLot.id}`
      );
      const {
        nextPlayer,
        isLastPlayer,
        biddingEnded,
        soldTo,
        amount,
        isPaused: pausedFlag,
      } = response.data;

      if (pausedFlag) {
        toast.success("Auction Paused");
      }
      if (biddingEnded || isLastPlayer || !pausedFlag) {
        toast.success("Auction completed! No more players available.");
      } else {
        toast.success(`Player sold for ₹${amount.toLocaleString()}!`);
      }

      if (nextPlayer) {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: nextPlayer._id,
            name: nextPlayer.name,
            role: nextPlayer.role,
            batting: nextPlayer.battingStyle,
            bowling: nextPlayer.bowlingStyle,
            basePrice: nextPlayer.basePrice,
            avatarUrl: nextPlayer.photo,
          },
          currentBid: {
            amount: nextPlayer.basePrice || 0,
            team: null,
            teamLogo: null,
          },
        }));
        setBidAmount(nextPlayer.basePrice || 0);
        if (selectionMode === "manual") {
          setCurrentQueuePosition((prev) => prev + 1);
          setQueueDisplay((prev) => ({
            current: prev.current + 1,
            total: prev.total,
          }));
        }
      } else {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: "--/--",
            name: "No more players",
            role: "--/--",
            batting: "--/--",
            bowling: "--/--",
            basePrice: 0,
            avatarUrl: null,
          },
          currentBid: {
            amount: 0,
            team: null,
            teamLogo: null,
          },
        }));
        setBiddingStarted(false);
        setStatus("completed");
        setCanChangeMode(true);
      }

      await fetchAuctionData();
      await fetchQueueStatus();
      await fetchPlayerPic();
    } catch (error) {
      console.error("Sell error:", error);
      toast.error("Error selling player.");
      toast.error(
        error.response?.data?.error ||
          "Failed to sell player. Please try again."
      );
    }
  };

  const handleModeToggle = async (newMode) => {
    if (!canChangeMode) {
      if (selectionMode === "manual" && manualPlayerQueue.length > 0) {
        alert(
          "Cannot switch to automatic mode while manual queue has players. Please complete the current queue first."
        );
      } else {
        alert("Cannot change mode at this time");
      }
      return;
    }
    if (selectionMode === "manual" && newMode === "automatic") {
      const queueRemaining =
        manualPlayerQueue.length - currentQueuePosition - 1;
      if (queueRemaining > 0) {
        alert(
          "Cannot switch to automatic mode. Please complete all players in the manual queue first."
        );
        return;
      }
    }
    try {
      const filterToUse = newMode === "automatic" ? role : "All";
      await Api.post(`/update-selection-mode/${id}`, {
        selectionMode: newMode,
        automaticFilter: filterToUse,
      });
      // setSelectionMode(newMode);
      // setAutomaticFilter(filterToUse);
      // await fetchQueueStatus();
      if (
        newMode === "manual" &&
        (!manualPlayerQueue || manualPlayerQueue.length === 0)
      ) {
        handleManualSelect();
      }
    } catch (error) {
      console.error("Error updating selection mode:", error);
      alert(error.response?.data?.error || "Failed to update selection mode");
    }
  };

  const handleRoleChange = async (newRole) => {
    setRole(newRole);
    if (selectionMode === "automatic") {
      try {
        await Api.post(`/update-selection-mode/${id}`, {
          selectionMode: "automatic",
          automaticFilter: newRole,
        });
        setAutomaticFilter(newRole);
        await fetchQueueStatus();
      } catch (error) {
        console.error("Error updating automatic filter:", error);
      }
    }
  };

  const updateManualQueue = async (playerQueue) => {
    try {
      const response = await Api.post(`/set-manual-queue/${id}`, {
        playerQueue,
      });
      setManualPlayerQueue(response.data.auction.manualPlayerQueue);
      if (response.data.shouldStartNext && response.data.nextPlayer) {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: response.data.nextPlayer._id,
            name: response.data.nextPlayer.name,
            role: response.data.nextPlayer.role,
            batting: response.data.nextPlayer.battingStyle,
            bowling: response.data.nextPlayer.bowlingStyle,
            basePrice: response.data.nextPlayer.basePrice,
            avatarUrl: response.data.nextPlayer.photo,
          },
        }));
      }
      await fetchQueueStatus();
    } catch (error) {
      console.error("Error updating manual queue:", error);
      alert("Failed to update player queue");
    }
  };

  const handleAddMorePlayers = () => {
    navigate(`/admin/admin-manual-player-selection/${id}`, {
      state: {
        addToExistingQueue: biddingStarted && selectionMode === "manual",
        currentQueue: manualPlayerQueue,
        currentPosition: currentQueuePosition,
      },
    });
  };

  const toggleFullScreen = () => setFullScreen((fs) => !fs);

  const onStopBidding = () => setStatus("paused");
  const onSell = () => setStatus("selling");

  const onMoveToUnsell = async () => {
    try {
      const response = await Api.patch(`/unsold/${id}`);
      const {
        nextPlayer,
        isLastPlayer,
        currentQueuePosition,
        totalQueueLength,
        remainingPlayers,
        isPaused: pausedFlag,
      } = response.data;

      setAuctionData((prev) => ({
        ...prev,
        currentQueuePosition,
        totalQueueLength,
        remainingPlayers,
        isPaused: pausedFlag,
      }));

      if (nextPlayer) {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: nextPlayer._id,
            name: nextPlayer.name,
            role: nextPlayer.role,
            batting: nextPlayer.battingStyle,
            bowling: nextPlayer.bowlingStyle,
            basePrice: nextPlayer.basePrice,
            avatarUrl: nextPlayer.photo,
          },
          currentBid: {
            amount: nextPlayer.basePrice || 0,
            team: null,
            teamLogo: null,
          },
        }));
        setBidAmount(nextPlayer.basePrice || 0);
        setStatus("live");
        if (selectionMode === "manual") {
          setCurrentQueuePosition(currentQueuePosition);
          setQueueDisplay((prev) => ({
            current: currentQueuePosition + 1,
            total: totalQueueLength,
          }));
        }
      } else {
        setAuctionData((prev) => ({
          ...prev,
          currentLot: {
            id: "--/--",
            name: "No more players",
            role: "--/--",
            batting: "--/--",
            bowling: "--/--",
            basePrice: 0,
            avatarUrl: null,
          },
          currentBid: {
            amount: 0,
            team: null,
            teamLogo: null,
          },
        }));
        // setBiddingStarted(false);
        // setStatus("completed");
        setCanChangeMode(true);
      }

      toast.success("Player marked as Unsold and moved to next.");
      await fetchAuctionData();
      await fetchQueueStatus();
      await fetchPlayerPic();
    } catch (error) {
      console.error("Error marking unsold:", error);
      toast.error("Failed to mark player as Unsold.");
    }
  };

  const onEditBid = () => setShowEdit(true);

  const onApplyBid = async () => {
    try {
      setShowEdit(false);
      await Api.patch(`/update-bid/${id}`, { amount: bidAmount });
      toast.success("Bid updated!");
      // server emits "bid:updated" → socket listener will update bidAmount
    } catch (error) {
      console.error("Error updating bid:", error);
      toast.error("Failed to update bid");
    }
  };

  const onResetBid = () => {
    setBidAmount(auctionData.currentBid.amount);
    setShowEdit(false);
  };

  // Pause/Resume handler
  const togglePause = async () => {
    try {
      if (isPaused) {
        // Resume
        const response = await Api.patch(`/pause-auction/${id}`, {
          isPaused: false,
        });
        console.log(response.data.message);
        // setIsPaused(false);
        toast.success("Auction Resumed");
      } else {
        // Pause
        const response = await Api.patch(`/pause-auction/${id}`, {
          isPaused: true,
        });
        console.log(response.data.message);
        setIsPaused(true);
        // Optionally stop biddingStarted locally
        setBiddingStarted(false);
        toast.success("Auction Paused");
      }
    } catch (err) {
      toast.error("Failed to pause/resume auction");
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      }
    }
    setPlayerPic(null);
  };

  // Poll pause status occasionally (optional fallback)
  // useEffect(() => {
  //   const checkIsPaused = async () => {
  //     try {
  //       const res = await Api.get(`/get-auction-pause-status/${id}`);
  //       const paused = res.data.isPaused;
  //       setIsPaused(paused);
  //       if (paused) setBiddingStarted(false);
  //     } catch (err) {
  //       console.error("Failed to fetch pause status");
  //     }
  //   };
  //   const interval = setInterval(checkIsPaused, 5000);
  //   checkIsPaused();
  //   return () => clearInterval(interval);
  // }, [id]);

  const handleManualSelect = () => {
    navigate(`/admin/admin-manual-player-selection/${id}`);
  };

  const [ending, setEnding] = useState(false);
  const handleEndAuction = async () => {
    setEnding(true);
    try {
      const res = await Api.patch(`/end-auction/${id}`);
      navigate("/admins-my-auction-info");
      toast.success(res.data.message || "Auction ended");
      // Optionally further logic
    } catch (err) {
      console.error("End-auction error:", err);
      toast.error(err.response?.data?.message || "Failed to end auction");
    } finally {
      setEnding(false);
    }
  };

  // RENDER
  const containerClasses = [
    "p-4 text-white bg-gradient-to-br from-gray-900 pb-20 via-blue-900 to-indigo-900",
    fullScreen
      ? "fixed inset-0 z-[9999] overflow-auto"
      : "relative mx-auto max-w-7xl",
  ].join(" ");

  const resetBidToBasePrice = () => {
    if (
      auctionData.currentLot.basePrice &&
      auctionData.currentLot.basePrice !== "--/--"
    ) {
      setBidAmount(auctionData.currentLot.basePrice);
    }
  };

  const formatIndianNumber = (num) => {
    if (!num || isNaN(num)) return "";
    const value = parseInt(num, 10);
    if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)} K`;
    return value.toString();
  };

  const bidSteps = [
    10000, // 10k
    50000, // 50k
    100000, // 1L
    1000000, // 10L
    2500000, // 25L
    5000000, // 50L
    10000000, // 1Cr
    20000000, // 2Cr
    40000000, // 4Cr
    60000000, // 6Cr
    80000000, // 8Cr
    100000000, // 10Cr
  ];

  const getNextBid = (current) => {
    const curr = parseInt(current || 0);
    for (let step of bidSteps) {
      if (step > curr) return step;
    }
    return curr; // Maxed out
  };

  return (
    <div className={containerClasses + " pt-2 md:pt-4"}>
      {/* Full-screen toggle */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleFullScreen}
          className="px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-xs sm:text-sm transition-all duration-200"
        >
          {fullScreen ? "Exit Full Screen" : "Full Screen"}
        </button>
      </div>
      {/* Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(85vh-4rem)]">
        {/* Left Sidebar (desktop only) */}
        <div className="hidden md:flex flex-col space-y-4 md:h-full md:justify-between">
          <div>
            {[
              ["Last Sold", auctionData.lastSold],
              ["Most Expensive", auctionData.mostExpensive],
            ].map(([title, info]) => (
              <motion.div
                key={title}
                className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 mt-2 text-sm shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h4 className="uppercase text-xs font-medium tracking-wider">
                  {title}
                </h4>
                <p className="font-semibold text-sm mt-1">{info.name}</p>
                <p className="text-xs opacity-80">
                  {info.price} — {info.team}
                </p>
              </motion.div>
            ))}
          </div>
          {/* Current lot summary */}
          <motion.div
            className="bg-gradient-to-br from-indigo-800 to-blue-700 rounded-xl p-4 text-center shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-bold text-lg sm:text-xl">
              {auctionData.currentLot.name}
            </h2>
            <p className="text-sm bg-blue-600/30 inline-block px-2 py-1 rounded-full mt-1">
              {auctionData.currentLot.role}
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <div>
                <span className="text-xs opacity-75">Bat</span>
                <p className="text-sm">{auctionData.currentLot.batting}</p>
              </div>
              <div>
                <span className="text-xs opacity-75">Ball</span>
                <p className="text-sm">{auctionData.currentLot.bowling}</p>
              </div>
            </div>
            <p className="mt-3 text-base font-semibold bg-blue-900/50 py-1 rounded-lg">
              Base Price: {auctionData.currentLot.basePrice}
            </p>
          </motion.div>
        </div>

        {/* Center Section */}
        <div className="md:col-span-2 flex flex-col items-center space-y-4">
          {/* Top Buttons: Player List, Teams */}
          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              onClick={() => navigate(`/bidding/players-list/${id}`)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Player List
            </motion.button>

            <motion.button
              onClick={() => navigate(`/admin/bidding-teams-list/${id}`)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Teams
            </motion.button>
          </div>

          {/* Mobile pause/resume button */}
          <div className="md:hidden flex justify-center mb-2">
            <motion.button
              onClick={togglePause}
              className={`w-32 rounded-xl py-2 text-xs sm:text-sm shadow-md transition ${
                isPaused
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isPaused ? "Resume Auction" : "Pause Auction"}
            </motion.button>
          </div>

          {/* Edit Bid / Reset / Start Bidding */}
          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              onClick={onEditBid}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Bid
            </motion.button>
            {/* <motion.button
              onClick={handleStartBidding}
              disabled={biddingStarted && !isPaused}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md ${
                biddingStarted && !isPaused
                  ? "bg-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              }`}
              whileHover={!(biddingStarted && !isPaused) ? { scale: 1.05 } : {}}
              whileTap={!(biddingStarted && !isPaused) ? { scale: 0.95 } : {}}
            >
              {biddingStarted && !isPaused
                ? "Bidding Started"
                : "Start Bidding"}
            </motion.button> */}

            <motion.button
              onClick={handleStartBidding}
              disabled={biddingStarted && !isPaused}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md ${
                biddingStarted && !isPaused
                  ? "bg-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              }`}
              whileHover={!(biddingStarted && !isPaused) ? { scale: 1.05 } : {}}
              whileTap={!(biddingStarted && !isPaused) ? { scale: 0.95 } : {}}
            >
              {biddingStarted && !isPaused
                ? "Bidding Started"
                : "Start Bidding"}
            </motion.button>
          </div>
          {/* Add this for debugging */}
          {/* Test RTM Button - Add this for testing purposes */}
          {/* <motion.button
            onClick={() => {
              // Simulate an RTM request for testing
              const testRTMRequest = {
                playerName: "Test Player",
                teamName: "Test Team",
                bidAmount: 50000,
                requestId: "test-123",
              };
              setPendingRTMRequest(testRTMRequest);
              setShowRTMPopup(true);
              toast.info("Test RTM request created");
            }}
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-500 rounded-xl hover:from-yellow-700 hover:to-orange-600 text-sm shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🧪 Test RTM Request
          </motion.button> */}

          {/* Your actual RTM reopen button */}
          {pendingRTMRequest && !showRTMPopup && (
            <motion.button
              onClick={() => setShowRTMPopup(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl hover:from-purple-700 hover:to-pink-600 text-sm shadow-lg animate-pulse"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚠️ Review RTM Request
            </motion.button>
          )}

          {/* Avatar & Current Bid */}
          <motion.div
            className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 text-center w-full max-w-md shadow-xl"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-700 to-blue-800 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center overflow-hidden border-2 border-cyan-400/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {playerPic ? (
                <img
                  src={playerPic}
                  alt="Player"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 px-6 py-3 font-bold text-xl sm:text-2xl text-black shadow-lg"
            >
              {bidAmount}
            </motion.div>
          </motion.div>

          {/* MOBILE ONLY: Player Details and Bid Team Info side-by-side */}
          <div className="md:hidden w-full max-w-md grid grid-cols-2 gap-3">
            {/* Player Details Card */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center">
              <h2 className="font-bold text-sm truncate">
                {auctionData.currentLot.name}
              </h2>
              <p className="text-xs bg-blue-600/30 inline-block px-2 py-0.5 rounded-full">
                {auctionData.currentLot.role}
              </p>
              <p className="mt-1 text-[10px] opacity-75">
                Bat: {auctionData.currentLot.batting}
              </p>
              <p className="text-[10px] opacity-75">
                Ball: {auctionData.currentLot.bowling}
              </p>
              <p className="mt-1 text-xs font-semibold bg-blue-900/30 py-0.5 rounded">
                Base: {auctionData.currentLot.basePrice}
              </p>
            </div>

            {/* Bid Team Info Card */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center flex flex-col justify-center">
              {auctionData.currentBid.teamLogo ? (
                <img
                  src={auctionData.currentBid.teamLogo}
                  alt="Team Logo"
                  className="w-12 h-12 rounded-xl object-contain mx-auto border-2"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mx-auto" />
              )}
              <p className="text-[10px] opacity-75 mt-1">Bid By</p>
              <h3 className="text-xs font-semibold truncate">
                {auctionData.currentBid.team}
              </h3>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <motion.button
              onClick={handleManualSell}
              className="w-32 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:from-green-700 hover:to-emerald-600 text-sm sm:text-sm shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sell
            </motion.button>
            <motion.button
              onClick={onMoveToUnsell}
              className="md:hidden px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-orange-700 hover:to-red-600 text-sm shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Move to Unsell
            </motion.button>
          </div>
        </div>

        {/* Right Sidebar (desktop only) */}
        <div className="hidden md:flex space-y-4 md:col-span-1 md:h-full md:flex-col md:justify-between">
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold mb-3 text-center">
                Player Selection
              </h3>

              {/* Main Toggle Switch */}
              <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
                {/* <motion.div
                  className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
                    selectionMode === "automatic"
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                      : "bg-gradient-to-r from-amber-500 to-orange-400"
                  }`}
                  animate={{
                    left: selectionMode === "automatic" ? "0" : "50%",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                <button
                  onClick={() => handleModeToggle("automatic")}
                  disabled={biddingStarted}
                  className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                    selectionMode === "automatic"
                      ? "text-white"
                      : "text-gray-300"
                  }`}
                >
                  Auto
                </button> */}

                <button
                  onClick={() => handleModeToggle("manual")}
                  disabled={biddingStarted}
                  className={`relative h-full w-full z-10 text-sm font-semibold tracking-wide transition-all duration-300 ease-in-out  ${
                    selectionMode === "manual"
                      ? "bg-gray-400 cursor-not-allowed text-white hover:bg-stone-500"
                      : "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-amber-500 shadow-lg"
                  }`}
                >
                  Manual
                </button>
              </div>

              {/* Role Selector for Automatic Mode */}
              {/* {selectionMode === "automatic" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-3"
                >
                  <label className="text-xs block mb-1 opacity-80">
                    Select Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Fast all-rounder">Fast All Rounder</option>
                    <option value="Spin all-rounder">Spin All Rounder</option>
                    <option value="Wicket keeper batsman">
                      Wicket Keeper Batsman
                    </option>
                    <option value="Spin bowler">Spin Bowler</option>
                    <option value="Fast bowler">Fast Bowler</option>
                  </select>
                </motion.div>
              )} */}

              {/* Queue Status Display for Manual Mode */}
              {/* {selectionMode === "manual" && manualPlayerQueue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-2 bg-amber-900/30 rounded-lg"
                >
                  <p className="text-xs text-center text-amber-300">
                    Queue: {currentQueuePosition + 1} of{" "}
                    {manualPlayerQueue.length}
                  </p>
                  {manualPlayerQueue.length - currentQueuePosition <= 2 && (
                    <p className="text-xs text-center text-red-300 mt-1">
                      Queue running low! Add more players.
                    </p>
                  )}
                  <button
                    onClick={handleManualSelect}
                    className="w-full mt-2 px-2 py-1 bg-amber-600 hover:bg-amber-700 rounded text-xs"
                  >
                    Add More Players
                  </button>
                </motion.div>
              )} */}

              {selectionMode === "manual" && manualPlayerQueue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-2 bg-amber-900/30 rounded-lg"
                >
                  <p className="text-xs text-center text-amber-300">
                    Queue: {currentQueuePosition + 1} of{" "}
                    {manualPlayerQueue.length}
                  </p>
                  <p className="text-xs text-center text-gray-300 mt-1">
                    Processing {manualPlayerQueue.length} players in sequence
                  </p>
                </motion.div>
              )}
            </div>

            {/* Move to Unsell */}
            <motion.button
              onClick={onMoveToUnsell}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:from-purple-700 hover:to-indigo-600 text-sm shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Move to Unsell
            </motion.button>

            {/* Desktop Pause button */}
            <motion.button
              onClick={togglePause}
              disabled={isPaused || !biddingStarted}
              className={`w-full px-4 py-2 rounded text-xs sm:text-sm shadow-md transition ${
                isPaused
                  ? "bg-gray-600 text-white cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
              whileHover={!isPaused ? { scale: 1.02 } : {}}
              whileTap={!isPaused ? { scale: 0.98 } : {}}
            >
              {isPaused ? "Paused Auction" : "Pause Auction"}
            </motion.button>

            {/* End Auction */}
            <motion.button
              disabled={ending}
              className={`w-32 px-4 py-2 rounded-xl text-white shadow-lg ${
                ending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEndAuction}
            >
              {ending ? "Ending..." : "End Auction"}
            </motion.button>
          </div>

          {/* Current Bid info (team logo & amount) */}
          <motion.div
            className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 text-center shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {auctionData.currentBid.teamLogo ? (
              <img
                src={auctionData.currentBid.teamLogo}
                alt="Team Logo"
                className="w-16 h-16 rounded-xl object-contain mx-auto border-2"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
            )}
            <p className="text-xs sm:text-sm opacity-75 mt-2">Bid By</p>
            <h3 className="text-sm sm:text-base font-semibold mt-1">
              {auctionData.currentBid.team}{" "}
              <p className="text-xs sm:text-sm opacity-75 mt-2">
                ₹{auctionData.currentBid.amount}
              </p>
            </h3>
          </motion.div>
        </div>
      </div>

      {/* MOBILE-only Bottom Section */}
      <div className="md:hidden mt-4 space-y-4">
        <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-semibold mb-3 text-center">
            Player Selection
          </h3>
          {!biddingStarted && (
            <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
              {/* <motion.div
                className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
                  selectionMode === "automatic"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                }`}
                animate={{
                  left: selectionMode === "automatic" ? "0" : "50%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              <button
                onClick={() => handleModeToggle("automatic")}
                className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                  selectionMode === "automatic" ? "text-white" : "text-gray-300"
                }`}
              >
                Auto
              </button> */}
              <button
                onClick={() => handleModeToggle("manual")}
                className={`relative h-full w-full z-10 text-sm font-semibold tracking-wide transition-all duration-300 ease-in-out  ${
                  selectionMode === "manual"
                    ? "bg-gray-500 cursor-not-allowed text-white hover:bg-stone-600"
                    : "bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500 shadow-lg"
                }`}
              >
                Manual
              </button>
            </div>
          )}
          {biddingStarted && (
            <div className="p-3 bg-indigo-900/30 rounded-lg">
              <p className="text-xs text-center mb-2 text-yellow-300">
                Change Selection Mode:
              </p>
              <div className="flex gap-2">
                {/* <button
                  onClick={() => handleModeToggle("automatic")}
                  disabled={!canChangeMode}
                  className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                    selectionMode === "automatic"
                      ? "bg-emerald-500 text-white"
                      : canChangeMode
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Auto
                </button> */}
                <button
                  onClick={() => handleModeToggle("manual")}
                  disabled={!canChangeMode}
                  className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                    selectionMode === "manual"
                      ? "bg-amber-500 text-white"
                      : canChangeMode
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>
          )}
          {/* {selectionMode === "automatic" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <label className="text-xs block mb-1 opacity-80">
                Select Role:
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Batsman">Batsman</option>
                <option value="Fast all-rounder">Fast-All-Rounder</option>
                <option value="Spin all-rounder">Spin-All-Rounder</option>
                <option value="Wicket keeper batsman">
                  Wicket-keeper-batsman
                </option>
                <option value="Spin bowler">Spin Bowler</option>
                <option value="Fast bowler">Fast Bowler</option>
              </select>
            </motion.div>
          )} */}
          {selectionMode === "manual" && manualPlayerQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-2 bg-amber-900/30 rounded-lg"
            >
              <p className="text-xs text-center text-amber-300">
                Queue: {queueDisplay.current} of {queueDisplay.total}
              </p>
              {queueDisplay.current === queueDisplay.total && (
                <p className="text-xs text-center text-red-300 mt-1">
                  Add more players - Queue running low!
                </p>
              )}
              <button
                onClick={handleAddMorePlayers}
                className="w-full mt-2 px-2 py-1 bg-amber-600 hover:bg-amber-700 rounded text-xs"
              >
                Add More Players in Queue
              </button>
            </motion.div>
          )}
        </div>

        {/* Last Sold / Most Expensive bottom row */}
        <div className="flex gap-3 md:hidden">
          {[
            ["Last Sold", auctionData.lastSold],
            ["Most Expensive", auctionData.mostExpensive],
          ].map(([title, info]) => (
            <motion.div
              key={title}
              className="flex-1 bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-2 text-xs shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="uppercase text-[10px] font-medium opacity-80">
                {title}
              </h4>
              <p className="font-semibold text-xs truncate mt-1">{info.name}</p>
              <p className="text-[10px] opacity-75">
                {info.price} — {info.team}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Start Bidding Popup */}
      {showStartPopup && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-full max-w-sm space-y-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring" }}
          >
            <h2 className="text-lg font-bold text-center">
              Select Player Selection Mode
            </h2>

            <div className="flex gap-4 justify-center my-4">
              <motion.button
                onClick={() => setPopupSelection("manual")}
                className={`px-4 py-2 rounded-xl transition ${
                  popupSelection === "manual"
                    ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                Manual
              </motion.button>

              {/* <motion.button
                onClick={() => setPopupSelection("automatic")}
                className={`px-4 py-2 rounded-xl transition ${
                  popupSelection === "automatic"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400 text-white"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                Automatic
              </motion.button> */}
            </div>

            {/* Role selector if automatic */}
            {/* {popupSelection === "automatic" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-3"
              >
                <label className="text-xs block mb-2 opacity-80">
                  Select Role Filter:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Fast all-rounder">Fast-All-Rounder</option>
                  <option value="Spin all-rounder">Spin-All-Rounder</option>
                  <option value="Wicket keeper batsman">
                    Wicket-keeper-batsman
                  </option>
                  <option value="Spin bowler">Spin Bowler</option>
                  <option value="Fast bowler">Fast Bowler</option>
                </select>
              </motion.div>
            )} */}
            {/* {popupSelection === "manual" && incoming.length === 0 && (
              <div className="text-center p-3 bg-amber-900/30 rounded-lg">
                <p className="text-xs text-amber-300 mb-2">
                  No players selected for manual mode
                </p>
              </div>
            )} */}

            <div className="flex gap-3">
              <motion.button
                onClick={handleSaveStartSelection}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 hover:from-green-700 hover:to-emerald-600 text-sm font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>

              <motion.button
                onClick={() => setShowStartPopup(false)}
                className="flex-1 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-2 hover:from-gray-700 hover:to-gray-600 text-sm font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showRTMPopup && (
        <RTMApprovalPopup
          rtmRequest={pendingRTMRequest}
          onApprove={handleRTMApprove}
          onReject={handleRTMReject}
          onClose={handleCloseRTMPopup}
          isProcessing={isProcessingRTM}
        />
      )}

      {/* Edit Bid Modal */}
      {showEdit && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-full max-w-sm space-y-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring" }}
          >
            <h2 className="text-lg font-bold text-center">Edit Bid</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1 rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <motion.button
                onClick={() => setBidAmount(getNextBid(bidAmount))}
                className="rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-3 text-xl font-bold shadow-md transition duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                +
              </motion.button>
            </div>

            {bidAmount && !isNaN(bidAmount) && (
              <p className="text-sm text-center text-green-400 font-medium">
                ₹ {formatIndianNumber(bidAmount)}
              </p>
            )}

            <div className="flex gap-3">
              <motion.button
                onClick={onApplyBid}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 hover:from-green-700 hover:to-emerald-600 text-sm font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply
              </motion.button>
              <motion.button
                onClick={() => setShowEdit(false)}
                className="flex-1 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-2 hover:from-gray-700 hover:to-gray-600 text-sm font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
