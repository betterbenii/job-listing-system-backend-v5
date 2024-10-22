const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || 'candidate', //default to candidate if role is not provided
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check the password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token including userId and role
    const token = jwt.sign(
      { userId: user._id, role: user.role },  // Include role here
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return the token
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
