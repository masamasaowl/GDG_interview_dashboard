const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  branch: String,
  reg: String,
  phone: String,
  priority: Number, // use Number for proper sorting
  reason: String,
  domain: String,
  bestProject: String
}, {
  timestamps: true // this adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);

