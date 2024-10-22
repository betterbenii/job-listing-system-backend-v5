const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];  // Get the token part of the header

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

   
    req.userId = decoded.userId;
    req.userRole = decoded.role;  // Store user role from the token

    if (req.userRole !== 'recruiter') {
      return res.status(403).json({ message: 'Access forbidden: Recruiters only' });
    }

    next();  // Proceed to the next middleware or route
  });
};

module.exports = verifyToken;