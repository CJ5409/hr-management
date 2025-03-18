const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const performanceSchema = new Schema({
  userEmail: { type: String, required: true },
  onTimeRate: Number,
  hoursWorked: Number
});

module.exports = mongoose.model('Performance', performanceSchema);