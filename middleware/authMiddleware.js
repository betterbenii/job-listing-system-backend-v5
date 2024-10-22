const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      return res.status(403).json({ message: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1];
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      req.userId = decoded.userId;
      req.userRole = decoded.role;
  
      // Only recruiters are forbidden from applying to jobs
      if (req.userRole === 'recruiter' && req.path.includes('/apply')) {
        return res.status(403).json({ message: 'Access forbidden: Recruiters cannot apply for jobs' });
      }
  
      // Only recruiters can create, update, or delete jobs
      if ((req.path.includes('/jobs') && req.method !== 'GET') && req.userRole !== 'recruiter') {
        return res.status(403).json({ message: 'Access forbidden: Recruiters only' });
      }
  
      next();
    });
  };

module.exports = verifyToken;