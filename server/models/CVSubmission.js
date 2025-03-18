const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cvSubmissionSchema = new Schema({
  userEmail: { type: String, required: true },
  fileUrl: String,
  aiReport: String,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CVSubmission', cvSubmissionSchema);