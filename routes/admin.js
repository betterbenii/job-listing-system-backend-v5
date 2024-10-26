const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const User = require('../models/user');
const router = express.Router();

// Route for admin to view all candidates
router.get('/candidates', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }

    const candidates = await User.find({ role: 'candidate' }).select('-password');  // Exclude password
    res.json({ candidates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for admin to view all recruiters
router.get('/recruiters', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }

    const recruiters = await User.find({ role: 'recruiter' }).select('-password');  // Exclude password
    res.json({ recruiters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
