const mongoose = require('mongoose');

// This schema stores individual feedback comments about students
// Each remark has text, rating, who wrote it, and when it was created
const remarkSchema = new mongoose.Schema({
  text: { type: String, trim: true },
  rating: { type: Number, min: 0, max: 10 },
  by: { type: String, default: 'Interviewer' },
  createdAt: { type: Date, default: Date.now }
});

// This is the main student data structure
// It holds all student info plus an array of their remarks
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  branch: String,
  reg: String,
  phone: String,
  priority: Number,
  reason: String,
  domain: String,
  bestProject: String,
  remarks: [remarkSchema]
}, {
  timestamps: true 
});

// Export the model for use in other files
// This creates a 'users' collection in MongoDB
module.exports = mongoose.model('User', userSchema);