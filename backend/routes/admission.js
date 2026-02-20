const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const AdmissionActivity = require('../models/AdmissionActivity');
const AdmissionActivitySOC = require('../models/AdmissionActivitySOC');
const AdmissionActivityEnrollment = require('../models/AdmissionActivityEnrollment');

// ===== ADMISSION ACTIVITY ROUTES =====

// Create new admission activity
router.post('/activity', authMiddleware, async (req, res) => {
  try {
    const { id, schoolId, schoolYearId, firstName, lastName, email, ...rest } = req.body;

    if (!id || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const admission = new AdmissionActivity({
      id,
      schoolId,
      schoolYearId,
      firstName,
      lastName,
      email,
      ...rest
    });

    await admission.save();
    res.status(201).json({ message: 'Admission activity created', admission });
  } catch (err) {
    res.status(500).json({ message: 'Error creating admission activity', error: err.message });
  }
});

// Get all admission activities
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const admissions = await AdmissionActivity.find().populate('schoolId schoolYearId');
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activities', error: err.message });
  }
});

// Get admission activity by ID
router.get('/activity/:id', authMiddleware, async (req, res) => {
  try {
    const admission = await AdmissionActivity.findById(req.params.id).populate('schoolId schoolYearId');
    if (!admission) {
      return res.status(404).json({ message: 'Admission activity not found' });
    }
    res.json(admission);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activity', error: err.message });
  }
});

// Update admission activity
router.put('/activity/:id', authMiddleware, async (req, res) => {
  try {
    const admission = await AdmissionActivity.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!admission) {
      return res.status(404).json({ message: 'Admission activity not found' });
    }
    res.json({ message: 'Admission activity updated', admission });
  } catch (err) {
    res.status(500).json({ message: 'Error updating admission activity', error: err.message });
  }
});

// Delete admission activity
router.delete('/activity/:id', authMiddleware, async (req, res) => {
  try {
    const admission = await AdmissionActivity.findByIdAndDelete(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission activity not found' });
    }
    res.json({ message: 'Admission activity deleted', admission });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting admission activity', error: err.message });
  }
});

// ===== ADMISSION ACTIVITY SOC ROUTES =====

// Create new admission activity SOC
router.post('/activity-soc', authMiddleware, async (req, res) => {
  try {
    const { id, admissionActivityId, schoolId, schoolYearId, firstName, lastName, email, ...rest } = req.body;

    if (!id || !admissionActivityId || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const admissionSOC = new AdmissionActivitySOC({
      id,
      admissionActivityId,
      schoolId,
      schoolYearId,
      firstName,
      lastName,
      email,
      ...rest
    });

    await admissionSOC.save();
    res.status(201).json({ message: 'Admission activity SOC created', admissionSOC });
  } catch (err) {
    res.status(500).json({ message: 'Error creating admission activity SOC', error: err.message });
  }
});

// Get all admission activities SOC
router.get('/activity-soc', authMiddleware, async (req, res) => {
  try {
    const admissionsSOC = await AdmissionActivitySOC.find()
      .populate('admissionActivityId schoolId schoolYearId');
    res.json(admissionsSOC);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activities SOC', error: err.message });
  }
});

// Get admission activity SOC by ID
router.get('/activity-soc/:id', authMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivitySOC.findById(req.params.id)
      .populate('admissionActivityId schoolId schoolYearId');
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    res.json(admissionSOC);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activity SOC', error: err.message });
  }
});

// Update admission activity SOC
router.put('/activity-soc/:id', authMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivitySOC.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    res.json({ message: 'Admission activity SOC updated', admissionSOC });
  } catch (err) {
    res.status(500).json({ message: 'Error updating admission activity SOC', error: err.message });
  }
});

// Delete admission activity SOC
router.delete('/activity-soc/:id', authMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivitySOC.findByIdAndDelete(req.params.id);
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    res.json({ message: 'Admission activity SOC deleted', admissionSOC });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting admission activity SOC', error: err.message });
  }
});

// ===== ADMISSION ACTIVITY ENROLLMENT ROUTES =====

// Create new admission activity enrollment
router.post('/enrollment', authMiddleware, async (req, res) => {
  try {
    const { id, admissionActivityId, schoolId, schoolYearId, firstName, lastName, enrollmentDate, ...rest } = req.body;

    if (!id || !admissionActivityId || !firstName || !lastName || !enrollmentDate) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const enrollment = new AdmissionActivityEnrollment({
      id,
      admissionActivityId,
      schoolId,
      schoolYearId,
      firstName,
      lastName,
      enrollmentDate,
      ...rest
    });

    await enrollment.save();
    res.status(201).json({ message: 'Enrollment created', enrollment });
  } catch (err) {
    res.status(500).json({ message: 'Error creating enrollment', error: err.message });
  }
});

// Get all enrollments
router.get('/enrollment', authMiddleware, async (req, res) => {
  try {
    const enrollments = await AdmissionActivityEnrollment.find()
      .populate('admissionActivityId admissionActivitySOCId schoolId schoolYearId');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enrollments', error: err.message });
  }
});

// Get enrollment by ID
router.get('/enrollment/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await AdmissionActivityEnrollment.findById(req.params.id)
      .populate('admissionActivityId admissionActivitySOCId schoolId schoolYearId');
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enrollment', error: err.message });
  }
});

// Update enrollment
router.put('/enrollment/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await AdmissionActivityEnrollment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment updated', enrollment });
  } catch (err) {
    res.status(500).json({ message: 'Error updating enrollment', error: err.message });
  }
});

// Delete enrollment
router.delete('/enrollment/:id', authMiddleware, async (req, res) => {
  try {
    const enrollment = await AdmissionActivityEnrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment deleted', enrollment });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting enrollment', error: err.message });
  }
});

// ===== STATISTICS ROUTES =====

// Get admission statistics
router.get('/stats/admission', authMiddleware, async (req, res) => {
  try {
    const totalApplications = await AdmissionActivity.countDocuments();
    const acceptedApplications = await AdmissionActivity.countDocuments({ status: 'Accepted' });
    const rejectedApplications = await AdmissionActivity.countDocuments({ status: 'Rejected' });
    const enrolledStudents = await AdmissionActivityEnrollment.countDocuments({ enrollmentStatus: 'Active' });

    res.json({
      totalApplications,
      acceptedApplications,
      rejectedApplications,
      enrolledStudents,
      acceptanceRate: totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission statistics', error: err.message });
  }
});

module.exports = router;
