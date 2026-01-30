// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const compression = require("compression");
// const cors = require("cors");
// const helmet = require("helmet");
// const path = require("path");

// const personRoutes = require("./Routes/personRoutes");
// const playerRoutes = require("./Routes/playerRoutes");
// const teamRoutes = require("./Routes/teamRoutes");
// const auctionRoutes = require("./Routes/auctionRoutes");
// const dashboardRoutes = require("./Routes/dasboardRoutes");
// const biddingRoutes = require("./Routes/biddingRoutes");

// const app = express();
// const PORT = process.env.PORT;

// // ── Optimization: Allowed Origins at top ─────────────
// const allowedOrigins = [
//   "https://cricbid.sytes.net",
//   "https://cricket-bidding-website.vercel.app",
//   "https://cricket-bidding-website-odez3nm7q.vercel.app",
//   "http://localhost:5173",
// ];

// // ── Express Middleware (Fast Setup Order) ─────────────
// app.use(helmet()); // Secure headers
// app.use(compression()); // Gzip compression
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));
// app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// // Express example
// app.get("/", (req, res) => {
//   res.status(200).send("OK");
// });

// // ── MongoDB Connect ───────────────────────────────
// mongoose.connect(process.env.MONGO_URI || "mongodb+srv://dasabhi1910:iamf00L@cricket-bidding.dugejrq.mongodb.net/", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("MongoDB connected successfully."))
// .catch((err) => console.error("MongoDB connection error:", err));

// // ── Routes ───────────────────────────────────────
// app.use("/", personRoutes);
// app.use("/", playerRoutes);
// app.use("/", teamRoutes);
// app.use("/", auctionRoutes);
// app.use("/", dashboardRoutes);
// app.use("/", biddingRoutes);

// // ── Socket.IO Setup ───────────────────────────────
// const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");

// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
//     credentials: true,
//   },
// });

// app.set("io", io);

// io.on("connection", (socket) => {
//   console.log("A client connected");

//   socket.on("join-auction", (auctionId) => {
//     socket.join(auctionId);
//     console.log(`Socket joined room ${auctionId}`);
//   });

//   socket.on("timer:expired", ({ auctionId }) => {
//     console.log(`Timer expired for auction ${auctionId}`);
//     io.to(auctionId).emit("timer:expired", { auctionId });
//   });

//   socket.on("leave-auction", (auctionId) => {
//     socket.leave(auctionId);
//     console.log(`Socket left room ${auctionId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// // ── Start Server ─────────────────────────────────
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

require("dotenv").config(); // MUST BE LINE 1
const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

// Route Imports
const personRoutes = require("./Routes/personRoutes");
const playerRoutes = require("./Routes/playerRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const auctionRoutes = require("./Routes/auctionRoutes");
const dashboardRoutes = require("./Routes/dasboardRoutes");
const biddingRoutes = require("./Routes/biddingRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// ── 1. CORS CONFIGURATION ────────────────────────────
const allowedOrigins = [
  "https://cricbid.sytes.net",
  "https://cricket-bidding-website-ow8tnxsrv.vercel.app",
  "https://cricket-bidding-website-beta.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server or Postman (no origin)
    if (!origin) return callback(null, true);

    const isWhitelisted = allowedOrigins.includes(origin);
    // Flexible check for Vercel deployment URLs
    const isVercel = origin.includes("vercel.app") && origin.includes("cricket-bidding-website");

    if (isWhitelisted || isVercel) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS policy: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200, 
};

// ── 2. MIDDLEWARE STACK (ORDER MATTERS) ──────────────

// Essential for performance
app.use(compression());

// Handle Preflight (OPTIONS) requests globally before routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

// Security headers (adjusted for cross-origin resources)
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable if you're hitting issues with frontend scripts
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── 3. DATABASE CONNECTION ──────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dasabhi1910:iamf00L@cricket-bidding.dugejrq.mongodb.net/";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ── 4. ROUTES ───────────────────────────────────────
app.use("/", personRoutes);
app.use("/", playerRoutes);
app.use("/", teamRoutes);
app.use("/", auctionRoutes);
app.use("/", dashboardRoutes);
app.use("/", biddingRoutes);

app.get("/", (req, res) => res.status(200).send("Server Active"));

// ── 5. SOCKET.IO & SERVER ───────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions, // Uses the same strict rules as the REST API
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on("join-auction", (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction: ${auctionId}`);
  });

  socket.on("timer:expired", ({ auctionId }) => {
    io.to(auctionId).emit("timer:expired", { auctionId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});