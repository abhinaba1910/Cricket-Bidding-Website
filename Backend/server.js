const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Person = require('./Models/person');
require("dotenv")

const app = express();
const PORT = process.env.PORT || 6001;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch((err) => console.error('MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const person = new Person({ username, email, password, role });
    await person.save();

    res.status(201).json({ message: 'User registered successfully!', user: { username, email, role: person.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
