// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const personRoutes = require("./Routes/personRoutes");
// const playerRoutes = require("./Routes/playerRoutes");
// const teamRoutes = require("./Routes/teamRoutes");
// const auctionRoutes = require("./Routes/auctionRoutes");
// const dashboardRoutes = require("./Routes/dasboardRoutes");
// const biddingRoutes = require("./Routes/biddingRoutes");
// const cors = require("cors");
// const compression = require("compression");
// const path = require("path");

// const app = express();
// const PORT = process.env.PORT;

// // ── Setup Socket.IO ───────────────────────────
// const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");

// const io = new Server(server, {
//   cors: {
//     origin: ["https://cricbid.sytes.net","https://cricket-bidding-website.vercel.app", "http://localhost:5173"],
//     methods: ["GET", "POST", "PATCH","PUT","DELETE"],
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

//   socket.on("leave-auction", (auctionId) => {
//     socket.leave(auctionId);
//     console.log(`Socket left room ${auctionId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// // Middleware
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not Allowed By Cors"));
//       }
//     },
//     credentials: true,
//   })
// );
// app.use(express.json());

// mongoose
//   .connect("mongodb+srv://dasabhi1910:iamf00L@cricket-bidding.dugejrq.mongodb.net/", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected successfully."))
//   .catch((err) => console.error("MongoDB connection error:", err));

// const allowedOrigins = ["https://cricbid.sytes.net","https://cricket-bidding-website.vercel.app", "http://localhost:5173"];


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(compression());
// app.use("/", personRoutes);
// app.use("/", playerRoutes);
// app.use("/", teamRoutes);
// app.use("/", auctionRoutes);
// app.use("/", dashboardRoutes);
// app.use("/", biddingRoutes);



// // ── Start server ───────────────────────────────
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const personRoutes = require("./Routes/personRoutes");
const playerRoutes = require("./Routes/playerRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const auctionRoutes = require("./Routes/auctionRoutes");
const dashboardRoutes = require("./Routes/dasboardRoutes");
const biddingRoutes = require("./Routes/biddingRoutes");

const app = express();
const PORT = process.env.PORT;

// ── Optimization: Allowed Origins at top ─────────────
const allowedOrigins = [
  "https://cricbid.sytes.net",
  "https://cricket-bidding-website.vercel.app",
  "http://localhost:5173",
];

// ── Express Middleware (Fast Setup Order) ─────────────
app.use(helmet()); // Secure headers
app.use(compression()); // Gzip compression
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Express example
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// ── MongoDB Connect ───────────────────────────────
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://dasabhi1910:iamf00L@cricket-bidding.dugejrq.mongodb.net/", {
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
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("join-auction", (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket joined room ${auctionId}`);
  });

  socket.on("timer:expired", ({ auctionId }) => {
    console.log(`Timer expired for auction ${auctionId}`);
    io.to(auctionId).emit("timer:expired", { auctionId });
  });
  
  socket.on("leave-auction", (auctionId) => {
    socket.leave(auctionId);
    console.log(`Socket left room ${auctionId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ── Start Server ─────────────────────────────────
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
