const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// User registration route
router.post('/register', authController.register);

// User login route
router.post('/login', authController.login);

module.exports = router;