const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Load the secret key from environment variables

// Function to generate a JWT
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Middleware to verify JWT and roles
function verifyToken(allowedRoles = []) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
      req.userRole = decoded.role; // Attach the user's role to req for easy access

      // Check if user role is allowed for this route
      if (allowedRoles.length && !allowedRoles.includes(req.userRole)) {
        return res.status(403).json({ message: 'Access forbidden: Insufficient permissions.' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token.' });
    }
  };
};

module.exports = { generateToken, verifyToken };
