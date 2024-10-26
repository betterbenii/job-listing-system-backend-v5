const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.js');
const verifyToken = require('../middleware/authMiddleware.js');

// Route to get notifications for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to mark a specific notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
    try {
      // Find the notification by ID and ensure it belongs to the logged-in user
      const notification = await Notification.findOne({ _id: req.params.id, user: req.userId });
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      // Update the notification's isRead status to true
      notification.isRead = true;
      await notification.save();
  
      res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Route to get only unread notifications for the logged-in user
router.get('/unread', verifyToken, async (req, res) => {
    try {
      // Find unread notifications for the logged-in user
      const unreadNotifications = await Notification.find({ user: req.userId, isRead: false }).sort({ createdAt: -1 });
      res.json({ unreadNotifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });
  
  

module.exports = router;
