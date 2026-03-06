const express = require('express');
const router = express.Router();
const { schoolAuthMiddleware } = require('../middleware/schoolAuth');
const auth = require('../middleware/auth');
const EmployeePersonnel = require('../models/EmployeePersonnel');
const EmployeeAdminSupport = require('../models/EmployeeAdminSupport');

router.get('/personnel', schoolAuthMiddleware, async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 0;
    const rows = limit > 0
      ? await EmployeePersonnel.find({ SCHOOL_ID: req.userSchoolId }).limit(limit)
      : await EmployeePersonnel.find({ SCHOOL_ID: req.userSchoolId });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee personnel', error: err.message });
  }
});

// Get by School Year ID or MongoDB ID
router.get('/personnel/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    let record;
    
    // Try MongoDB ID first
    try {
      record = await EmployeePersonnel.findById(id);
    } catch (e) {
      // If that fails, try as SCHOOL_YR_ID
      const records = await EmployeePersonnel.find({ SCHOOL_YR_ID: Number(id), SCHOOL_ID: req.userSchoolId });
      if (records.length > 0) {
        return res.json(records);
      }
    }
    
    if (record && record.SCHOOL_ID === req.userSchoolId) {
      return res.json(record);
    }
    
    res.status(404).json({ message: 'Record not found' });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee personnel', error: err.message });
  }
});

// Create new employee personnel record
router.post('/personnel', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const schoolId = req.user.schoolId || req.body.SCHOOL_ID;
    const payload = {
      ...req.body,
      SCHOOL_ID: schoolId
    };

    // Parse numeric fields
    const numericFields = ['SCHOOL_YR_ID', 'SUBCONTRACT_NUM', 'SUBCONTRACT_FTE', 'FTE_ONLY_NUM', 
                          'FTE_ONLY_SALARY_MIN', 'FTE_ONLY_SALARY_MAX', 'TOTAL_EMPLOYEES', 
                          'FT_EMPLOYEES', 'POC_EMPLOYEES'];
    numericFields.forEach(field => {
      if (payload[field]) {
        payload[field] = Number(payload[field]);
      }
    });

    // Generate unique ID
    const lastRecord = await EmployeePersonnel.findOne().sort({ ID: -1 }).select('ID');
    payload.ID = lastRecord ? lastRecord.ID + 1 : 1;

    const employeePersonnel = new EmployeePersonnel(payload);
    await employeePersonnel.save();
    res.status(201).json({ message: 'Record created successfully', data: employeePersonnel });
  } catch (err) {
    res.status(500).json({ message: 'Error creating employee personnel record', error: err.message });
  }
});

// Update employee personnel record
router.put('/personnel/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const record = await EmployeePersonnel.findById(req.params.id);
    if (!record || record.SCHOOL_ID !== (req.user.schoolId || req.body.SCHOOL_ID)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedRecord = await EmployeePersonnel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({ message: 'Record updated successfully', data: updatedRecord });
  } catch (err) {
    res.status(500).json({ message: 'Error updating employee personnel record', error: err.message });
  }
});

// Delete employee personnel record
router.delete('/personnel/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const record = await EmployeePersonnel.findById(req.params.id);
    if (!record || record.SCHOOL_ID !== req.user.schoolId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await EmployeePersonnel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting employee personnel record', error: err.message });
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
