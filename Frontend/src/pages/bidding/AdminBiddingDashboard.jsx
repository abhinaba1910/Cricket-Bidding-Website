// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import api from "../../userManagement/Api";
// import { toast } from "react-hot-toast";

// const SAMPLE_AUCTION = {
//   lastSold: { name: "--/--", price: "--/--", team: "--/--" },
//   mostExpensive: { name: "--/--", price: "--/--", team: "--/--" },
//   currentLot: {
//     id: "--/--",
//     name: "--/--",
//     role: "--/--",
//     batting: "--/--",
//     bowling: "--/--",
//     basePrice: "--/--",
//     avatarUrl: null,
//   },
//   currentBid: {
//     amount: "--/--",
//     team: "--/--",
//     teamLogo: "--/--",
//   },
// };

// export default function AdminBiddingDashboard() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const incoming = location.state?.selectedPlayers || [];
//   const { id } = useParams();

//   // 2) STATE: hold ALL auction‐related fields in a single object
//   //    Initialize with SAMPLE so the UI doesn’t break if the fetch is still pending.
//   const [auctionData, setAuctionData] = useState(SAMPLE_AUCTION);

//   // status / UI state
//   const [status, setStatus] = useState("live");
//   const [showEdit, setShowEdit] = useState(false);
//   const [bidAmount, setBidAmount] = useState(SAMPLE_AUCTION.currentBid.amount);
//   const [fullScreen, setFullScreen] = useState(false);
//   const [selectionMode, setSelectionMode] = useState("automatic");
//   const [role, setRole] = useState("Batsman");
//   const [biddingStarted, setBiddingStarted] = useState(false);
//   const [automaticFilter, setAutomaticFilter] = useState("All");
//   const [manualPlayerQueue, setManualPlayerQueue] = useState([]);
//   const [currentQueuePosition, setCurrentQueuePosition] = useState(0);
//   const [canChangeMode, setCanChangeMode] = useState(true);

//   const [showStartPopup, setShowStartPopup] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [popupSelection, setPopupSelection] = useState("automatic");
//   const [showAddMorePlayers, setShowAddMorePlayers] = useState(false);
//   const [queueDisplay, setQueueDisplay] = useState({ current: 0, total: 0 });

//   const handleStartBidding = async () => {
//     setShowStartPopup(true);

//     try {
//       await api.patch(`/pause-auction/${id}`, {
//         isPaused: false,
//       });
//       setIsPaused(false);
//     } catch (error) {
//       console.error("Error starting bidding:", error);
//       alert("Internal server error");
//     }
//   };

//   const fetchQueueStatus = async () => {
//     try {
//       const response = await api.get(`/queue-status/${id}`);
//       const data = response.data;

//       console.log("Fetched queue status:", data);

//       setCanChangeMode(data.canChangeMode);
//       setBiddingStarted(data.biddingStarted);
//       setSelectionMode(data.selectionMode);
//       setAutomaticFilter(data.automaticFilter);

//       // Update current queue position
//       const currentPos = data.currentQueuePosition;
//       setCurrentQueuePosition(currentPos);

//       // Update manual player queue
//       const manualQueue = data.manualPlayerQueue || [];
//       setManualPlayerQueue(manualQueue);

//       // Update queue display for manual mode
//       if (data.selectionMode === "manual" && manualQueue.length > 0) {
//         const queueDisplay = {
//           current: Math.max(1, currentPos + 1), // Ensure at least 1
//           total: manualQueue.length,
//         };

//         console.log("Queue display updated:", queueDisplay);
//         setQueueDisplay(queueDisplay);

//         // Show add more players option when queue is running low
//         const remainingPlayers = manualQueue.length - currentPos - 1;
//         setShowAddMorePlayers(remainingPlayers <= 1);

//         console.log("Remaining players in queue:", remainingPlayers);
//       } else {
//         // Reset queue display for automatic mode
//         setQueueDisplay({ current: 0, total: 0 });
//         setShowAddMorePlayers(false);
//       }

//       // Update current player if available
//       if (data.currentPlayer) {
//         setAuctionData((prev) => ({
//           ...prev,
//           currentLot: {
//             id: data.currentPlayer._id,
//             name: data.currentPlayer.name,
//             role: data.currentPlayer.role,
//             batting: data.currentPlayer.battingStyle,
//             bowling: data.currentPlayer.bowlingStyle,
//             basePrice: data.currentPlayer.basePrice,
//             avatarUrl: data.currentPlayer.photo,
//           },
//         }));
//       }

//       console.log("Queue Status Summary:", {
//         selectionMode: data.selectionMode,
//         currentPosition: currentPos,
//         totalQueue: manualQueue.length,
//         remainingPlayers: manualQueue.length - currentPos - 1,
//         biddingStarted: data.biddingStarted,
//       });
//     } catch (error) {
//       console.error("Error fetching queue status:", error);
//     }
//   };

//   const startBiddingWithPlayer = async () => {
//     try {
//       // Use the backend's start-bidding route instead of passing playerId
//       const response = await api.post(`/start-bidding/${id}`, {
//         selectionMode: selectionMode,
//         automaticFilter: automaticFilter,
//       });

//       console.log("Bidding started successfully:", response.data);

//       // Update local state based on backend response
//       setAuctionData((prev) => ({
//         ...prev,
//         currentLot: {
//           id: response.data.currentPlayer?._id,
//           name: response.data.currentPlayer?.name,
//           role: response.data.currentPlayer?.role,
//           batting: response.data.currentPlayer?.battingStyle,
//           bowling: response.data.currentPlayer?.bowlingStyle,
//           basePrice: response.data.currentPlayer?.basePrice,
//           avatarUrl: response.data.currentPlayer?.photo,
//         },
//         currentBid: {
//           amount: response.data.currentPlayer?.basePrice || 0,
//           team: null,
//           teamLogo: null,
//         },
//       }));

//       setBiddingStarted(true);
//       setBidAmount(response.data.currentPlayer?.basePrice || 0);

//       await fetchQueueStatus();
//       return true;
//     } catch (error) {
//       toast.error("Error starting bidding:", error);
//       toast.error(
//         error.response?.data?.error ||
//           "Failed to start bidding. Please try again."
//       );
//       return false;
//     }
//   };

//   const getFirstAvailablePlayer = async () => {
//     try {
//       // First check if we have incoming players (manual selection)
//       if (incoming.length > 0) {
//         return incoming[0]?.id || incoming[0]?._id;
//       }

//       // Otherwise, get from auction's selectedPlayers
//       const response = await api.get(`/get-auction/${id}`);
//       const selectedPlayers = response.data.selectedPlayers;

//       if (selectedPlayers && selectedPlayers.length > 0) {
//         // If it's an array of IDs, return the first one
//         if (typeof selectedPlayers[0] === "string") {
//           return selectedPlayers[0];
//         }
//         // If it's an array of objects, return the _id
//         return selectedPlayers[0]._id || selectedPlayers[0].id;
//       }

//       return null;
//     } catch (error) {
//       toast.error("Error getting first available player:", error);
//       return null;
//     }
//   };

//   const handleSaveStartSelection = async () => {
//     try {
//       const filterToUse = popupSelection === "automatic" ? role : "All";

//       // Update selection mode first
//       await updateSelectionMode(popupSelection, filterToUse);

//       setSelectionMode(popupSelection);
//       setAutomaticFilter(filterToUse);

//       if (popupSelection === "manual") {
//         if (incoming.length > 0) {
//           // Set up manual queue with proper numbering
//           const playerQueue = incoming.map((player, index) => ({
//             player: player.id || player._id,
//             position: index + 1,
//             playerData: player, // Store full player data for queue display
//           }));

//           await api.post(`/set-manual-queue/${id}`, { playerQueue });
//           setManualPlayerQueue(playerQueue);
//           setQueueDisplay({ current: 1, total: playerQueue.length });
//         }

//         // Start bidding with manual mode
//         const success = await startBiddingWithPlayer();
//         if (success) {
//           setBiddingStarted(true);
//           setCanChangeMode(false); // Disable mode switching once started
//           setShowStartPopup(false);
//           return;
//         }
//       } else if (popupSelection === "automatic") {
//         // Use the specific backend route for automatic bidding
//         const response = await api.post(`/start-automatic-bidding/${id}`, {
//           automaticFilter: filterToUse,
//         });

//         console.log("Automatic bidding started:", response.data);

//         // Update state with response data
//         setAuctionData((prev) => ({
//           ...prev,
//           currentLot: {
//             id: response.data.currentPlayer?._id,
//             name: response.data.currentPlayer?.name,
//             role: response.data.currentPlayer?.role,
//             batting: response.data.currentPlayer?.battingStyle,
//             bowling: response.data.currentPlayer?.bowlingStyle,
//             basePrice: response.data.currentPlayer?.basePrice,
//             avatarUrl: response.data.currentPlayer?.photo,
//           },
//           currentBid: {
//             amount: response.data.currentPlayer?.basePrice || 0,
//             team: null,
//             teamLogo: null,
//           },
//         }));

//         setBiddingStarted(true);
//         setBidAmount(response.data.currentPlayer?.basePrice || 0);
//         setCanChangeMode(false); // Disable mode switching once started
//         setShowStartPopup(false);
//         await fetchQueueStatus();
//         return;
//       }
//       await api.patch(`/pause-auction/${id}`, {
//         isPaused: false,
//       });
//       setIsPaused(false);
//     } catch (error) {
//       toast.error("Error in handleSaveStartSelection:", error);
//       toast.error(
//         error.response?.data?.error ||
//           "An error occurred while starting bidding."
//       );
//     }

//     setShowStartPopup(false);
//   };

//   const fetchAuctionData = async () => {
//     try {
//       const res = await api.get(`/get-auction/${id}`);
//       const data = res.data;
//       console.log("Fetched auction data:", data);

//       setAuctionData((prev) => ({
//         ...prev,
//         lastSold: {
//           name: data.lastSoldPlayer?.player?.name || prev.lastSold.name,
//           price: data.lastSoldPlayer?.bidAmount || prev.lastSold.price,
//           team: data.lastSoldPlayer?.team?.shortName || prev.lastSold.team,
//         },
//         mostExpensive: {
//           name:
//             data.mostExpensivePlayer?.player?.name || prev.mostExpensive.name,
//           price:
//             data.mostExpensivePlayer?.bidAmount || prev.mostExpensive.price,
//           team:
//             data.mostExpensivePlayer?.team?.shortName ||
//             prev.mostExpensive.team,
//         },
//         currentLot: {
//           id: data.currentPlayerOnBid?._id || prev.currentLot.id,
//           name: data.currentPlayerOnBid?.name || prev.currentLot.name,
//           role: data.currentPlayerOnBid?.role || prev.currentLot.role,
//           batting:
//             data.currentPlayerOnBid?.battingStyle || prev.currentLot.batting,
//           bowling:
//             data.currentPlayerOnBid?.bowlingStyle || prev.currentLot.bowling,
//           basePrice:
//             data.currentPlayerOnBid?.basePrice || prev.currentLot.basePrice,
//           avatarUrl:
//             data.currentPlayerOnBid?.photo || prev.currentLot.avatarUrl,
//         },
//         currentBid: {
//           amount: data.currentBid?.amount || prev.currentBid.amount,
//           team: data.currentBid?.team?.teamName || prev.currentBid.team,
//           teamLogo: data.currentBid?.team?.logoUrl || prev.currentBid.teamLogo,
//         },
//       }));

//       setBiddingStarted(data.biddingStarted || false);
//       setSelectionMode(data.selectionMode || "automatic");
//       setAutomaticFilter(data.automaticFilter || "All");
//       setManualPlayerQueue(data.manualPlayerQueue || []);
//       setCurrentQueuePosition(data.currentQueuePosition || 0);
//       setIsPaused(data.isPaused);

//       if (data.automaticFilter && data.automaticFilter !== "All") {
//         setRole(data.automaticFilter);
//       }

//       if (data.currentBid?.amount !== undefined) {
//         setBidAmount(data.currentBid.amount);
//       } else if (data.currentPlayerOnBid?.basePrice) {
//         setBidAmount(data.currentPlayerOnBid.basePrice);
//       }

//       if (data.status) {
//         setStatus(
//           data.status === "started" || data.status === "live"
//             ? "live"
//             : data.status
//         );
//       }

//       // Fetch queue status after updating auction data
//       await fetchQueueStatus();
//     } catch (err) {
//       console.error("Error while fetching auction:", err);
//     }
//   };

//   const getNextPlayer = async () => {
//     try {
//       const response = await api.get(`/next-player/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error("Error getting next player:", error);
//       return null;
//     }
//   };

//   // Modified useEffect to use the extracted function
//   useEffect(() => {
//     if (incoming.length > 0) {
//       setSelectionMode("manual");
//     }

//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.warn("No auth token found. Cannot fetch auction.");
//       return;
//     }

//     // ❌ Skip fetching if edit popup is open
//     if (showEdit) return;

//     const interval = setInterval(() => {
//       fetchAuctionData();
//     }, 800);

//     return () => clearInterval(interval);
//   }, [id, incoming, showEdit]); // ⬅️ Add showEdit as a dependency

//   // 3. ADD NEW FUNCTION: Update selection mode in backend
//   const updateSelectionMode = async (newMode, filter = "All") => {
//     try {
//       await api.post(`/update-selection-mode/${id}`, {
//         selectionMode: newMode,
//         automaticFilter: filter,
//       });
//       console.log(`Selection mode updated to ${newMode} with filter ${filter}`);
//       await fetchQueueStatus();
//     } catch (error) {
//       console.error("Error updating selection mode:", error);
//     }
//   };

//   const startAutomaticBiddingWithRole = async (selectedRole) => {
//     try {
//       // Get auction data to access selectedPlayers
//       const response = await api.get(`/get-auction/${id}`);
//       const selectedPlayers = response.data.selectedPlayers;

//       if (!selectedPlayers || selectedPlayers.length === 0) {
//         alert("No players available for bidding.");
//         return false;
//       }

//       // If selectedPlayers contains full player objects, filter by role
//       let playerToStart = null;

//       if (
//         selectedPlayers.length > 0 &&
//         typeof selectedPlayers[0] === "object"
//       ) {
//         // Filter by role if player objects are available
//         const playersWithRole = selectedPlayers.filter(
//           (player) => player.role === selectedRole
//         );
//         playerToStart =
//           playersWithRole.length > 0 ? playersWithRole[0] : selectedPlayers[0];
//       } else {
//         // If it's just an array of IDs, take the first one
//         playerToStart = { _id: selectedPlayers[0] };
//       }

//       const playerId = playerToStart._id || playerToStart.id;
//       return await startBiddingWithPlayer(playerId);
//     } catch (error) {
//       console.error("Error in automatic bidding with role:", error);
//       return false;
//     }
//   };

//   // You can also modify the role-based automatic selection if needed
//   // This would be called when automatic mode is selected and a specific role is chosen
//   const handleRoleBasedStart = async () => {
//     if (selectionMode === "automatic") {
//       const success = await startAutomaticBiddingWithRole(role);
//       if (!success) {
//         // Fallback to any available player
//         const firstPlayerId = await getFirstAvailablePlayer();
//         if (firstPlayerId) {
//           await startBiddingWithPlayer(firstPlayerId);
//         }
//       }
//     }
//   };

//   const handleManualSell = async () => {
//     if (!auctionData.currentLot.id || auctionData.currentLot.id === "--/--") {
//       alert("No player currently on bid");
//       return;
//     }

//     try {
//       const response = await api.post(
//         `/manual-sell/${id}/${auctionData.currentLot.id}`
//       );

//       const { nextPlayer, isLastPlayer, biddingEnded, soldTo, amount } =
//         response.data;

//       // Show success message
//       if (biddingEnded || isLastPlayer) {
//         toast.success("Auction completed! No more players available.");
//       } else {
//         toast.success(`Player sold for ₹${amount.toLocaleString()}!`);
//       }

//       if (nextPlayer) {
//         setAuctionData((prev) => ({
//           ...prev,
//           currentLot: {
//             id: nextPlayer._id,
//             name: nextPlayer.name,
//             role: nextPlayer.role,
//             batting: nextPlayer.battingStyle,
//             bowling: nextPlayer.bowlingStyle,
//             basePrice: nextPlayer.basePrice,
//             avatarUrl: nextPlayer.photo,
//           },
//           currentBid: {
//             amount: nextPlayer.basePrice || 0,
//             team: null,
//             teamLogo: null,
//           },
//         }));

//         setBidAmount(nextPlayer.basePrice || 0);

//         if (selectionMode === "manual") {
//           setCurrentQueuePosition((prev) => prev + 1);
//           setQueueDisplay((prev) => ({
//             current: prev.current + 1,
//             total: prev.total,
//           }));
//         }
//       } else {
//         setAuctionData((prev) => ({
//           ...prev,
//           currentLot: {
//             id: "--/--",
//             name: "No more players",
//             role: "--/--",
//             batting: "--/--",
//             bowling: "--/--",
//             basePrice: 0,
//             avatarUrl: null,
//           },
//           currentBid: {
//             amount: 0,
//             team: null,
//             teamLogo: null,
//           },
//         }));
//         setBiddingStarted(false);
//         setStatus("completed");
//         setCanChangeMode(true);
//       }

//       // Refresh state for latest auction snapshot
//       await fetchAuctionData();
//       await fetchQueueStatus();
//     } catch (error) {
//       console.error("Sell error:", error);
//       toast.error("Error selling player.");
//       toast.error(
//         error.response?.data?.error ||
//           "Failed to sell player. Please try again."
//       );
//     }
//   };

//   const handleModeToggle = async (newMode) => {
//     if (!canChangeMode) {
//       if (selectionMode === "manual" && manualPlayerQueue.length > 0) {
//         alert(
//           "Cannot switch to automatic mode while manual queue has players. Please complete the current queue first."
//         );
//       } else {
//         alert("Cannot change mode at this time");
//       }
//       return;
//     }

//     // Additional check for manual to auto switch
//     if (selectionMode === "manual" && newMode === "automatic") {
//       // Check if queue is empty and last player is currently in bid
//       const queueRemaining =
//         manualPlayerQueue.length - currentQueuePosition - 1;
//       if (queueRemaining > 0) {
//         alert(
//           "Cannot switch to automatic mode. Please complete all players in the manual queue first."
//         );
//         return;
//       }
//     }
//     try {
//       const filterToUse = newMode === "automatic" ? role : "All";

//       await api.post(`/update-selection-mode/${id}`, {
//         selectionMode: newMode,
//         automaticFilter: filterToUse,
//       });

//       setSelectionMode(newMode);
//       setAutomaticFilter(filterToUse);

//       // Refresh status after mode change
//       await fetchQueueStatus();

//       if (
//         newMode === "manual" &&
//         (!manualPlayerQueue || manualPlayerQueue.length === 0)
//       ) {
//         // If switching to manual but no queue set, navigate to selection
//         handleManualSelect();
//       }

//       console.log(`Mode changed to ${newMode} with filter ${filterToUse}`);
//     } catch (error) {
//       console.error("Error updating selection mode:", error);
//       alert(error.response?.data?.error || "Failed to update selection mode");
//     }
//   };

//   const handleRoleChange = async (newRole) => {
//     setRole(newRole);

//     if (selectionMode === "automatic") {
//       try {
//         await api.post(`/update-selection-mode/${id}`, {
//           selectionMode: "automatic",
//           automaticFilter: newRole,
//         });

//         setAutomaticFilter(newRole);
//         console.log(`Automatic filter updated to ${newRole}`);

//         // Refresh queue status to get updated player count
//         await fetchQueueStatus();
//       } catch (error) {
//         console.error("Error updating automatic filter:", error);
//       }
//     }
//   };

//   const updateManualQueue = async (playerQueue) => {
//     try {
//       const response = await api.post(`/set-manual-queue/${id}`, {
//         playerQueue,
//       });
//       setManualPlayerQueue(response.data.auction.manualPlayerQueue);

//       // If bidding should start with next player
//       if (response.data.shouldStartNext && response.data.nextPlayer) {
//         setAuctionData((prev) => ({
//           ...prev,
//           currentLot: {
//             id: response.data.nextPlayer._id,
//             name: response.data.nextPlayer.name,
//             role: response.data.nextPlayer.role,
//             batting: response.data.nextPlayer.battingStyle,
//             bowling: response.data.nextPlayer.bowlingStyle,
//             basePrice: response.data.nextPlayer.basePrice,
//             avatarUrl: response.data.nextPlayer.photo,
//           },
//         }));
//       }

//       await fetchQueueStatus();
//       console.log("Manual queue updated successfully");
//     } catch (error) {
//       console.error("Error updating manual queue:", error);
//       alert("Failed to update player queue");
//     }
//   };

//   const handleAddMorePlayers = () => {
//     navigate(`/admin/admin-manual-player-selection/${id}`, {
//       state: {
//         addToExistingQueue: true,
//         currentQueue: manualPlayerQueue,
//         currentPosition: currentQueuePosition,
//       },
//     });
//   };

//   // 4) HANDLERS / UI TOGGLES
//   const toggleFullScreen = () => setFullScreen((fs) => !fs);
//   const onStopBidding = () => setStatus("paused");
//   const onSell = () => setStatus("selling");
//   const onMoveToUnsell = () => setStatus("live");
//   const onEditBid = () => setShowEdit(true);

//   const onApplyBid = async () => {
//     try {
//       setShowEdit(false);

//       await api.patch(`/update-bid/${id}`, {
//         amount: bidAmount,
//       });

//       toast.success("Bid updated!");

//       // ✅ Refresh data manually after update
//       await fetchAuctionData();
//     } catch (error) {
//       console.error("Error updating bid:", error);
//       toast.error("Failed to update bid");
//     }
//   };

//   const onResetBid = () => {
//     setBidAmount(auctionData.currentBid.amount);
//     setShowEdit(false);
//   };

//   const togglePause = async () => {
//     try {
//       await api.patch(`/pause-auction/${id}`, {
//         isPaused: true,
//       });
//       setIsPaused(true);
//       setBiddingStarted(false); // Optional: depends on how you're using it
//     } catch (err) {
//       console.error("Failed to pause/resume:", err);
//     }
//   };

//   useEffect(() => {
//     const checkIsPaused = async () => {
//       try {
//         const res = await api.get(`/get-auction-pause-status/${id}`);
//         const paused = res.data.isPaused;
//         setIsPaused(res.data.isPaused);

//         // setIsPaused(paused);
//         if (paused) setBiddingStarted(false); // disable Start Bidding
//       } catch (err) {
//         console.error("Failed to fetch pause status");
//       }
//     };

//     const interval = setInterval(checkIsPaused, 800);
//     checkIsPaused();

//     return () => clearInterval(interval);
//   }, [id]);

//   const handleManualSelect = () => {
//     console.log("Navigating to manual selection with current queue:", {
//       currentQueue: manualPlayerQueue,
//       currentPosition: currentQueuePosition,
//       addToExistingQueue: biddingStarted && selectionMode === "manual",
//     });

//     navigate(`/admin/admin-manual-player-selection/${id}`, {
//       state: {
//         addToExistingQueue: biddingStarted && selectionMode === "manual",
//         currentQueue: manualPlayerQueue,
//         currentPosition: currentQueuePosition,
//       },
//     });
//   };

//   // 5) RENDER. Everywhere you previously used SAMPLE_AUCTION, use auctionData instead.
//   const containerClasses = [
//     "p-4 text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
//     fullScreen
//       ? "fixed inset-0 z-[9999] overflow-auto"
//       : "relative mx-auto max-w-7xl",
//   ].join(" ");

//   const resetBidToBasePrice = () => {
//     if (
//       auctionData.currentLot.basePrice &&
//       auctionData.currentLot.basePrice !== "--/--"
//     ) {
//       setBidAmount(auctionData.currentLot.basePrice);
//     }
//   };

//   return (
//     <div className={containerClasses + " pt-2 md:pt-4"}>
//       {/* Full-screen toggle */}
//       <div className="flex justify-end mb-3">
//         <button
//           onClick={toggleFullScreen}
//           className="px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-xs sm:text-sm transition-all duration-200"
//         >
//           {fullScreen ? "Exit Full Screen" : "Full Screen"}
//         </button>
//       </div>

//       {/* Responsive grid: 1-col mobile, 4-col md+ */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(85vh-4rem)]">
//         {/* === Left Sidebar (desktop only) === */}
//         <div className="hidden md:flex flex-col space-y-4 md:h-full md:justify-between">
//           <div>
//             {[
//               ["Last Sold", auctionData.lastSold],
//               ["Most Expensive", auctionData.mostExpensive],
//             ].map(([title, info]) => (
//               <motion.div
//                 key={title}
//                 className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 mt-2 text-sm shadow-lg"
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <h4 className="uppercase text-xs font-medium tracking-wider">
//                   {title}
//                 </h4>
//                 <p className="font-semibold text-sm mt-1">{info.name}</p>
//                 <p className="text-xs opacity-80">
//                   {info.price} — {info.team}
//                 </p>
//               </motion.div>
//             ))}
//           </div>

//           {/* Bottom item only on desktop */}
//           <motion.div
//             className="bg-gradient-to-br from-indigo-800 to-blue-700 rounded-xl p-4 text-center shadow-xl"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             <h2 className="font-bold text-lg sm:text-xl">
//               {auctionData.currentLot.name}
//             </h2>
//             <p className="text-sm bg-blue-600/30 inline-block px-2 py-1 rounded-full mt-1">
//               {auctionData.currentLot.role}
//             </p>
//             <div className="mt-3 flex justify-center gap-4">
//               <div>
//                 <span className="text-xs opacity-75">Bat</span>
//                 <p className="text-sm">{auctionData.currentLot.batting}</p>
//               </div>
//               <div>
//                 <span className="text-xs opacity-75">Ball</span>
//                 <p className="text-sm">{auctionData.currentLot.bowling}</p>
//               </div>
//             </div>
//             <p className="mt-3 text-base font-semibold bg-blue-900/50 py-1 rounded-lg">
//               Base Price: {auctionData.currentLot.basePrice}
//             </p>
//           </motion.div>
//         </div>

//         {/* === Center Section === */}
//         <div className="md:col-span-2 flex flex-col items-center space-y-4">
//           {/* Top Buttons */}
//           <div className="flex flex-wrap gap-2 justify-center">
//             <motion.button
//               onClick={() => navigate(`/bidding/players-list/${id}`)}
//               className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Player List
//             </motion.button>

//             <motion.button
//               onClick={() => navigate(`/admin/bidding-teams-list/${id}`)}
//               className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Teams
//             </motion.button>

//             <motion.button
//               onClick={togglePause}
//               className={`w-24 rounded-xl py-2 text-xs sm:text-sm shadow-md transition md:hidden ${
//                 status === "live"
//                   ? "bg-amber-500 hover:bg-amber-600 text-white md:hidden"
//                   : "bg-green-500 hover:bg-green-600 text-white md:hidden"
//               }`}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               {status === "live" ? "Pause Auction" : "Resume Auction"}
//             </motion.button>
//           </div>

//           <div className="flex flex-wrap gap-2 justify-center">
//             <motion.button
//               onClick={onEditBid}
//               className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Edit Bid
//             </motion.button>
//             <motion.button
//               onClick={resetBidToBasePrice}
//               className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-red-700 hover:to-orange-600 text-xs sm:text-sm shadow-md"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Reset Bid
//             </motion.button>
//             {/* <motion.button
//               onClick={handleStartBidding}
//               disabled={biddingStarted}
//               className={`px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md ${
//                 biddingStarted
//                   ? "bg-gray-500 cursor-not-allowed opacity-50"
//                   : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
//               }`}
//               whileHover={!biddingStarted ? { scale: 1.05 } : {}}
//               whileTap={!biddingStarted ? { scale: 0.95 } : {}}
//             >
//               {biddingStarted ? "Bidding Started" : "Start Bidding"}
//             </motion.button> */}

//             <motion.button
//               onClick={handleStartBidding}
//               disabled={biddingStarted && !isPaused}
//               className={`px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md ${
//                 biddingStarted && !isPaused
//                   ? "bg-gray-500 cursor-not-allowed opacity-50"
//                   : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
//               }`}
//               whileHover={!(biddingStarted && !isPaused) ? { scale: 1.05 } : {}}
//               whileTap={!(biddingStarted && !isPaused) ? { scale: 0.95 } : {}}
//             >
//               {biddingStarted && !isPaused
//                 ? "Bidding Started"
//                 : "Start Bidding"}
//             </motion.button>
//           </div>

//           {/* Avatar & Current Bid */}
//           <motion.div
//             className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 text-center w-full max-w-md shadow-xl"
//             initial={{ scale: 0.95 }}
//             animate={{ scale: 1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           >
//             {/* <img src={auctionData.currentBid.logoUrl} alt="player avatar" /> */}
//             <div className="mx-auto mb-4 rounded-full bg-gray-700 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
//               <span className="text-4xl">👤</span>
//             </div>
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ delay: 0.3, type: "spring" }}
//               className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 px-6 py-3 font-bold text-xl sm:text-2xl text-black shadow-lg"
//             >
//               {bidAmount}
//             </motion.div>
//           </motion.div>

//           {/* MOBILE ONLY: Player Details and Bid Team Info side-by-side */}
//           <div className="md:hidden w-full max-w-md grid grid-cols-2 gap-3">
//             {/* Player Details Card */}
//             <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center">
//               <h2 className="font-bold text-sm truncate">
//                 {auctionData.currentLot.name}
//               </h2>
//               <p className="text-xs bg-blue-600/30 inline-block px-2 py-0.5 rounded-full">
//                 {auctionData.currentLot.role}
//               </p>
//               <p className="mt-1 text-[10px] opacity-75">
//                 Bat: {auctionData.currentLot.batting}
//               </p>
//               <p className="text-[10px] opacity-75">
//                 Ball: {auctionData.currentLot.bowling}
//               </p>
//               <p className="mt-1 text-xs font-semibold bg-blue-900/30 py-0.5 rounded">
//                 Base: {auctionData.currentLot.basePrice}
//               </p>
//             </div>

//             {/* Bid Team Info Card */}
//             <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-3 text-center flex flex-col justify-center">
//               <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
//               <p className="text-[10px] opacity-75 mt-1">Bid By</p>
//               <h3 className="text-xs font-semibold truncate">
//                 {auctionData.currentBid.team}
//               </h3>
//             </div>
//           </div>
//           <div className="flex gap-4 mt-4">
//             <motion.button
//               onClick={handleManualSell}
//               className="w-32 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:from-green-700 hover:to-emerald-600 text-sm  sm:text-sm shadow-lg"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               Sell
//             </motion.button>
//             <motion.button
//               onClick={onMoveToUnsell}
//               className=" md:hidden px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-orange-700 hover:to-red-600 text-sm shadow-lg"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Move to Unsell
//             </motion.button>
//           </div>
//         </div>

//         {/* === Right Sidebar (desktop only) === */}
//         <div className="hidden md:flex space-y-4 md:col-span-1 md:h-full md:flex-col md:justify-between">
//           <div className="space-y-3">
//             <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
//               <h3 className="text-sm font-semibold mb-3 text-center">
//                 Player Selection
//               </h3>

//               {/* Main Toggle Switch - Only show when bidding hasn't started */}

//               <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
//                 <motion.div
//                   className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
//                     selectionMode === "automatic"
//                       ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
//                       : "bg-gradient-to-r from-amber-500 to-orange-400"
//                   }`}
//                   animate={{
//                     left: selectionMode === "automatic" ? "0" : "50%",
//                   }}
//                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 />

//                 <button
//                   onClick={() => handleModeToggle("automatic")}
//                   disabled={biddingStarted}
//                   className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                     selectionMode === "automatic"
//                       ? "text-white"
//                       : "text-gray-300"
//                   }`}
//                   whileHover={!biddingStarted ? { scale: 1.05 } : {}}
//                   whileTap={!biddingStarted ? { scale: 0.95 } : {}}
//                 >
//                   Auto
//                 </button>

//                 <button
//                   onClick={() => handleModeToggle("manual")}
//                   disabled={biddingStarted}
//                   className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                     selectionMode === "manual" ? "text-white" : "text-gray-300"
//                   }`}
//                   whileHover={!biddingStarted ? { scale: 1.05 } : {}}
//                   whileTap={!biddingStarted ? { scale: 0.95 } : {}}
//                 >
//                   Manual
//                 </button>
//               </div>

//               {/* Mode change options when bidding has started */}
//               {/* {biddingStarted && (
//                 <div className="p-3 bg-indigo-900/30 rounded-lg">
//                   <p className="text-xs text-center mb-2 text-yellow-300">
//                     Change Selection Mode:
//                   </p>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleModeToggle("automatic")}
//                       className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
//                         selectionMode === "automatic"
//                           ? "bg-emerald-500 text-white"
//                           : "bg-gray-600 text-gray-300 hover:bg-gray-500"
//                       }`}
//                     >
//                       Auto
//                     </button>
//                     <button
//                       onClick={() => handleModeToggle("manual")}
//                       className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
//                         selectionMode === "manual"
//                           ? "bg-amber-500 text-white"
//                           : "bg-gray-600 text-gray-300 hover:bg-gray-500"
//                       }`}
//                     >
//                       Manual
//                     </button>
//                   </div>
//                 </div>
//               )} */}

//               {/* Role Selector for Automatic Mode */}
//               {selectionMode === "automatic" && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   transition={{ duration: 0.3 }}
//                   className="mt-3"
//                 >
//                   <label className="text-xs block mb-1 opacity-80">
//                     Select Role:
//                   </label>
//                   <select
//                     value={role}
//                     onChange={(e) => handleRoleChange(e.target.value)}
//                     className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="All">All</option>
//                     <option value="Batsman">Batsman</option>
//                     <option value="Bowler">Bowler</option>
//                     <option value="All-Rounder">All-Rounder</option>
//                     <option value="Wicket-keeper">Wicket-keeper</option>
//                   </select>
//                 </motion.div>
//               )}

//               {/* Queue Status Display for Manual Mode */}
//               {selectionMode === "manual" && manualPlayerQueue.length > 0 && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   transition={{ duration: 0.3 }}
//                   className="mt-3 p-2 bg-amber-900/30 rounded-lg"
//                 >
//                   <p className="text-xs text-center text-amber-300">
//                     Queue: {currentQueuePosition + 1} of{" "}
//                     {manualPlayerQueue.length}
//                   </p>
//                   {manualPlayerQueue.length - currentQueuePosition <= 2 && (
//                     <p className="text-xs text-center text-red-300 mt-1">
//                       Queue running low! Add more players.
//                     </p>
//                   )}
//                   <button
//                     onClick={handleManualSelect}
//                     className="w-full mt-2 px-2 py-1 bg-amber-600 hover:bg-amber-700 rounded text-xs"
//                   >
//                     Add More Players
//                   </button>
//                 </motion.div>
//               )}
//             </div>

//             <motion.button
//               onClick={onMoveToUnsell}
//               className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:from-purple-700 hover:to-indigo-600 text-sm shadow-lg"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Move to Unsell
//             </motion.button>
//             {/* <motion.button
//               onClick={togglePause}
//               className={`w-full px-4 py-2 rounded text-xs sm:text-sm shadow-md transition ${
//                 status === "live"
//                   ? "bg-amber-500 hover:bg-amber-600 text-white"
//                   : "bg-green-500 hover:bg-green-600 text-white"
//               }`}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Pause Auction
//             </motion.button> */}

//             <motion.button
//               onClick={togglePause}
//               disabled={isPaused || !biddingStarted}
//               className={`w-full px-4 py-2 rounded text-xs sm:text-sm shadow-md transition ${
//                 isPaused
//                   ? "bg-gray-600 text-white cursor-not-allowed"
//                   : "bg-amber-500 hover:bg-amber-600 text-white"
//               }`}
//               whileHover={!isPaused ? { scale: 1.02 } : {}}
//               whileTap={!isPaused ? { scale: 0.98 } : {}}
//             >
//               {isPaused ? "Paused Auction" : "Pause Auction"}
//             </motion.button>
//           </div>

//           <motion.div
//             className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 text-center shadow-lg"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             {auctionData.currentBid.teamLogo ? (
//               <img
//                 src={auctionData.currentBid.teamLogo}
//                 alt="Team Logo"
//                 className="w-16 h-16 rounded-xl object-contain mx-auto border-2"
//               />
//             ) : (
//               <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
//             )}
//             <p className="text-xs sm:text-sm opacity-75 mt-2">Bid By</p>
//             <h3 className="text-sm sm:text-base font-semibold mt-1">
//               {auctionData.currentBid.team}
//             </h3>
//           </motion.div>
//         </div>
//       </div>

//       {/* === Mobile-only Bottom Section === */}
//       <div className="md:hidden mt-4 space-y-4">
//         <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
//           <h3 className="text-sm font-semibold mb-3 text-center">
//             Player Selection
//           </h3>

//           {/* Mobile Toggle - Only show when bidding hasn't started */}
//           {!biddingStarted && (
//             <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
//               <motion.div
//                 className={`absolute top-0 h-full w-1/2 rounded-full z-0 ${
//                   selectionMode === "automatic"
//                     ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
//                     : "bg-gradient-to-r from-amber-500 to-orange-400"
//                 }`}
//                 animate={{
//                   left: selectionMode === "automatic" ? "0" : "50%",
//                 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//               />

//               <button
//                 onClick={() => handleModeToggle("automatic")}
//                 className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                   selectionMode === "automatic" ? "text-white" : "text-gray-300"
//                 }`}
//               >
//                 Auto
//               </button>

//               <button
//                 onClick={() => handleModeToggle("manual")}
//                 className={`relative h-full w-1/2 z-10 text-sm font-medium ${
//                   selectionMode === "manual" ? "text-white" : "text-gray-300"
//                 }`}
//               >
//                 Manual
//               </button>
//             </div>
//           )}

//           {/* Mobile mode change options when bidding has started */}
//           {biddingStarted && (
//             <div className="p-3 bg-indigo-900/30 rounded-lg">
//               <p className="text-xs text-center mb-2 text-yellow-300">
//                 Change Selection Mode:
//               </p>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleModeToggle("automatic")}
//                   disabled={!canChangeMode}
//                   className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
//                     selectionMode === "automatic"
//                       ? "bg-emerald-500 text-white"
//                       : canChangeMode
//                       ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
//                       : "bg-gray-800 text-gray-600 cursor-not-allowed"
//                   }`}
//                 >
//                   Auto
//                 </button>
//                 <button
//                   onClick={() => handleModeToggle("manual")}
//                   disabled={!canChangeMode}
//                   className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
//                     selectionMode === "manual"
//                       ? "bg-amber-500 text-white"
//                       : canChangeMode
//                       ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
//                       : "bg-gray-800 text-gray-600 cursor-not-allowed"
//                   }`}
//                 >
//                   Manual
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Mobile Role Selector */}
//           {selectionMode === "automatic" && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               transition={{ duration: 0.3 }}
//               className="mt-3"
//             >
//               <label className="text-xs block mb-1 opacity-80">
//                 Select Role:
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => handleRoleChange(e.target.value)}
//                 className="w-full rounded-full bg-indigo-800/50 border border-indigo-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All</option>
//                 <option value="Batsman">Batsman</option>
//                 <option value="Bowler">Bowler</option>
//                 <option value="All-Rounder">All-Rounder</option>
//                 <option value="Wicket-keeper">Wicket-keeper</option>
//               </select>
//             </motion.div>
//           )}

//           {/* Mobile Queue Status */}
//           {selectionMode === "manual" && manualPlayerQueue.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               transition={{ duration: 0.3 }}
//               className="mt-3 p-2 bg-amber-900/30 rounded-lg"
//             >
//               <p className="text-xs text-center text-amber-300">
//                 Queue: {queueDisplay.current} by {queueDisplay.total}
//               </p>
//               {queueDisplay.current === queueDisplay.total && (
//                 <p className="text-xs text-center text-red-300 mt-1">
//                   Add more players - Queue running low!
//                 </p>
//               )}
//               <button
//                 onClick={handleAddMorePlayers}
//                 className="w-full mt-2 px-2 py-1 bg-amber-600 hover:bg-amber-700 rounded text-xs"
//               >
//                 Add More Players in Queue
//               </button>
//             </motion.div>
//           )}
//         </div>

//         <div className="flex gap-3">
//           {[
//             ["Last Sold", auctionData.lastSold],
//             ["Most Expensive", auctionData.mostExpensive],
//           ].map(([title, info]) => (
//             <motion.div
//               key={title}
//               className="flex-1 bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-2 text-xs shadow-md"
//               whileHover={{ scale: 1.02 }}
//             >
//               <h4 className="uppercase text-[10px] font-medium opacity-80">
//                 {title}
//               </h4>
//               <p className="font-semibold text-xs truncate mt-1">{info.name}</p>
//               <p className="text-[10px] opacity-75">
//                 {info.price} — {info.team}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Start Bidding Popup */}
//       {showStartPopup && (
//         <motion.div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 px-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="w-full max-w-sm space-y-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-2xl"
//             initial={{ scale: 0.9, y: 20 }}
//             animate={{ scale: 1, y: 0 }}
//             transition={{ type: "spring" }}
//           >
//             <h2 className="text-lg font-bold text-center">
//               Select Player Selection Mode
//             </h2>

//             <div className="flex gap-4 justify-center my-4">
//               <motion.button
//                 onClick={() => setPopupSelection("manual")}
//                 className={`px-4 py-2 rounded-xl transition ${
//                   popupSelection === "manual"
//                     ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white"
//                     : "bg-gray-700 hover:bg-gray-600"
//                 }`}
//                 whileHover={{ scale: 1.05 }}
//               >
//                 Manual
//               </motion.button>

//               <motion.button
//                 onClick={() => setPopupSelection("automatic")}
//                 className={`px-4 py-2 rounded-xl transition ${
//                   popupSelection === "automatic"
//                     ? "bg-gradient-to-r from-emerald-500 to-cyan-400 text-white"
//                     : "bg-gray-700 hover:bg-gray-600"
//                 }`}
//                 whileHover={{ scale: 1.05 }}
//               >
//                 Automatic
//               </motion.button>
//             </div>

//             {/* Show role selector for automatic mode in popup */}
//             {popupSelection === "automatic" && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 transition={{ duration: 0.3 }}
//                 className="mt-3"
//               >
//                 <label className="text-xs block mb-2 opacity-80">
//                   Select Role Filter:
//                 </label>
//                 <select
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                   className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="All">All</option>
//                   <option value="Batsman">Batsman</option>
//                   <option value="Bowler">Bowler</option>
//                   <option value="All-Rounder">All-Rounder</option>
//                   <option value="Wicket-keeper">Wicket-keeper</option>
//                 </select>
//               </motion.div>
//             )}
//             {popupSelection === "manual" && incoming.length === 0 && (
//               <div className="text-center p-3 bg-amber-900/30 rounded-lg">
//                 <p className="text-xs text-amber-300 mb-2">
//                   No players selected for manual mode
//                 </p>
//                 {/* <button
//                   onClick={() => {
//                     setShowStartPopup(false);
//                     handleManualSelect();
//                   }}
//                   className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-xs"
//                 >
//                   Select Players First
//                 </button> */}
//               </div>
//             )}

//             <div className="flex gap-3">
//               <motion.button
//                 onClick={handleSaveStartSelection}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 hover:from-green-700 hover:to-emerald-600 text-sm font-medium shadow-md"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Save
//               </motion.button>

//               <motion.button
//                 onClick={() => setShowStartPopup(false)}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-2 hover:from-gray-700 hover:to-gray-600 text-sm font-medium shadow-md"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Cancel
//               </motion.button>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}

//       {/* --- Edit Bid Modal --- */}
//       {showEdit && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           <motion.div
//             className="w-full max-w-sm space-y-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-2xl"
//             initial={{ scale: 0.9, y: 20 }}
//             animate={{ scale: 1, y: 0 }}
//             transition={{ type: "spring" }}
//           >
//             <h2 className="text-lg font-bold text-center">Edit Bid</h2>
//             <input
//               type="text"
//               value={bidAmount}
//               onChange={(e) => setBidAmount(e.target.value)}
//               className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <div className="flex gap-3">
//               <motion.button
//                 onClick={onApplyBid}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 hover:from-green-700 hover:to-emerald-600 text-sm font-medium shadow-md"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Apply
//               </motion.button>
//               <motion.button
//                 onClick={() => setShowEdit(false)}
//                 className="flex-1 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-2 hover:from-gray-700 hover:to-gray-600 text-sm font-medium shadow-md"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Cancel
//               </motion.button>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }







///////////////////////////////////////////////////////////////////////////////////////////////////////////










import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../../userManagement/Api";
import { toast } from "react-hot-toast";

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
  const { id } = useParams();

  // 2) STATE: hold ALL auction‐related fields in a single object
  //    Initialize with SAMPLE so the UI doesn’t break if the fetch is still pending.
  const [auctionData, setAuctionData] = useState(SAMPLE_AUCTION);

  // status / UI state
  const [status, setStatus] = useState("live");
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

  const [showStartPopup, setShowStartPopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [popupSelection, setPopupSelection] = useState("automatic");
  const [showAddMorePlayers, setShowAddMorePlayers] = useState(false);
  const [queueDisplay, setQueueDisplay] = useState({ current: 0, total: 0 });

  const handleStartBidding = async () => {
    setShowStartPopup(true);

    try {
      await api.patch(`/pause-auction/${id}`, {
        isPaused: false,
      });
      setIsPaused(false);
    } catch (error) {
      console.error("Error starting bidding:", error);
      alert("Internal server error");
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const response = await api.get(`/queue-status/${id}`);
      const data = response.data;

      console.log("Fetched queue status:", data);

      setCanChangeMode(data.canChangeMode);
      setBiddingStarted(data.biddingStarted);
      setSelectionMode(data.selectionMode);
      setAutomaticFilter(data.automaticFilter);

      // Update current queue position
      const currentPos = data.currentQueuePosition;
      setCurrentQueuePosition(currentPos);

      // Update manual player queue
      const manualQueue = data.manualPlayerQueue || [];
      setManualPlayerQueue(manualQueue);

      // Update queue display for manual mode
      if (data.selectionMode === "manual" && manualQueue.length > 0) {
        const queueDisplay = {
          current: Math.max(1, currentPos + 1), // Ensure at least 1
          total: manualQueue.length,
        };

        console.log("Queue display updated:", queueDisplay);
        setQueueDisplay(queueDisplay);

        // Show add more players option when queue is running low
        const remainingPlayers = manualQueue.length - currentPos - 1;
        setShowAddMorePlayers(remainingPlayers <= 1);

        console.log("Remaining players in queue:", remainingPlayers);
      } else {
        // Reset queue display for automatic mode
        setQueueDisplay({ current: 0, total: 0 });
        setShowAddMorePlayers(false);
      }

      // Update current player if available
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
      // Use the backend's start-bidding route instead of passing playerId
      const response = await api.post(`/start-bidding/${id}`, {
        selectionMode: selectionMode,
        automaticFilter: automaticFilter,
      });

      console.log("Bidding started successfully:", response.data);

      // Update local state based on backend response
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
      // First check if we have incoming players (manual selection)
      if (incoming.length > 0) {
        return incoming[0]?.id || incoming[0]?._id;
      }

      // Otherwise, get from auction's selectedPlayers
      const response = await api.get(`/get-auction/${id}`);
      const selectedPlayers = response.data.selectedPlayers;

      if (selectedPlayers && selectedPlayers.length > 0) {
        // If it's an array of IDs, return the first one
        if (typeof selectedPlayers[0] === "string") {
          return selectedPlayers[0];
        }
        // If it's an array of objects, return the _id
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

      // Update selection mode first
      await updateSelectionMode(popupSelection, filterToUse);

      setSelectionMode(popupSelection);
      setAutomaticFilter(filterToUse);

      if (popupSelection === "manual") {
        if (incoming.length > 0) {
          // Set up manual queue with proper numbering
          const playerQueue = incoming.map((player, index) => ({
            player: player.id || player._id,
            position: index + 1,
            playerData: player, // Store full player data for queue display
          }));

          await api.post(`/set-manual-queue/${id}`, { playerQueue });
          setManualPlayerQueue(playerQueue);
          setQueueDisplay({ current: 1, total: playerQueue.length });
        }

        // Start bidding with manual mode
        const success = await startBiddingWithPlayer();
        if (success) {
          setBiddingStarted(true);
          setCanChangeMode(false); // Disable mode switching once started
          setShowStartPopup(false);
          return;
        }
      } else if (popupSelection === "automatic") {
        // Use the specific backend route for automatic bidding
        const response = await api.post(`/start-automatic-bidding/${id}`, {
          automaticFilter: filterToUse,
        });

        console.log("Automatic bidding started:", response.data);

        // Update state with response data
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
        setCanChangeMode(false); // Disable mode switching once started
        setShowStartPopup(false);
        await fetchQueueStatus();
        return;
      }
      await api.patch(`/pause-auction/${id}`, {
        isPaused: false,
      });
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
      const res = await api.get(`/get-auction/${id}`);
      const data = res.data;
      console.log("Fetched auction data:", data);

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
          avatarUrl:
            data.currentPlayerOnBid?.photo || prev.currentLot.avatarUrl,
        },
        currentBid: {
          amount: data.currentBid?.amount || prev.currentBid.amount,
          team: data.currentBid?.team?.teamName || prev.currentBid.team,
          teamLogo: data.currentBid?.team?.logoUrl || prev.currentBid.teamLogo,
        },
      }));

      setBiddingStarted(data.biddingStarted || false);
      setSelectionMode(data.selectionMode || "automatic");
      setAutomaticFilter(data.automaticFilter || "All");
      setManualPlayerQueue(data.manualPlayerQueue || []);
      setCurrentQueuePosition(data.currentQueuePosition || 0);
      setIsPaused(data.isPaused);

      if (data.automaticFilter && data.automaticFilter !== "All") {
        setRole(data.automaticFilter);
      }

      if (data.bidAmount?.amount!== undefined) {
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

      // Fetch queue status after updating auction data
      await fetchQueueStatus();
    } catch (err) {
      console.error("Error while fetching auction:", err);
    }
  };

  const getNextPlayer = async () => {
    try {
      const response = await api.get(`/next-player/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting next player:", error);
      return null;
    }
  };

  // Modified useEffect to use the extracted function
  useEffect(() => {
    if (incoming.length > 0) {
      setSelectionMode("manual");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found. Cannot fetch auction.");
      return;
    }

    // ❌ Skip fetching if edit popup is open
    if (showEdit) return;

    const interval = setInterval(() => {
      fetchAuctionData();
    }, 800);

    return () => clearInterval(interval);
  }, [id, incoming, showEdit]); // ⬅️ Add showEdit as a dependency

  // 3. ADD NEW FUNCTION: Update selection mode in backend
  const updateSelectionMode = async (newMode, filter = "All") => {
    try {
      await api.post(`/update-selection-mode/${id}`, {
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
      // Get auction data to access selectedPlayers
      const response = await api.get(`/get-auction/${id}`);
      const selectedPlayers = response.data.selectedPlayers;

      if (!selectedPlayers || selectedPlayers.length === 0) {
        alert("No players available for bidding.");
        return false;
      }

      // If selectedPlayers contains full player objects, filter by role
      let playerToStart = null;

      if (
        selectedPlayers.length > 0 &&
        typeof selectedPlayers[0] === "object"
      ) {
        // Filter by role if player objects are available
        const playersWithRole = selectedPlayers.filter(
          (player) => player.role === selectedRole
        );
        playerToStart =
          playersWithRole.length > 0 ? playersWithRole[0] : selectedPlayers[0];
      } else {
        // If it's just an array of IDs, take the first one
        playerToStart = { _id: selectedPlayers[0] };
      }

      const playerId = playerToStart._id || playerToStart.id;
      return await startBiddingWithPlayer(playerId);
    } catch (error) {
      console.error("Error in automatic bidding with role:", error);
      return false;
    }
  };

  // You can also modify the role-based automatic selection if needed
  // This would be called when automatic mode is selected and a specific role is chosen
  const handleRoleBasedStart = async () => {
    if (selectionMode === "automatic") {
      const success = await startAutomaticBiddingWithRole(role);
      if (!success) {
        // Fallback to any available player
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
      const response = await api.post(
        `/manual-sell/${id}/${auctionData.currentLot.id}`
      );

      const { nextPlayer, isLastPlayer, biddingEnded, soldTo, amount } =
        response.data;

      // Show success message
      if (biddingEnded || isLastPlayer) {
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

      // Refresh state for latest auction snapshot
      await fetchAuctionData();
      await fetchQueueStatus();
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

    // Additional check for manual to auto switch
    if (selectionMode === "manual" && newMode === "automatic") {
      // Check if queue is empty and last player is currently in bid
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

      await api.post(`/update-selection-mode/${id}`, {
        selectionMode: newMode,
        automaticFilter: filterToUse,
      });

      setSelectionMode(newMode);
      setAutomaticFilter(filterToUse);

      // Refresh status after mode change
      await fetchQueueStatus();

      if (
        newMode === "manual" &&
        (!manualPlayerQueue || manualPlayerQueue.length === 0)
      ) {
        // If switching to manual but no queue set, navigate to selection
        handleManualSelect();
      }

      console.log(`Mode changed to ${newMode} with filter ${filterToUse}`);
    } catch (error) {
      console.error("Error updating selection mode:", error);
      alert(error.response?.data?.error || "Failed to update selection mode");
    }
  };

  const handleRoleChange = async (newRole) => {
    setRole(newRole);

    if (selectionMode === "automatic") {
      try {
        await api.post(`/update-selection-mode/${id}`, {
          selectionMode: "automatic",
          automaticFilter: newRole,
        });

        setAutomaticFilter(newRole);
        console.log(`Automatic filter updated to ${newRole}`);

        // Refresh queue status to get updated player count
        await fetchQueueStatus();
      } catch (error) {
        console.error("Error updating automatic filter:", error);
      }
    }
  };

  const updateManualQueue = async (playerQueue) => {
    try {
      const response = await api.post(`/set-manual-queue/${id}`, {
        playerQueue,
      });
      setManualPlayerQueue(response.data.auction.manualPlayerQueue);

      // If bidding should start with next player
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
      console.log("Manual queue updated successfully");
    } catch (error) {
      console.error("Error updating manual queue:", error);
      alert("Failed to update player queue");
    }
  };

  const handleAddMorePlayers = () => {
    navigate(`/admin/admin-manual-player-selection/${id}`, {
      state: {
        addToExistingQueue: true,
        currentQueue: manualPlayerQueue,
        currentPosition: currentQueuePosition,
      },
    });
  };

  // 4) HANDLERS / UI TOGGLES
  const toggleFullScreen = () => setFullScreen((fs) => !fs);
  const onStopBidding = () => setStatus("paused");
  const onSell = () => setStatus("selling");
  const onMoveToUnsell = () => setStatus("live");
  const onEditBid = () => setShowEdit(true);

  const onApplyBid = async () => {
    try {
      setShowEdit(false);

      await api.patch(`/update-bid/${id}`, {
        amount: bidAmount,
      });

      toast.success("Bid updated!");

      // ✅ Refresh data manually after update
      await fetchAuctionData();
    } catch (error) {
      console.error("Error updating bid:", error);
      toast.error("Failed to update bid");
    }
  };

  const onResetBid = () => {
    setBidAmount(auctionData.currentBid.amount);
    setShowEdit(false);
  };

  const togglePause = async () => {
    try {
      const response = await api.patch(`/pause-auction/${id}`, {
        isPaused: true,
      });
  
      console.log(response.data.message); // You can show this as a toast or alert
      setIsPaused(true);
      setBiddingStarted(false); // Optional
      toast.success("Auction Paused");
    } catch (err) {
      toast.error("Failed to pause/resume:", err);
  
      // Extract and show backend message
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error("An unexpected error occurred while pausing the auction.");
      }
    }
  };
  

  useEffect(() => {
    const checkIsPaused = async () => {
      try {
        const res = await api.get(`/get-auction-pause-status/${id}`);
        const paused = res.data.isPaused;
        setIsPaused(res.data.isPaused);

        // setIsPaused(paused);
        if (paused) setBiddingStarted(false); // disable Start Bidding
      } catch (err) {
        console.error("Failed to fetch pause status");
      }
    };

    const interval = setInterval(checkIsPaused, 800);
    checkIsPaused();

    return () => clearInterval(interval);
  }, [id]);

  const handleManualSelect = () => {
    console.log("Navigating to manual selection with current queue:", {
      currentQueue: manualPlayerQueue,
      currentPosition: currentQueuePosition,
      addToExistingQueue: biddingStarted && selectionMode === "manual",
    });

    navigate(`/admin/admin-manual-player-selection/${id}`, {
      state: {
        addToExistingQueue: biddingStarted && selectionMode === "manual",
        currentQueue: manualPlayerQueue,
        currentPosition: currentQueuePosition,
      },
    });
  };

const handleEndAuction = async () => {
    try {
      const res = await api.patch(`/end-auction/${auctionId}`)
      toast.success(res.data.message || 'Auction ended')
      // inform parent to refresh or navigate away
      onAuctionEnded && onAuctionEnded()
    } catch (err) {
      console.error('End-auction error:', err)
      toast.error(err.response?.data?.error || 'Failed to end auction')
    }
  }


  // 5) RENDER. Everywhere you previously used SAMPLE_AUCTION, use auctionData instead.
  const containerClasses = [
    "p-4 text-white bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900",
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
      {/* Responsive grid: 1-col mobile, 4-col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(85vh-4rem)]">
        {/* === Left Sidebar (desktop only) === */}
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

          {/* Bottom item only on desktop */}
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

        {/* === Center Section === */}
        <div className="md:col-span-2 flex flex-col items-center space-y-4">
          {/* Top Buttons */}
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

            <motion.button
              onClick={togglePause}
              className={`w-24 rounded-xl py-2 text-xs sm:text-sm shadow-md transition md:hidden ${
                status === "live"
                  ? "bg-amber-500 hover:bg-amber-600 text-white md:hidden"
                  : "bg-green-500 hover:bg-green-600 text-white md:hidden"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === "live" ? "Pause Auction" : "Resume Auction"}
            </motion.button>
            
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              onClick={onEditBid}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:from-indigo-700 hover:to-blue-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit Bid
            </motion.button>
            <motion.button
              onClick={resetBidToBasePrice}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-red-700 hover:to-orange-600 text-xs sm:text-sm shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset Bid
            </motion.button>
            {/* <motion.button
              onClick={handleStartBidding}
              disabled={biddingStarted}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md ${
                biddingStarted
                  ? "bg-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              }`}
              whileHover={!biddingStarted ? { scale: 1.05 } : {}}
              whileTap={!biddingStarted ? { scale: 0.95 } : {}}
            >
              {biddingStarted ? "Bidding Started" : "Start Bidding"}
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

          {/* Avatar & Current Bid */}
          <motion.div
            className="bg-gradient-to-br from-indigo-800/50 to-blue-700/50 rounded-xl p-6 text-center w-full max-w-md shadow-xl"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* <img src={auctionData.currentBid.logoUrl} alt="player avatar" /> */}
            <div className="mx-auto mb-4 rounded-full bg-gray-700 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
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
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
              <p className="text-[10px] opacity-75 mt-1">Bid By</p>
              <h3 className="text-xs font-semibold truncate">
                {auctionData.currentBid.team}
              </h3>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <motion.button
              onClick={handleManualSell}
              className="w-32 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:from-green-700 hover:to-emerald-600 text-sm  sm:text-sm shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sell
            </motion.button>
            <motion.button
              onClick={onMoveToUnsell}
              className=" md:hidden px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-orange-700 hover:to-red-600 text-sm shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Move to Unsell
            </motion.button>
          </div>
        </div>

        {/* === Right Sidebar (desktop only) === */}
        <div className="hidden md:flex space-y-4 md:col-span-1 md:h-full md:flex-col md:justify-between">
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold mb-3 text-center">
                Player Selection
              </h3>

              {/* Main Toggle Switch - Only show when bidding hasn't started */}

              <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
                <motion.div
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
                  whileHover={!biddingStarted ? { scale: 1.05 } : {}}
                  whileTap={!biddingStarted ? { scale: 0.95 } : {}}
                >
                  Auto
                </button>

                <button
                  onClick={() => handleModeToggle("manual")}
                  disabled={biddingStarted}
                  className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                    selectionMode === "manual" ? "text-white" : "text-gray-300"
                  }`}
                  whileHover={!biddingStarted ? { scale: 1.05 } : {}}
                  whileTap={!biddingStarted ? { scale: 0.95 } : {}}
                >
                  Manual
                </button>
              </div>

              {/* Mode change options when bidding has started */}
              {/* {biddingStarted && (
                <div className="p-3 bg-indigo-900/30 rounded-lg">
                  <p className="text-xs text-center mb-2 text-yellow-300">
                    Change Selection Mode:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModeToggle("automatic")}
                      className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                        selectionMode === "automatic"
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => handleModeToggle("manual")}
                      className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                        selectionMode === "manual"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>
              )} */}

              {/* Role Selector for Automatic Mode */}
              {selectionMode === "automatic" && (
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
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                  </select>
                </motion.div>
              )}

              {/* Queue Status Display for Manual Mode */}
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
              )}
            </div>

            <motion.button
              onClick={onMoveToUnsell}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:from-purple-700 hover:to-indigo-600 text-sm shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Move to Unsell
            </motion.button>
            {/* <motion.button
              onClick={togglePause}
              className={`w-full px-4 py-2 rounded text-xs sm:text-sm shadow-md transition ${
                status === "live"
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Pause Auction
            </motion.button> */}

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
                         <motion.button
        className="w-32 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        // onClick={handleEndAuction}
      >
        End Auction
      </motion.button>

          </div>

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
              {auctionData.currentBid.team} <p className="text-xs sm:text-sm opacity-75 mt-2">₹{auctionData.currentBid.amount}</p>
            </h3>
          </motion.div>
          
        </div>
      </div>

      {/* === Mobile-only Bottom Section === */}
      <div className="md:hidden mt-4 space-y-4">
        <div className="bg-gradient-to-r from-indigo-900/50 to-blue-800/50 rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-semibold mb-3 text-center">
            Player Selection
          </h3>

          {/* Mobile Toggle - Only show when bidding hasn't started */}
          {!biddingStarted && (
            <div className="relative h-10 w-full bg-indigo-800/30 rounded-full overflow-hidden">
              <motion.div
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
              </button>

              <button
                onClick={() => handleModeToggle("manual")}
                className={`relative h-full w-1/2 z-10 text-sm font-medium ${
                  selectionMode === "manual" ? "text-white" : "text-gray-300"
                }`}
              >
                Manual
              </button>
            </div>
          )}

          {/* Mobile mode change options when bidding has started */}
          {biddingStarted && (
            <div className="p-3 bg-indigo-900/30 rounded-lg">
              <p className="text-xs text-center mb-2 text-yellow-300">
                Change Selection Mode:
              </p>
              <div className="flex gap-2">
                <button
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
                </button>
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

          {/* Mobile Role Selector */}
          {selectionMode === "automatic" && (
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
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-keeper">Wicket-keeper</option>
              </select>
            </motion.div>
          )}

          {/* Mobile Queue Status */}
          {selectionMode === "manual" && manualPlayerQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-2 bg-amber-900/30 rounded-lg"
            >
              <p className="text-xs text-center text-amber-300">
                Queue: {queueDisplay.current} by {queueDisplay.total}
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

        <div className="flex gap-3">
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

              <motion.button
                onClick={() => setPopupSelection("automatic")}
                className={`px-4 py-2 rounded-xl transition ${
                  popupSelection === "automatic"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400 text-white"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                Automatic
              </motion.button>
            </div>

            {/* Show role selector for automatic mode in popup */}
            {popupSelection === "automatic" && (
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
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </select>
              </motion.div>
            )}
            {popupSelection === "manual" && incoming.length === 0 && (
              <div className="text-center p-3 bg-amber-900/30 rounded-lg">
                <p className="text-xs text-amber-300 mb-2">
                  No players selected for manual mode
                </p>
                {/* <button
                  onClick={() => {
                    setShowStartPopup(false);
                    handleManualSelect();
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-xs"
                >
                  Select Players First
                </button> */}
              </div>
            )}

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

      {/* --- Edit Bid Modal --- */}
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
            <input
              type="text"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full rounded-xl bg-gray-700 border border-gray-600 px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
