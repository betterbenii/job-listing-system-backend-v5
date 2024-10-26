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

module.exports = router;
