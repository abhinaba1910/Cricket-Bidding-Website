
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





require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

const personRoutes = require("./Routes/personRoutes");
const playerRoutes = require("./Routes/playerRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const auctionRoutes = require("./Routes/auctionRoutes");
const dashboardRoutes = require("./Routes/dasboardRoutes");
const biddingRoutes = require("./Routes/biddingRoutes");

const app = express();
const PORT = process.env.PORT || 8080; // Railway dynamic port

// ── Fixed CORS Logic: Whitelist + Regex ────────────────
const allowedOrigins = [
  "https://cricbid.sytes.net",
  // "https://cricket-bidding-website.vercel.app",
  "https://cricket-bidding-website-odez3nm7q.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow if no origin (like mobile apps/Postman)
    if (!origin) return callback(null, true);
    
    // 2. Allow if in the explicit whitelist
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // 3. Allow ANY Vercel preview URL from your project
    // This Regex matches your project name followed by anything .vercel.app
    if (/^https:\/\/cricket-bidding-website.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Otherwise, block
    console.error(`Blocked by CORS: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
};

// ── Middleware ────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false, // Important for cross-origin assets
}));
app.use(compression());
app.use(cors(corsOptions)); // Using the updated options
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => res.status(200).send("Server is Live"));

// ── MongoDB Connect ───────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully."))
.catch((err) => console.error("MongoDB connection error:", err));

// ── Routes ───────────────────────────────────────
app.use("/", personRoutes);
app.use("/", playerRoutes);
app.use("/", teamRoutes);
app.use("/", auctionRoutes);
app.use("/", dashboardRoutes);
app.use("/", biddingRoutes);

// ── Socket.IO Setup ───────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions, // Use the same logic for Socket.IO
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("join-auction", (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket joined room ${auctionId}`);
  });

  socket.on("timer:expired", ({ auctionId }) => {
    io.to(auctionId).emit("timer:expired", { auctionId });
  });
  
  socket.on("leave-auction", (auctionId) => {
    socket.leave(auctionId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ── Start Server ─────────────────────────────────
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});