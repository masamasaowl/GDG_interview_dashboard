// Main server file for the student management application
// This file sets up Express server with middleware and API routes for managing students and their remarks

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import our database connection functions and User model
const { connectDB, closeDB } = require("./db");
const User = require('./models/Student');

// Create Express application instance
const app = express();

// Security middleware - adds various HTTP headers to protect against common attacks
app.use(helmet());

// Request logging middleware - only log requests in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Parse incoming JSON requests
app.use(express.json());

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Rate limiting to prevent abuse
// Allow maximum 300 requests per minute from each IP address
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute time window
  max: 300,            // maximum number of requests per window
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Database connection setup
// Connect to MongoDB immediately when server starts
// If connection fails, stop the application
(async () => {
  try {
    // Check if MongoDB URL is provided in environment variables
    if (!process.env.MONGO_URL) {
      console.error('Missing MONGO_URL env var');
      process.exit(1);
    }
    // Attempt to connect to the database
    await connectDB(process.env.MONGO_URL);
  } catch (err) {
    console.error('DB connect failed', err);
    process.exit(1);
  }
})();

// Health check endpoint for deployment platforms like Render
// Returns a simple JSON response to confirm the server is running
app.get('/_health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Get all users with optional domain filtering
// URL: GET /users or GET /users?domain=example.com
app.get('/users', async (req, res) => {
  try {
    // Build filter object based on query parameters
    const filter = {};
    if (req.query.domain) {
      filter.domain = req.query.domain;
    }
    
    // Find users matching the filter and sort by priority then branch
    const users = await User.find(filter).sort({ priority: 1, branch: 1 }).exec();
    res.json(users);
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add a new remark to a specific user
// URL: POST /users/remarks/:id
// Body should contain: { text, rating, by }
app.post('/users/remarks/:id', async (req, res) => {
  try {
    const { text, rating, by } = req.body;
    
    // Validate that text is provided and is a string
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    // Validate rating is a number between 0 and 10
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 0 || r > 10) {
      return res.status(400).json({ error: 'rating must be 0-10' });
    }

    // Handle the optional 'by' field (reviewer name)
    let reviewerName;
    if (typeof by === 'string' && by.trim()) {
      reviewerName = by.trim();
    } else if (by !== undefined) {
      reviewerName = '';
    }

    // Create the remark object
    const remark = { 
      text: text.trim(), 
      rating: r, 
      ...(reviewerName !== undefined && { by: reviewerName })
    };

    // Add the remark to the user's remarks array
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { remarks: remark } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('POST /users/remarks error:', err);
    res.status(500).json({ error: 'Failed to save remark' });
  }
});

// Get a specific user by their ID
// URL: GET /users/:id
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    res.json(user);
  } catch (err) {
    console.error('GET /users/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update an existing remark for a user
// URL: PUT /users/:userId/remarks/:remarkId
// Body can contain: { text, rating, by } (all optional)
app.put('/users/:userId/remarks/:remarkId', async (req, res) => {
  try {
    const { text, rating, by } = req.body;

    // Validate text if it's being updated
    if (text !== undefined && (typeof text !== 'string' || !text.trim())) {
      return res.status(400).json({ error: 'text must be a non-empty string' });
    }

    // Validate rating if it's being updated
    if (rating !== undefined) {
      const r = Number(rating);
      if (!Number.isFinite(r) || r < 0 || r > 10) {
        return res.status(400).json({ error: 'rating must be between 0 and 10' });
      }
    }

    // Find the user and update the specific remark using positional operator
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, 'remarks._id': req.params.remarkId },
      {
        $set: {
          // Only update fields that are provided in the request
          ...(text !== undefined && { 'remarks.$.text': text.trim() }),
          ...(rating !== undefined && { 'remarks.$.rating': rating }),
          ...(by !== undefined && { 'remarks.$.by': by.trim?.() || '' })
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User or remark not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('PUT /users/remarks error:', err);
    res.status(500).json({ error: 'Failed to update remark' });
  }
});

// Delete a specific remark from a user
// URL: DELETE /users/:userId/remarks/:remarkId
app.delete('/users/:userId/remarks/:remarkId', async (req, res) => {
  try {
    // Remove the remark with the specified ID from the user's remarks array
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { remarks: { _id: req.params.remarkId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('DELETE /users/remarks error:', err);
    res.status(500).json({ error: 'Failed to delete remark' });
  }
});

// Global error handler for any unhandled errors
// This catches any errors that weren't handled in individual routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.message ? err.message : err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown handling
// This function runs when the server receives shutdown signals
const shutdown = async () => {
  console.log('Shutting down...');
  try { 
    await closeDB(); 
  } catch (e) { 
    console.error('Error closing DB', e); 
  }
  process.exit(0);
};

// Listen for shutdown signals and handle them gracefully
process.on('SIGINT', shutdown);  // Ctrl+C
process.on('SIGTERM', shutdown); // Termination signal

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});