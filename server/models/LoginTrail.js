const mongoose = require('mongoose');

const loginTrailSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  role: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, required: true },
  ipAddress: { type: String } // Optional: Store IP address for additional context
});

module.exports = mongoose.model('LoginTrail', loginTrailSchema);