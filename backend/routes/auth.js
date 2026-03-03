const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'token';

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function getTokenFromRequest(req) {
  return req.cookies?.[COOKIE_NAME] || req.headers['authorization']?.split(' ')[1];
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'school', schoolId } = req.body;
    const normalizedRole = role === 'admin' ? 'admin' : 'school';
    const normalizedSchoolId = normalizedRole === 'admin' ? 1 : Number(schoolId);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required' });
    }

    if (normalizedRole === 'school' && !Number.isFinite(normalizedSchoolId)) {
      return res.status(400).json({ message: 'schoolId is required for teacher/student accounts' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password, role: normalizedRole, schoolId: normalizedSchoolId });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role, schoolId: user.schoolId }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, schoolId: user.schoolId }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role, schoolId: user.schoolId }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, schoolId: user.schoolId }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id name email role schoolId');

    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, schoolId: user.schoolId }
    });
  } catch (err) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
