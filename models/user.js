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
    enum: ['recruiter', 'candidate'],  // Restrict roles to these two options
    default: 'candidate',  // Default role is candidate
  },
}, {
  timestamps: true,  // Automatically create createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;