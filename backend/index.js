const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import DB model
const User = require('./models/Student');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));


// ================== Requests ===================


// POST request to save remarks 
app.post('/users/remarks/:id', async (req, res) => {
  try {
    // check
    console.log("Incoming body:", req.body);

    const { text, rating, by } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    // Validate rating
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 0 || r > 10) {
      return res.status(400).json({ error: 'rating must be a number between 0 and 10' });
    }

    // check reviewer name
    let reviewerName;
    if (typeof by === 'string' && by.trim()) {
      reviewerName = by.trim();
    } else if (by !== undefined) {

      // no name means we store as empty
      reviewerName = '';
      // If by is undefined, schema default "Interviewer" applies
    }
    


    // gather remark
    const remark = {
      text: text.trim(),
      rating: r,
      ...(reviewerName !== undefined && { by: reviewerName }) 
    };

    // push remark into user DB
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



// GET request to display dashboard
app.get('/users/:id', async (req, res) => {
  try {

    // search users in DB
    const user = await User.findById(req.params.id);
    // error
    if (!user) return res.status(404).send('User not found');

    // fetched by axios inside Dashboard & Student Details
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
