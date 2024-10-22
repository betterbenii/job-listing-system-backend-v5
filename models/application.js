const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the candidate (user) applying
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',  // Reference to the job being applied to
    required: true,
  },
  resume: {
    type: String,  // Could be a URL or path to the resume file
    required: true,
  },
  coverLetter: {
    type: String,  // Optional cover letter
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;