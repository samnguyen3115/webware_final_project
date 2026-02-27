const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, SCHOOL_ID } = req.body;

    if (!name || !email || !password || !SCHOOL_ID) {
      return res.status(400).json({ message: 'All fields (name, email, password, SCHOOL_ID) are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password, SCHOOL_ID: Number(SCHOOL_ID) });
    await user.save();

    const token = jwt.sign({ userId: user._id, SCHOOL_ID: user.SCHOOL_ID }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, SCHOOL_ID: user.SCHOOL_ID }
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

    const token = jwt.sign({ userId: user._id, SCHOOL_ID: user.SCHOOL_ID }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, SCHOOL_ID: user.SCHOOL_ID }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

module.exports = router;
