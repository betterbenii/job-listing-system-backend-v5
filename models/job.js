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
  company: {   
    type: String,
    
  },
  jobType: {  // Optional field for job type (e.g., full-time, part-time, contract)
    type: String,
    enum: ['full-time', 'part-time', 'contract'],
  },
  experienceLevel: {  // Optional field for experience level (e.g., junior, mid, senior)
    type: String,
    enum: ['junior', 'mid', 'senior'],
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the recruiter (user) who posted the job
    required: true,
  },
  status: { type: String, 
    enum: ['open', 'closed', 'expired'], 
    default: 'open' },
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;