const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  cvFile: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'hired', 'rejected'], default: 'pending' },
  aiScreening: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', ApplicationSchema); 