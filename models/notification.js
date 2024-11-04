const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References the user receiving the notification
  message: { type: String, required: true }, // Notification content
  isRead: { type: Boolean, default: false }, // Tracks read status
  createdAt: { type: Date, default: Date.now } // Timestamp of creation
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
