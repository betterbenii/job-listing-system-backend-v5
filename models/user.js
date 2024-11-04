const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidate', 'recruiter', 'admin'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  deleted: { type: Boolean, default: false }, // Deleted flag
  notificationPreferences: {
    newJobPosts: { type: Boolean, default: true },
    applicationUpdates: { type: Boolean, default: true },
  },
  bookmarkedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  resume: { type: String },
  coverLetter: { type: String },
  experience: { type: String },
  education: { type: String },
  personalInfo: {
    fullName: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
