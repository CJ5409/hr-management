const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['employee', 'hr', 'manager'], required: true },
  department: String,
  departmentHistory: [{ department: String, startDate: Date, endDate: Date }]
});

module.exports = mongoose.model('User', userSchema);
