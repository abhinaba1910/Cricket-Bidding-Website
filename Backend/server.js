const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const personRoutes = require('./Routes/personRoutes');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001 ;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://dasabhi1910:iamf00L@cricket-bidding.dugejrq.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch((err) => console.error('MongoDB connection error:', err));


app.use("/",personRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
