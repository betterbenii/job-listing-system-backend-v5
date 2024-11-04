const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  requirements: { type: String, required: true }, // Now required
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String }, // Optional, single company context for now
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract'], default: 'full-time' },
  experienceLevel: { type: String, enum: ['entry', 'mid', 'senior'], default: 'entry' },
  status: { type: String, enum: ['open', 'closed', 'expired', 'deleted'], default: 'open' },
  postedDate: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
