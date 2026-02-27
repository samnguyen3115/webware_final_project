const jwt = require('jsonwebtoken');

/**
 * Middleware to verify user is authenticated and extract schoolId
 * Attaches userId and userSchoolId to req object
 */
const schoolAuthMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userSchoolId = decoded.SCHOOL_ID;
    next();
  } catch (err) {
    console.error(`❌ [Auth] Token verification failed:`, err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to verify user can access data for a specific school
 * Use after schoolAuthMiddleware
 * Pass schoolId as a query param or specify how to extract it from req
 */
const verifySchoolAccess = (getSchoolId) => {
  return (req, res, next) => {
    const targetSchoolId = getSchoolId(req);
    
    if (targetSchoolId.toString() !== req.userSchoolId.toString()) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to access this school\'s data' 
      });
    }
    
    next();
  };
};

module.exports = {
  schoolAuthMiddleware,
  verifySchoolAccess
};
