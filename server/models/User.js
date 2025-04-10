const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Add password field
  role: { type: String, required: true },
  department: { type: String, default: 'Unassigned' },
  departmentHistory: [{
    department: String,
    startDate: Date,
    endDate: Date
  }]
});

module.exports = mongoose.model('User', userSchema);