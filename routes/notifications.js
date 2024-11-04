const express = require('express');
const { verifyToken } = require('../utils/jwtUtils.js'); // Directly import from jwtUtils
const Notification = require('../models/notification');
const router = express.Router();

// Route to get all notifications for the logged-in user
router.get('/', verifyToken(), async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get only unread notifications for the logged-in user
router.get('/unread', verifyToken(), async (req, res) => {
  try {
    const unreadNotifications = await Notification.find({ user: req.userId, isRead: false });
    res.json({ notifications: unreadNotifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to mark a specific notification as read
router.patch('/:id/read', verifyToken(), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to mark all notifications as read
router.patch('/mark-all-read', verifyToken(), async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
