const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clockRecordSchema = new Schema({
  userEmail: { type: String, required: true },
  clockIn: Date,
  clockOut: Date
});

module.exports = mongoose.model('ClockRecord', clockRecordSchema);