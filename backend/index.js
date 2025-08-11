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

// POST /users/:id/remarks  -> add a remark + rating
app.post('/users/remarks/:id', async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    const { text, rating, by } = req.body;

    // ✅ Validate text
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    // ✅ Validate rating
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 0 || r > 10) {
      return res.status(400).json({ error: 'rating must be a number between 0 and 10' });
    }

    // ✅ Sanitize reviewer name
    let reviewerName;
    if (typeof by === 'string' && by.trim()) {
      reviewerName = by.trim();
    } else if (by !== undefined) {
      // Explicit empty string means we store as empty, not default
      reviewerName = '';
    }
    // If by is completely undefined, schema default "Interviewer" applies

    const remark = {
      text: text.trim(),
      rating: r,
      ...(reviewerName !== undefined && { by: reviewerName }) // only set if provided
    };

    // ✅ Push remark into user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { remarks: remark } },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);

  } catch (err) {
    console.error(err);
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
