const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['recruiter', 'candidate', 'admin'],  // Add 'admin' role here
    default: 'candidate',  // Default role is candidate
  },
  // Candidate-specific fields

  notificationPreferences: {
    newJobPosts: { type: Boolean, default: true },  // Default to receiving new job notifications
    applicationUpdates: { type: Boolean, default: true },  // Notifications on application updates
  },
  
  personalInfo: {
    type: String,  // Bio or summary about the candidate
  },
  education: {
    type: String,  // Educational background
  },
  experience: {
    type: String,  // Work experience summary
  },
  resume: {
    type: String,  // URL or file path to the candidate's resume
  },
  coverLetter: {
    type: String,  // Optional cover letter text
  },
  // Recruiter-specific fields
  company: {
    type: String,  // Name of the recruiter's company
  },
  companyDescription: {
    type: String,  // Description of the company
  },
}, {
  timestamps: true,  // Automatically creates createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;
