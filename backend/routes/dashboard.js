const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

router.get('/data', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    res.json({
      message: 'Welcome to dashboard',
      user,
      stats: {
        totalUsers: await User.countDocuments(),
        joinDate: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: err.message });
  }
});

module.exports = router;
