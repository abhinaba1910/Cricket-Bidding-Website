const express = require('express');
const router = express.Router();
const authMiddleware = require('../Auth/Authentication');
const Auction = require('../Models/auction');
const Player = require('../Models/player');
const Team = require('../Models/team');

// GET /dashboard-stats
// router.get('/dashboard-stats', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [totalPlayers, totalTeams, auctions] = await Promise.all([
//       Player.countDocuments({ createdBy: userId }),
//       Team.countDocuments({ createdBy: userId }),
//       Auction.find({ createdBy: userId }),
//     ]);

//     const now = new Date();

//     const formattedAuctions = auctions.map((auction) => {
//       let status = 'upcoming';
//       const start = new Date(auction.startDate);
//       const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

//       if (now >= start && now <= end) {
//         status = 'live';
//       } else if (now > end) {
//         status = 'completed';
//       }

//       return {
//         id: auction._id,
//         name: auction.auctionName,
//         startTime: start,
//         endTime: end,
//         status,
//       };
//     });

//     res.status(200).json({
//       totalPlayers,
//       totalTeams,
//       totalAuctions: auctions.length,
//       auctions: formattedAuctions,
//     });
//   } catch (err) {
//     console.error('Dashboard stats error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });



router.get('/dashboard-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalPlayers, totalTeams, auctions] = await Promise.all([
      Player.countDocuments({ createdBy: userId }),
      Team.countDocuments({ createdBy: userId }),
      Auction.find({ createdBy: userId }),
    ]);

    const now = new Date();

    const formattedAuctions = auctions.map((auction) => {
      const start = new Date(auction.startDate);
      const nowDate = now.toISOString().split('T')[0];
      const startDate = start.toISOString().split('T')[0];

      let status = 'upcoming';

      if (now >= start && nowDate === startDate) {
        status = 'live';
      } else if (nowDate > startDate) {
        status = 'completed';
      }

      return {
        id: auction._id,
        name: auction.auctionName,
        startTime: start,
        status,
      };
    });

    res.status(200).json({
      totalPlayers,
      totalTeams,
      totalAuctions: auctions.length,
      auctions: formattedAuctions,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;
