// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const { connectDB, closeDB } = require("./db");
const User = require('./models/Student');

const app = express();

// Basic middleware
app.use(helmet()); // security headers
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use(express.json());

app.use(cors());

// Basic rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,            // adjust as needed
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Connect DB (fail fast)
(async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error('Missing MONGO_URL env var');
      process.exit(1);
    }
    await connectDB(process.env.MONGO_URL);
  } catch (err) {
    console.error('DB connect failed', err);
    process.exit(1);
  }
})();

// Health check for Render
app.get('/_health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// GET /users (list with optional domain filter)
app.get('/users', async (req, res) => {
  try {
    const filter = {};
    if (req.query.domain) filter.domain = req.query.domain;
    const users = await User.find(filter).sort({ priority: 1, branch: 1 }).exec();
    res.json(users);
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST remark
app.post('/users/remarks/:id', async (req, res) => {
  try {
    const { text, rating, by } = req.body;
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });

    const r = Number(rating);
    if (!Number.isFinite(r) || r < 0 || r > 10) return res.status(400).json({ error: 'rating must be 0-10' });

    let reviewerName;
    if (typeof by === 'string' && by.trim()) reviewerName = by.trim();
    else if (by !== undefined) reviewerName = '';

    const remark = { text: text.trim(), rating: r, ...(reviewerName !== undefined && { by: reviewerName }) };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { remarks: remark } },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('POST /users/remarks error:', err);
    res.status(500).json({ error: 'Failed to save remark' });
  }
});

// GET single user
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error('GET /users/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT remark (update an existing remark)
app.put('/users/:userId/remarks/:remarkId', async (req, res) => {
  try {
    const { text, rating, by } = req.body;

    if (text !== undefined && (typeof text !== 'string' || !text.trim())) {
      return res.status(400).json({ error: 'text must be a non-empty string' });
    }

    if (rating !== undefined) {
      const r = Number(rating);
      if (!Number.isFinite(r) || r < 0 || r > 10) {
        return res.status(400).json({ error: 'rating must be between 0 and 10' });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, 'remarks._id': req.params.remarkId },
      {
        $set: {
          ...(text !== undefined && { 'remarks.$.text': text.trim() }),
          ...(rating !== undefined && { 'remarks.$.rating': rating }),
          ...(by !== undefined && { 'remarks.$.by': by.trim?.() || '' })
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: 'User or remark not found' });
    res.json(user);
  } catch (err) {
    console.error('PUT /users/remarks error:', err);
    res.status(500).json({ error: 'Failed to update remark' });
  }
});

// DELETE remark (remove a remark)
app.delete('/users/:userId/remarks/:remarkId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { remarks: { _id: req.params.remarkId } } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('DELETE /users/remarks error:', err);
    res.status(500).json({ error: 'Failed to delete remark' });
  }
});



// Global error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.message ? err.message : err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  try { await closeDB(); } catch (e) { console.error('Error closing DB', e); }
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
