const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const Job = require('../models/job');  // Import the Job model
const Application = require('../models/application.js');  // Import the Application model
const Notification= require('../models/notification.js')
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
      company: req.body.company,
      jobType: req.body.jobType,
      experienceLevel: req.body.experienceLevel
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

  // Route to update a job by ID
router.put('/:id', verifyToken, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
  
      // Check if the job exists
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // Check if the logged-in user is the recruiter who posted the job
      if (job.recruiter.toString() !== req.userId) {
        return res.status(403).json({ message: 'Access forbidden: You can only edit jobs you posted' });
      }
  
      // Update job details
      job.title = req.body.title || job.title;
      job.description = req.body.description || job.description;
      job.location = req.body.location || job.location;
      job.requirements = req.body.requirements || job.requirements;
  
      // Save the updated job
      const updatedJob = await job.save();
      res.json({ message: 'Job updated successfully', job: updatedJob });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Route to delete a job by ID
router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
  
      // Check if the job exists
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // Check if the logged-in user is the recruiter who posted the job
      if (job.recruiter.toString() !== req.userId) {
        return res.status(403).json({ message: 'Access forbidden: You can only delete jobs you posted' });
      }
  
      // Delete the job
      await Job.deleteOne({ _id: req.params.id });
      res.json({ message: 'Job deleted successfully' });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
// Route for candidates to apply for a job
router.post('/:id/apply', verifyToken, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
  
      // Check if the job exists
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // Ensure only candidates (not recruiters) can apply for jobs
      if (req.userRole === 'recruiter') {
        return res.status(403).json({ message: 'Access forbidden: Recruiters cannot apply for jobs' });
      }
  
      // Create a new application
      const newApplication = new Application({
        candidate: req.userId,  // Candidate's user ID from the JWT token
        job: job._id,
        resume: req.body.resume,  // Candidate's resume
        coverLetter: req.body.coverLetter || ''  // Optional cover letter
      });

      const notification = new Notification({
        user: job.recruiter,  //  `job.recruiter` holds the recruiter's ID
        message: `A new candidate applied for your job posting: ${job.title}`,
      });
      await notification.save();
  
  
      await newApplication.save();
      res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Route to view applications for a specific job (Recruiters only)
router.get('/:id/applications', verifyToken, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
  
      // Check if the job exists
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // Ensure that only the recruiter who posted the job can view applications
      if (job.recruiter.toString() !== req.userId) {
        return res.status(403).json({ message: 'Access forbidden: You can only view applications for jobs you posted' });
      }
  
      // Find all applications for the job
      const applications = await Application.find({ job: job._id }).populate('candidate', 'username email');
  
      // Send a "viewed" notification to each candidate
    for (const application of applications) {
      const notification = new Notification({
        user: application.candidate._id,
        message: `Your application for the job "${job.title}" has been viewed by the recruiter.`,
      });
      await notification.save();
    }





      res.json({ jobTitle: job.title, applications });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

    // Route to search for jobs by keywords (title, location, or company)
    router.get('/search', async (req, res) => {
      
      try {
        const keyword = req.query.q || '';
        const filters = {};
    
        // Apply jobType filter if provided
        if (req.query.jobType) {
          filters.jobType = req.query.jobType;
        }
    
        // Apply experienceLevel filter if provided
        if (req.query.experienceLevel) {
          filters.experienceLevel = req.query.experienceLevel;
        }
    
        // Apply location filter if provided
        if (req.query.location) {
          filters.location = req.query.location;
        }
    
        // Build search query with keyword and filters
        const jobs = await Job.find({
          $and: [
            {
              $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { company: { $regex: keyword, $options: 'i' } }
              ]
            },
            filters
          ]
        });
    
        res.json({ results: jobs });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    });
    
    

module.exports = router;