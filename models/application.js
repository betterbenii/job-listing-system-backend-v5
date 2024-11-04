const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References the candidate
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // References the job applied for
  resume: { type: String }, // Path or URL to resume (optional if stored separately in profile)
  coverLetter: { type: String }, // Optional cover letter
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Application status
  appliedDate: { type: Date, default: Date.now } // Automatically sets to the date of application
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
