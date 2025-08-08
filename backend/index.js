const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Import User model
const User = require('./models/Student');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// POST /users → Create a new user
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body); // expects full user JSON
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /users?domain=Web Development → filtered & sorted
app.get('/users', async (req, res) => {
  try {
    const filter = {};

    // If query param ?domain=Something is passed
    if (req.query.domain) {
      filter.domain = req.query.domain;
    }

    const users = await User.find(filter).sort({ priority: 1, branch: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id → Get single user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
