const mongoose = require('mongoose');

const cvSubmissionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  fileUrl: { type: String, required: true },
  extractedText: { type: String }, // Store extracted text
  aiReport: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CVSubmission', cvSubmissionSchema);