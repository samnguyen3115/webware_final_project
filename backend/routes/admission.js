const express = require('express');
const router = express.Router();
const { schoolAuthMiddleware, verifySchoolAccess } = require('../middleware/schoolAuth');
const AdmissionActivity = require('../models/AdmissionActivity');
const AdmissionActivitySOC = require('../models/AdmissionActivitySOC');
const AdmissionActivityEnrollment = require('../models/AdmissionActivityEnrollment');

// ===== ADMISSION ACTIVITY ROUTES =====

// Create new admission activity
router.post('/activity', schoolAuthMiddleware, async (req, res) => {
  try {
    const { ID, SCHOOL_ID, SCHOOL_YR_ID, ...rest } = req.body;

    if (!ID) {
      return res.status(400).json({ message: 'Required fields missing (ID)' });
    }

    // Verify user is creating data for their own school
    if (SCHOOL_ID && SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: Cannot create data for another school' });
    }

    const admission = new AdmissionActivity({
      ID,
      SCHOOL_ID: req.userSchoolId,
      SCHOOL_YR_ID,
      ...rest
    });

    await admission.save();
    res.status(201).json({ message: 'Admission activity created', admission });
  } catch (err) {
    res.status(500).json({ message: 'Error creating admission activity', error: err.message });
  }
});

// Get all admission activities for user's school only
router.get('/activity', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissions = await AdmissionActivity.find({ SCHOOL_ID: req.userSchoolId });
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activities', error: err.message });
  }
});

// Get admission activity by ID (with authorization check)
router.get('/activity/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admission = await AdmissionActivity.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission activity not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admission.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot access this school\'s data' });
    }
    
    res.json(admission);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activity', error: err.message });
  }
});

// Update admission activity (with authorization check)
router.put('/activity/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admission = await AdmissionActivity.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission activity not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admission.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot modify this school\'s data' });
    }

    const updatedAdmission = await AdmissionActivity.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    
    res.json({ message: 'Admission activity updated', admission: updatedAdmission });
  } catch (err) {
    res.status(500).json({ message: 'Error updating admission activity', error: err.message });
  }
});

// Delete admission activity (with authorization check)
router.delete('/activity/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admission = await AdmissionActivity.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission activity not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admission.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot delete this school\'s data' });
    }

    await AdmissionActivity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admission activity deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting admission activity', error: err.message });
  }
});

// ===== ADMISSION ACTIVITY SOC ROUTES =====

// Create new admission activity SOC
router.post('/activity-soc', schoolAuthMiddleware, async (req, res) => {
  try {
    const { ID, SCHOOL_ID, SCHOOL_YR_ID, ...rest } = req.body;

    if (!ID) {
      return res.status(400).json({ message: 'Required fields missing (ID)' });
    }

    // Verify user is creating data for their own school
    if (SCHOOL_ID && SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: Cannot create data for another school' });
    }

    const admissionSOC = new AdmissionActivitySOC({
      ID,
      SCHOOL_ID: req.userSchoolId,
      SCHOOL_YR_ID,
      ...rest
    });

    await admissionSOC.save();
    res.status(201).json({ message: 'Admission activity SOC created', admissionSOC });
  } catch (err) {
    res.status(500).json({ message: 'Error creating admission activity SOC', error: err.message });
  }
});

// Get all admission activities SOC for user's school only
router.get('/activity-soc', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionsSOC = await AdmissionActivitySOC.find({ SCHOOL_ID: req.userSchoolId });
    res.json(admissionsSOC);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activities SOC', error: err.message });
  }
});

// Get admission activity SOC by ID (with authorization check)
router.get('/activity-soc/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivitySOC.findById(req.params.id);
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admissionSOC.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot access this school\'s data' });
    }
    
    res.json(admissionSOC);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activity SOC', error: err.message });
  }
});

// Update admission activity SOC (with authorization check)
router.put('/activity-soc/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivitySOC.findById(req.params.id);
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admissionSOC.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot modify this school\'s data' });
    }

    const updatedSOC = await AdmissionActivitySOC.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    
    res.json({ message: 'Admission activity SOC updated', admissionSOC: updatedSOC });
  } catch (err) {
    res.status(500).json({ message: 'Error updating admission activity SOC', error: err.message });
  }
});

// Delete admission activity SOC (with authorization check)
router.delete('/activity-soc/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivitySOC.findById(req.params.id);
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admissionSOC.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot delete this school\'s data' });
    }

    await AdmissionActivitySOC.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admission activity SOC deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting admission activity SOC', error: err.message });
  }
});

// ===== ADMISSION ACTIVITY ENROLLMENT ROUTES =====

// Create new admission activity enrollment
router.post('/enrollment', schoolAuthMiddleware, async (req, res) => {
  try {
    const { ID, SCHOOL_ID, SCHOOL_YR_ID, ENROLLMENT_TYPE_CD, GENDER, NR_ENROLLED, ...rest } = req.body;

    if (!ID || !SCHOOL_YR_ID) {
      return res.status(400).json({ message: 'Required fields missing (ID, SCHOOL_YR_ID)' });
    }

    // Verify user is creating data for their own school
    if (SCHOOL_ID && SCHOOL_ID !== req.userSchoolId.toString()) {
      return res.status(403).json({ message: 'Access denied: Cannot create data for another school' });
    }

    const enrollment = new AdmissionActivityEnrollment({
      ID,
      SCHOOL_ID: req.userSchoolId,
      SCHOOL_YR_ID,
      ENROLLMENT_TYPE_CD,
      GENDER,
      NR_ENROLLED: NR_ENROLLED || 0,
      ...rest
    });

    await enrollment.save();
    res.status(201).json({ message: 'Enrollment created', enrollment });
  } catch (err) {
    res.status(500).json({ message: 'Error creating enrollment', error: err.message });
  }
});

// Get all enrollments for user's school only
router.get('/enrollment', schoolAuthMiddleware, async (req, res) => {
  try {
    const enrollments = await AdmissionActivityEnrollment.find({ SCHOOL_ID: req.userSchoolId });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enrollments', error: err.message });
  }
});

// Get enrollment by ID (with authorization check)
router.get('/enrollment/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const enrollment = await AdmissionActivityEnrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Verify user belongs to the school that owns this enrollment
    if (enrollment.SCHOOL_ID.toString() !== req.userSchoolId.toString()) {
      return res.status(403).json({ message: 'Access denied: You cannot access this school\'s data' });
    }
    
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enrollment', error: err.message });
  }
});

// Update enrollment (with authorization check)
router.put('/enrollment/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const enrollment = await AdmissionActivityEnrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Verify user belongs to the school that owns this enrollment
    if (enrollment.SCHOOL_ID.toString() !== req.userSchoolId.toString()) {
      return res.status(403).json({ message: 'Access denied: You cannot modify this school\'s data' });
    }

    const updatedEnrollment = await AdmissionActivityEnrollment.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    
    res.json({ message: 'Enrollment updated', enrollment: updatedEnrollment });
  } catch (err) {
    res.status(500).json({ message: 'Error updating enrollment', error: err.message });
  }
});

// Delete enrollment (with authorization check)
router.delete('/enrollment/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const enrollment = await AdmissionActivityEnrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Verify user belongs to the school that owns this enrollment
    if (enrollment.SCHOOL_ID.toString() !== req.userSchoolId.toString()) {
      return res.status(403).json({ message: 'Access denied: You cannot delete this school\'s data' });
    }

    await AdmissionActivityEnrollment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enrollment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting enrollment', error: err.message });
  }
});

// ===== STATISTICS ROUTES =====

// Get admission statistics for user's school only
router.get('/stats/admission', schoolAuthMiddleware, async (req, res) => {
  try {
    const totalApplications = await AdmissionActivity.countDocuments({ schoolId: req.userSchoolId });
    const acceptedApplications = await AdmissionActivity.countDocuments({ 
      schoolId: req.userSchoolId,
      status: 'Accepted' 
    });
    const rejectedApplications = await AdmissionActivity.countDocuments({ 
      schoolId: req.userSchoolId,
      status: 'Rejected' 
    });
    const enrolledStudents = await AdmissionActivityEnrollment.countDocuments({ 
      schoolId: req.userSchoolId,
      enrollmentStatus: 'Active' 
    });

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

// ===== PEER GROUP COMPARISON ROUTES =====

/**
 * Get peer group aggregated statistics without revealing individual school identities
 * Returns only aggregated metrics (averages, medians, etc.)
 * User CANNOT see individual school IDs or raw data
 */
router.get('/stats/peer-group', schoolAuthMiddleware, async (req, res) => {
  try {
    const { schoolYearId } = req.query;
    
    // Fetch all schools EXCEPT the user's school
    const peerActivities = await AdmissionActivity.find({
      schoolId: { $ne: req.userSchoolId },
      ...(schoolYearId && { schoolYearId })
    });

    if (peerActivities.length === 0) {
      return res.json({
        totalPeerSchools: 0,
        aggregatedMetrics: null,
        message: 'No peer schools found for comparison'
      });
    }

    // Calculate aggregated metrics WITHOUT revealing individual school data
    const totalApplications = peerActivities.length;
    const acceptedCount = peerActivities.filter(a => a.status === 'Accepted').length;
    const avgGpa = (peerActivities.reduce((sum, a) => sum + (a.gpa || 0), 0) / totalApplications).toFixed(2);
    const avgTestScore = (peerActivities.reduce((sum, a) => sum + (a.testScore || 0), 0) / totalApplications).toFixed(2);

    res.json({
      totalPeerSchools: new Set(peerActivities.map(a => a.schoolId.toString())).size,
      aggregatedMetrics: {
        averageAcceptanceRate: ((acceptedCount / totalApplications) * 100).toFixed(2),
        averageGPA: avgGpa,
        averageTestScore: avgTestScore,
        totalApplicationsInPeerGroup: totalApplications
      },
      message: 'Peer group aggregated metrics (individual school data hidden)'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching peer group statistics', error: err.message });
  }
});

/**
 * Get comparison between user's school and peer group
 * Shows user's metrics vs. peer averages
 */
router.get('/stats/comparison', schoolAuthMiddleware, async (req, res) => {
  try {
    const { schoolYearId } = req.query;

    // Get user's school stats
    const userStats = {
      totalApplications: await AdmissionActivity.countDocuments({ 
        schoolId: req.userSchoolId,
        ...(schoolYearId && { schoolYearId })
      }),
      acceptedCount: await AdmissionActivity.countDocuments({ 
        schoolId: req.userSchoolId,
        status: 'Accepted',
        ...(schoolYearId && { schoolYearId })
      })
    };

    // Get peer group stats
    const peerActivities = await AdmissionActivity.find({
      schoolId: { $ne: req.userSchoolId },
      ...(schoolYearId && { schoolYearId })
    });

    const peerStats = {
      averageAcceptanceRate: peerActivities.length > 0 
        ? ((peerActivities.filter(a => a.status === 'Accepted').length / peerActivities.length) * 100).toFixed(2)
        : 0,
      averageGPA: peerActivities.length > 0
        ? (peerActivities.reduce((sum, a) => sum + (a.gpa || 0), 0) / peerActivities.length).toFixed(2)
        : 0
    };

    res.json({
      yourSchool: {
        acceptanceRate: userStats.totalApplications > 0 
          ? ((userStats.acceptedCount / userStats.totalApplications) * 100).toFixed(2)
          : 0
      },
      peerGroupAverages: peerStats,
      comparisonNote: 'Individual peer school data is hidden for privacy'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comparison data', error: err.message });
  }
});

module.exports = router;
