const express = require('express');
const router = express.Router();
const { schoolAuthMiddleware } = require('../middleware/schoolAuth');
const EmployeePersonnel = require('../models/EmployeePersonnel');
const EmployeeAdminSupport = require('../models/EmployeeAdminSupport');

router.get('/personnel', schoolAuthMiddleware, async (req, res) => {
  try {
    const rows = await EmployeePersonnel.find({ SCHOOL_ID: req.userSchoolId });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee personnel', error: err.message });
  }
});

router.get('/admin-support', schoolAuthMiddleware, async (req, res) => {
  try {
    const rows = await EmployeeAdminSupport.find({ SCHOOL_ID: req.userSchoolId });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee admin support', error: err.message });
  }
});

module.exports = router;
