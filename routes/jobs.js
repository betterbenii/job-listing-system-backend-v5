const express = require('express');
const { verifyToken } = require('../utils/jwtUtils.js'); // Directly import from jwtUtils
const Job = require('../models/job');
const Application = require('../models/application');
const Notification = require('../models/notification');
const User = require('../models/user');
const router = express.Router();

// Only recruiters can create jobs
router.post('/', verifyToken(['recruiter']), async (req, res) => {
  try {
    const newJob = new Job({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      requirements: req.body.requirements,
      recruiter: req.userId,
      company: req.body.company,
      jobType: req.body.jobType,
      experienceLevel: req.body.experienceLevel,
    });
    await newJob.save();

    // Notify candidates who opted in for new job notifications
    const candidates = await User.find({ 
      role: 'candidate', 
      'notificationPreferences.newJobPosts': true 
    });

    for (const candidate of candidates) {
      const notification = new Notification({
        user: candidate._id,
        message: `A new job has been posted: ${newJob.title} at ${newJob.company}`,
      });
      await notification.save();
    }

    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all jobs (available to all users)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }); // Adjust as needed for status
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Only recruiters can update jobs
router.put('/:id', verifyToken(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access forbidden: You can only edit jobs you posted' });
    }

    // Update job details
    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.location = req.body.location || job.location;
    job.requirements = req.body.requirements || job.requirements;
    job.status = req.body.status || job.status; // Support status updates

    const updatedJob = await job.save();
    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Only recruiters can delete jobs
router.delete('/:id', verifyToken(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access forbidden: You can only delete jobs you posted' });
    }

    // Soft delete using status flag instead of actual deletion
    job.status = 'deleted';
    await job.save();
    res.json({ message: 'Job marked as deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to search for jobs by keywords (title, location, or company)
router.get('/search', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const filters = { status: 'open' }; // Only include open jobs

    // Apply additional filters if provided
    if (req.query.jobType) {
      filters.jobType = req.query.jobType;
    }
    
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
        filters // Add the status filter to the search
      ]
    });

    res.json({ results: jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


// Route for recruiters to update job status
router.patch('/:id/status', verifyToken(['recruiter']), async (req, res) => {
  const { status } = req.body; // Expected values: 'closed' or 'expired'
  
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access forbidden: You can only update jobs you posted' });
    }

    // Validate status
    if (!['closed', 'expired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use "closed" or "expired"' });
    }

    job.status = status;
    await job.save();

    // Notify candidates who bookmarked or applied for this job
    const applicants = await Application.find({ job: job._id }).populate('candidate');
    const bookmarkedCandidates = await User.find({ bookmarkedJobs: job._id });

    const candidatesToNotify = [...new Set([...applicants.map(app => app.candidate), ...bookmarkedCandidates])];

    for (const candidate of candidatesToNotify) {
      const notification = new Notification({
        user: candidate._id,
        message: `The job "${job.title}" has been marked as ${status}.`,
      });
      await notification.save();
    }

    res.json({ message: `Job status updated to ${status}`, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for candidates to apply for a job
router.post('/:id/apply', verifyToken(['candidate']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || job.status !== 'open') {
      return res.status(404).json({ message: 'Job not available' });
    }

    // Create a new application with a reference to the candidate and job
    const newApplication = new Application({
      candidate: req.userId,  // Candidate's user ID from the JWT token
      job: job._id,
      coverLetter: req.body.coverLetter || ''  // Optional cover letter
    });

    await newApplication.save();

    const notification = new Notification({
      user: job.recruiter,
      message: `A new candidate applied for your job posting: ${job.title}`,
    });
    await notification.save();

    res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Route for any recruiter to view applications for a specific job
router.get('/:id/applications', verifyToken(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    // Check if the job exists
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Find all applications for the job and populate candidate details, including the resume
    const applications = await Application.find({ job: job._id })
      .populate({
        path: 'candidate',
        select: 'username email resume', // Includes username, email, and resume from the candidate's profile
      });

    // Send notification to candidates that their application has been viewed
    for (const application of applications) {
      const notification = new Notification({
        user: application.candidate._id,
        message: `Your application for the job "${job.title}" has been viewed by a recruiter.`,
      });
      await notification.save();
    }

    res.json({ jobTitle: job.title, applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Route for any recruiter to respond to a candidate's application
router.patch('/:jobId/applications/:applicationId/respond', verifyToken(['recruiter']), async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const { action } = req.body; // Expected values: 'accepted' or 'rejected'

    // Find the job by ID
    const job = await Job.findById(jobId); // Ensure job is found
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Find the application
    const application = await Application.findById(applicationId).populate('candidate', 'username email');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure valid action
    if (action !== 'accepted' && action !== 'rejected') {
      return res.status(400).json({ message: 'Invalid action. Use "accepted" or "rejected"' });
    }

    // Send notification based on the action taken
    const message = action === 'accepted'
      ? `Congratulations! Your application for "${job.title}" was accepted.`
      : `We're sorry to inform you that your application for "${job.title}" was rejected.`;

    const notification = new Notification({
      user: application.candidate._id,
      message,
    });
    await notification.save();

    // Optionally, update application status (if you’re tracking application statuses)
    application.status = action; // For example, you can have a status field in Application schema
    await application.save();

    res.json({ message: `Application ${action}`, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
