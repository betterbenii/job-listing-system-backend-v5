const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const Job = require('../models/job');  // Import the Job model
const router = express.Router();

// Route to create a new job
router.post('/', verifyToken, async (req, res) => {
  if (req.userRole !== 'recruiter') {
    return res.status(403).json({ message: 'Access forbidden: Recruiters only' });
  }

  try {
    const newJob = new Job({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      requirements: req.body.requirements,
      recruiter: req.userId,  // Recruiter who posted the job
    });

    await newJob.save();  // Save the job to the database
    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all jobs
router.get('/', async (req, res) => {
    try {
      const jobs = await Job.find();  // Find all job postings in the database
      res.json(jobs);  // Return job listings as JSON
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;