const express = require('express');
const verifyToken = require('../middleware/authMiddleware.js');
const User = require('../models/user.js');  // Import the User model
const router = express.Router();

// Route for candidates to update their profile (resume, cover letter, etc.)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    // Ensure only candidates can update their profile
    if (req.userRole !== 'candidate') {
      return res.status(403).json({ message: 'Access forbidden: Only candidates can update profiles' });
    }

    // Find the candidate by userId
    const candidate = await User.findById(req.userId);

    // Update candidate profile fields
    candidate.resume = req.body.resume || candidate.resume;
    candidate.coverLetter = req.body.coverLetter || candidate.coverLetter;

    // Save the updated profile
    await candidate.save();

    res.json({ message: 'Profile updated successfully', candidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
