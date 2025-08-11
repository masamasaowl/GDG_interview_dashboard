const mongoose = require('mongoose');

// to note down the details of a student
const remarkSchema = new mongoose.Schema({
  text: { type: String, trim: true },
  rating: { type: Number, min: 0, max: 10 },
  by: { type: String, default: 'Interviewer' },
  createdAt: { type: Date, default: Date.now }
});


// this is the schema of the user 
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
  // created at
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);

