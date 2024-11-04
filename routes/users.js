const express = require('express');
const { verifyToken } = require('../utils/jwtUtils.js'); // Directly import from jwtUtils
const User = require('../models/user');
const router = express.Router();

// Route to bookmark a job (Candidates only)
router.post('/bookmark/:jobId', verifyToken(['candidate']), async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.bookmarkedJobs.includes(req.params.jobId)) {
      return res.status(400).json({ message: 'Job already bookmarked' });
    }

    user.bookmarkedJobs.push(req.params.jobId);
    await user.save();

    res.json({ message: 'Job bookmarked successfully', bookmarks: user.bookmarkedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to remove a bookmarked job (Candidates only)
router.delete('/bookmark/:jobId', verifyToken(['candidate']), async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.bookmarkedJobs = user.bookmarkedJobs.filter(jobId => jobId.toString() !== req.params.jobId);
    await user.save();

    res.json({ message: 'Job bookmark removed successfully', bookmarks: user.bookmarkedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get all bookmarked jobs (Candidates only)
router.get('/bookmarks', verifyToken(['candidate']), async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('bookmarkedJobs');
    res.json({ bookmarks: user.bookmarkedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update notification preferences (Candidates only)
router.patch('/preferences', verifyToken(['candidate']), async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.notificationPreferences.newJobPosts = req.body.newJobPosts ?? user.notificationPreferences.newJobPosts;
    user.notificationPreferences.applicationUpdates = req.body.applicationUpdates ?? user.notificationPreferences.applicationUpdates;

    await user.save();
    res.json({ message: 'Notification preferences updated successfully', preferences: user.notificationPreferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for candidates to update their profile (resume, cover letter, etc.)
router.patch('/update-profile', verifyToken(['candidate']), async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Update fields if provided in the request
    if (req.body.resume) user.resume = req.body.resume;
    if (req.body.coverLetter) user.coverLetter = req.body.coverLetter;
    if (req.body.experience) user.experience = req.body.experience;
    if (req.body.education) user.education = req.body.education;

    await user.save();

    res.json({ message: 'Profile updated successfully', profile: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
