const express = require('express');
const router = express.Router();
const { schoolAuthMiddleware } = require('../middleware/schoolAuth');
const User = require('../models/User');

router.get('/data', schoolAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    res.json({
      message: 'Welcome to dashboard',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        schoolId: user.schoolId
      },
      stats: {
        joinDate: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: err.message });
  }
});

module.exports = router;
