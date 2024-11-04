const express = require('express');
const { verifyToken } = require('../utils/jwtUtils.js'); // Directly import from jwtUtils
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const Job = require('../models/job.js'); // Ensure to import Job model for job-related routes
const router = express.Router();

// Route for admin to create a recruiter
router.post('/create-recruiter', verifyToken(['admin']), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newRecruiter = new User({ username, email, password: hashedPassword, role: 'recruiter', status: 'active', deleted: false });
    await newRecruiter.save();

    res.status(201).json({ message: 'Recruiter created successfully', recruiter: newRecruiter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for admin to deactivate a recruiter
router.patch('/recruiters/:id/deactivate', verifyToken(['admin']), async (req, res) => {
  try {
    const recruiter = await User.findById(req.params.id);

    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Update the status to inactive
    recruiter.status = 'inactive';
    await recruiter.save();

    res.json({ message: 'Recruiter deactivated successfully', recruiter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for admin to delete a recruiter (soft delete)
router.delete('/recruiters/:id', verifyToken(['admin']), async (req, res) => {
  try {
    const recruiter = await User.findById(req.params.id);

    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Set the deleted flag to true
    recruiter.deleted = true;
    recruiter.status = 'inactive'; // Optionally mark as inactive
    await recruiter.save();

    res.json({ message: 'Recruiter marked as deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for admin to get all recruiters
router.get('/recruiters', verifyToken(['admin']), async (req, res) => {
  try {
    const recruiters = await User.find({ role: 'recruiter', deleted: false }); // Exclude deleted recruiters
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for admin to get all candidates
router.get('/candidates', verifyToken(['admin']), async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate', deleted: false }); // Exclude deleted candidates
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for admin to get all jobs (including deleted ones)
router.get('/jobs', verifyToken(['admin']), async (req, res) => {
  try {
    const jobs = await Job.find(); // Retrieves all jobs, regardless of status
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for admin to get only deleted jobs
router.get('/jobs/deleted', verifyToken(['admin']), async (req, res) => {
  try {
    const deletedJobs = await Job.find({ status: 'deleted' });
    res.json(deletedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
