const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the recruiter (user) who posted the job
    required: true,
  },
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;