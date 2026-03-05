const express = require('express');
const router = express.Router();
const { schoolAuthMiddleware, verifySchoolAccess } = require('../middleware/schoolAuth');
const AdmissionActivity = require('../models/AdmissionActivity');
const AdmissionActivityEnrollment = require('../models/AdmissionActivityEnrollment');
const EmployeePersonnel = require('../models/EmployeePersonnel');
const EmployeeAdminSupport = require('../models/EmployeeAdminSupport');
const School = require('../models/School');

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

// Create new admission activity SOC (merged with AdmissionActivity)
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

    const admissionSOC = new AdmissionActivity({
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

// Get all admission activities SOC for user's school only (merged with AdmissionActivity)
router.get('/activity-soc', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionsSOC = await AdmissionActivity.find({ SCHOOL_ID: req.userSchoolId });
    res.json(admissionsSOC);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admission activities SOC', error: err.message });
  }
});

// Get admission activity SOC by ID (with authorization check) (merged with AdmissionActivity)
router.get('/activity-soc/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivity.findById(req.params.id);
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

// Update admission activity SOC (with authorization check) (merged with AdmissionActivity)
router.put('/activity-soc/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivity.findById(req.params.id);
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admissionSOC.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot modify this school\'s data' });
    }

    const updatedSOC = await AdmissionActivity.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    
    res.json({ message: 'Admission activity SOC updated', admissionSOC: updatedSOC });
  } catch (err) {
    res.status(500).json({ message: 'Error updating admission activity SOC', error: err.message });
  }
});

// Delete admission activity SOC (with authorization check) (merged with AdmissionActivity)
router.delete('/activity-soc/:id', schoolAuthMiddleware, async (req, res) => {
  try {
    const admissionSOC = await AdmissionActivity.findById(req.params.id);
    if (!admissionSOC) {
      return res.status(404).json({ message: 'Admission activity SOC not found' });
    }
    
    // Verify user belongs to the school that owns this activity
    if (admissionSOC.SCHOOL_ID !== req.userSchoolId) {
      return res.status(403).json({ message: 'Access denied: You cannot delete this school\'s data' });
    }

    await AdmissionActivity.findByIdAndDelete(req.params.id);
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

const MIN_PEER_SCHOOLS = 3;

function toFiniteNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

function safeRate(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return numerator / denominator;
}

function toSchoolId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizePeerGroup(peerGroup) {
  const allowed = new Set([
    'all_schools',
    'region_cd',
    'group_cd',
  ]);
  if (!allowed.has(peerGroup)) return 'all_schools';
  return peerGroup;
}

function peerGroupLabel(peerGroup) {
  switch (peerGroup) {
    case 'all_schools':
      return 'All Schools';
    case 'region_cd':
      return 'Same Region (REGION_CD)';
    case 'group_cd':
      return 'Same Group (GROUP_CD)';
    default:
      return 'All Schools';
  }
}

function aggregateMetrics(summaries) {
  if (!Array.isArray(summaries) || summaries.length === 0) {
    return {
      applications: null,
      acceptances: null,
      enrollments: null,
      capacity: null,
      acceptanceRate: null,
      yieldRate: null,
      fillRate: null,
    };
  }

  const total = summaries.reduce(
    (acc, item) => {
      acc.applications += toFiniteNumber(item.applications);
      acc.acceptances += toFiniteNumber(item.acceptances);
      acc.enrollments += toFiniteNumber(item.enrollments);
      acc.capacity += toFiniteNumber(item.capacity);
      return acc;
    },
    { applications: 0, acceptances: 0, enrollments: 0, capacity: 0 }
  );

  const count = summaries.length;
  const avgApplications = total.applications / count;
  const avgAcceptances = total.acceptances / count;
  const avgEnrollments = total.enrollments / count;
  const avgCapacity = total.capacity / count;

  return {
    applications: avgApplications,
    acceptances: avgAcceptances,
    enrollments: avgEnrollments,
    capacity: avgCapacity,
    acceptanceRate: safeRate(avgAcceptances, avgApplications),
    yieldRate: safeRate(avgEnrollments, avgAcceptances),
    fillRate: safeRate(avgEnrollments, avgCapacity),
  };
}

function schoolSummaryFromTotals(totalsBySchool, schoolId) {
  const item = totalsBySchool.get(schoolId) ?? { 
    applications: 0, 
    acceptances: 0, 
    enrollments: 0, 
    capacity: 0,
    contractedEnroll: 0,
  };
  const applications = toFiniteNumber(item.applications);
  const acceptances = toFiniteNumber(item.acceptances);
  const enrollments = toFiniteNumber(item.enrollments);
  const capacity = toFiniteNumber(item.capacity);
  const contractedEnroll = toFiniteNumber(item.contractedEnroll);

  return {
    schoolId,
    applications,
    acceptances,
    enrollments,
    capacity,
    contractedEnroll,
    acceptanceRate: safeRate(acceptances, applications),
    yieldRate: safeRate(enrollments, acceptances),
    fillRate: safeRate(contractedEnroll, capacity),
  };
}

router.get('/stats/peer-groups', schoolAuthMiddleware, async (req, res) => {
  res.json([
    { key: 'all_schools', label: 'All Schools' },
    { key: 'region_cd', label: 'Same REGION_CD' },
    { key: 'group_cd', label: 'Same GROUP_CD' },
  ]);
});

router.get('/stats/peer-comparison', schoolAuthMiddleware, async (req, res) => {
  try {
    const schoolYearId = Number(req.query.schoolYearId);
    const yearFilter = Number.isFinite(schoolYearId) ? { SCHOOL_YR_ID: schoolYearId } : {};
    const userSchoolId = toSchoolId(req.userSchoolId);
    const category = req.query.category === 'Employee' ? 'Employee' : 'Admissions';

    if (!Number.isFinite(userSchoolId)) {
      return res.status(400).json({ message: 'Invalid school identity in auth token' });
    }

    const peerGroup = normalizePeerGroup(req.query.peerGroup);

    const totalsBySchool = new Map();

    if (category === 'Employee') {
      const personnelAgg = await EmployeePersonnel.aggregate([
        { $match: yearFilter },
        {
          $group: {
            _id: '$SCHOOL_ID',
            totalEmployees: { $sum: { $ifNull: ['$TOTAL_EMPLOYEES', 0] } },
            fullTimeEmployees: { $sum: { $ifNull: ['$FT_EMPLOYEES', 0] } },
            subcontractFTE: { $sum: { $ifNull: ['$SUBCONTRACT_FTE', 0] } },
          },
        },
      ]);

      const teacherAgg = await EmployeePersonnel.aggregate([
        { $match: { ...yearFilter, EMP_CAT_CD: { $in: ['EMPCAT_T', 'EMPCAT_TS'] } } },
        {
          $group: {
            _id: '$SCHOOL_ID',
            teacherCount: { $sum: { $ifNull: ['$FT_EMPLOYEES', 0] } },
          },
        },
      ]);

      const adminSupportAgg = await EmployeeAdminSupport.aggregate([
        { $match: yearFilter },
        {
          $group: {
            _id: '$SCHOOL_ID',
            exemptCount: { $sum: { $ifNull: ['$NR_EXEMPT', 0] } },
            nonExemptCount: { $sum: { $ifNull: ['$NR_NONEXEMPT', 0] } },
          },
        },
      ]);

      for (const row of personnelAgg) {
        const schoolId = toSchoolId(row?._id);
        if (!Number.isFinite(schoolId)) continue;
        totalsBySchool.set(schoolId, {
          totalEmployees: toFiniteNumber(row.totalEmployees),
          fullTimeEmployees: toFiniteNumber(row.fullTimeEmployees),
          subcontractFTE: toFiniteNumber(row.subcontractFTE),
          teacherCount: 0,
          exemptCount: 0,
          nonExemptCount: 0,
        });
      }

      for (const row of teacherAgg) {
        const schoolId = toSchoolId(row?._id);
        if (!Number.isFinite(schoolId)) continue;
        const existing = totalsBySchool.get(schoolId) ?? {
          totalEmployees: 0,
          fullTimeEmployees: 0,
          subcontractFTE: 0,
          teacherCount: 0,
          exemptCount: 0,
          nonExemptCount: 0,
        };
        totalsBySchool.set(schoolId, {
          ...existing,
          teacherCount: toFiniteNumber(row.teacherCount),
        });
      }

      for (const row of adminSupportAgg) {
        const schoolId = toSchoolId(row?._id);
        if (!Number.isFinite(schoolId)) continue;
        const existing = totalsBySchool.get(schoolId) ?? {
          totalEmployees: 0,
          fullTimeEmployees: 0,
          subcontractFTE: 0,
          teacherCount: 0,
          exemptCount: 0,
          nonExemptCount: 0,
        };
        totalsBySchool.set(schoolId, {
          ...existing,
          exemptCount: toFiniteNumber(row.exemptCount),
          nonExemptCount: toFiniteNumber(row.nonExemptCount),
        });
      }
    } else {
      const activityAgg = await AdmissionActivity.aggregate([
        { $match: yearFilter },
        {
          $group: {
            _id: '$SCHOOL_ID',
            applications: { $sum: { $ifNull: ['$COMPLETED_APPLICATION_TOTAL', 0] } },
            acceptances: { $sum: { $ifNull: ['$ACCEPTANCES_TOTAL', 0] } },
            enrollments: { $sum: { $ifNull: ['$NEW_ENROLLMENTS_TOTAL', 0] } },
            capacity: { $sum: { $ifNull: ['$CAPACITY_ENROLL', 0] } },
            contractedBoys: { $sum: { $ifNull: ['$CONTRACTED_ENROLL_BOYS', 0] } },
            contractedGirls: { $sum: { $ifNull: ['$CONTRACTED_ENROLL_GIRLS', 0] } },
          },
        },
      ]);

      for (const row of activityAgg) {
        const schoolId = toSchoolId(row?._id);
        if (!Number.isFinite(schoolId)) continue;
        totalsBySchool.set(schoolId, {
          applications: toFiniteNumber(row.applications),
          acceptances: toFiniteNumber(row.acceptances),
          enrollments: toFiniteNumber(row.enrollments),
          capacity: toFiniteNumber(row.capacity),
          contractedEnroll: toFiniteNumber(row.contractedBoys) + toFiniteNumber(row.contractedGirls),
        });
      }
    }

    const allSchoolSummaries = Array.from(totalsBySchool.entries()).map(([schoolId]) => {
      if (category === 'Employee') {
        const item = totalsBySchool.get(schoolId) ?? {};
        const totalEmployees = toFiniteNumber(item.totalEmployees);
        const fullTimeEmployees = toFiniteNumber(item.fullTimeEmployees);
        const subcontractFTE = toFiniteNumber(item.subcontractFTE);
        const teacherCount = toFiniteNumber(item.teacherCount);
        const exemptCount = toFiniteNumber(item.exemptCount);
        const nonExemptCount = toFiniteNumber(item.nonExemptCount);
        return {
          schoolId,
          totalEmployees,
          fullTimeEmployees,
          subcontractFTE,
          teacherCount,
          exemptCount,
          nonExemptCount,
          fullTimeRate: safeRate(fullTimeEmployees, totalEmployees),
          exemptRate: safeRate(exemptCount, exemptCount + nonExemptCount),
        };
      }

      return schoolSummaryFromTotals(totalsBySchool, schoolId);
    });
    const yourSchool = schoolSummaryFromTotals(totalsBySchool, userSchoolId);
    const yourSchoolEmployee = category === 'Employee'
      ? (allSchoolSummaries.find((entry) => entry.schoolId === userSchoolId) ?? {
          schoolId: userSchoolId,
          totalEmployees: 0,
          fullTimeEmployees: 0,
          subcontractFTE: 0,
          teacherCount: 0,
          exemptCount: 0,
          nonExemptCount: 0,
          fullTimeRate: null,
          exemptRate: null,
        })
      : null;

    const peerCandidates = allSchoolSummaries.filter((entry) => entry.schoolId !== userSchoolId);

    const schoolIds = allSchoolSummaries.map((entry) => entry.schoolId);
    if (!schoolIds.includes(userSchoolId)) {
      schoolIds.push(userSchoolId);
    }

    const schoolMetaRows = await School.find(
      { ID: { $in: schoolIds } },
      { ID: 1, GROUP_CD: 1, REGION_CD: 1 }
    ).lean();

    const schoolMetaById = new Map(
      schoolMetaRows
        .map((row) => [toSchoolId(row?.ID), row])
        .filter(([schoolId]) => Number.isFinite(schoolId))
    );

    const userSchoolMeta = schoolMetaById.get(userSchoolId) ?? null;
    const userRegionCd = (userSchoolMeta?.REGION_CD ?? '').trim();
    const userGroupCd = (userSchoolMeta?.GROUP_CD ?? '').trim();

    let peerSchools = peerCandidates;
    let peerFilterWarning = null;

    if (peerGroup === 'region_cd') {
      if (!userRegionCd) {
        peerSchools = [];
        peerFilterWarning = 'Your school has no REGION_CD value.';
      } else {
        peerSchools = peerCandidates.filter((entry) => {
          const peerMeta = schoolMetaById.get(entry.schoolId);
          const peerRegion = (peerMeta?.REGION_CD ?? '').trim();
          return peerRegion && peerRegion === userRegionCd;
        });
      }
    } else if (peerGroup === 'group_cd') {
      if (!userGroupCd) {
        peerSchools = [];
        peerFilterWarning = 'Your school has no GROUP_CD value.';
      } else {
        peerSchools = peerCandidates.filter((entry) => {
          const peerMeta = schoolMetaById.get(entry.schoolId);
          const peerGroupCd = (peerMeta?.GROUP_CD ?? '').trim();
          return peerGroupCd && peerGroupCd === userGroupCd;
        });
      }
    }

    const redacted = peerSchools.length < MIN_PEER_SCHOOLS;
    const peerAverage = category === 'Employee'
      ? (() => {
          if (redacted || peerSchools.length === 0) {
            return {
              totalEmployees: null,
              fullTimeEmployees: null,
              subcontractFTE: null,
              teacherCount: null,
              exemptCount: null,
              nonExemptCount: null,
              fullTimeRate: null,
              exemptRate: null,
            };
          }

          const count = peerSchools.length;
          const sums = peerSchools.reduce(
            (acc, item) => {
              acc.totalEmployees += toFiniteNumber(item.totalEmployees);
              acc.fullTimeEmployees += toFiniteNumber(item.fullTimeEmployees);
              acc.subcontractFTE += toFiniteNumber(item.subcontractFTE);
              acc.teacherCount += toFiniteNumber(item.teacherCount);
              acc.exemptCount += toFiniteNumber(item.exemptCount);
              acc.nonExemptCount += toFiniteNumber(item.nonExemptCount);
              return acc;
            },
            { totalEmployees: 0, fullTimeEmployees: 0, subcontractFTE: 0, teacherCount: 0, exemptCount: 0, nonExemptCount: 0 }
          );

          const totalEmployees = sums.totalEmployees / count;
          const fullTimeEmployees = sums.fullTimeEmployees / count;
          const subcontractFTE = sums.subcontractFTE / count;
          const teacherCount = sums.teacherCount / count;
          const exemptCount = sums.exemptCount / count;
          const nonExemptCount = sums.nonExemptCount / count;

          return {
            totalEmployees,
            fullTimeEmployees,
            subcontractFTE,
            teacherCount,
            exemptCount,
            nonExemptCount,
            fullTimeRate: safeRate(fullTimeEmployees, totalEmployees),
            exemptRate: safeRate(exemptCount, exemptCount + nonExemptCount),
          };
        })()
      : (redacted ? aggregateMetrics([]) : aggregateMetrics(peerSchools));

    if (category === 'Employee') {
      return res.json({
        category,
        schoolYearId: Number.isFinite(schoolYearId) ? schoolYearId : null,
        peerGroup,
        peerGroupLabel: peerGroupLabel(peerGroup),
        peerSchoolCount: peerSchools.length,
        privacy: {
          minimumPeerSchools: MIN_PEER_SCHOOLS,
          isRedacted: redacted,
        },
        yourSchool: {
          totalEmployees: yourSchoolEmployee.totalEmployees,
          fullTimeEmployees: yourSchoolEmployee.fullTimeEmployees,
          subcontractFTE: yourSchoolEmployee.subcontractFTE,
          teacherCount: yourSchoolEmployee.teacherCount,
          exemptCount: yourSchoolEmployee.exemptCount,
          nonExemptCount: yourSchoolEmployee.nonExemptCount,
          fullTimeRate: yourSchoolEmployee.fullTimeRate,
          exemptRate: yourSchoolEmployee.exemptRate,
        },
        peerAverage,
        comparison: redacted
          ? null
          : {
              totalEmployeesDiff: (yourSchoolEmployee.totalEmployees ?? 0) - (peerAverage.totalEmployees ?? 0),
              fullTimeRateDiff: (yourSchoolEmployee.fullTimeRate ?? 0) - (peerAverage.fullTimeRate ?? 0),
              exemptRateDiff: (yourSchoolEmployee.exemptRate ?? 0) - (peerAverage.exemptRate ?? 0),
              subcontractFTEDiff: (yourSchoolEmployee.subcontractFTE ?? 0) - (peerAverage.subcontractFTE ?? 0),
            },
        peerFilterContext: {
          regionCd: userRegionCd || null,
          groupCd: userGroupCd || null,
        },
        message: redacted
          ? `${peerFilterWarning ? `${peerFilterWarning} ` : ''}Peer group has fewer than ${MIN_PEER_SCHOOLS} schools. Aggregated peer metrics are hidden for privacy.`
          : 'Comparison includes only aggregated peer averages. Individual peer school identities and raw records are hidden.',
      });
    }

    res.json({
      category,
      schoolYearId: Number.isFinite(schoolYearId) ? schoolYearId : null,
      peerGroup,
      peerGroupLabel: peerGroupLabel(peerGroup),
      peerSchoolCount: peerSchools.length,
      privacy: {
        minimumPeerSchools: MIN_PEER_SCHOOLS,
        isRedacted: redacted,
      },
      yourSchool: {
        applications: yourSchool.applications,
        acceptances: yourSchool.acceptances,
        enrollments: yourSchool.enrollments,
        capacity: yourSchool.capacity,
        acceptanceRate: yourSchool.acceptanceRate,
        yieldRate: yourSchool.yieldRate,
        fillRate: yourSchool.fillRate,
      },
      peerAverage,
      comparison: redacted
        ? null
        : {
            acceptanceRateDiff: (yourSchool.acceptanceRate ?? 0) - (peerAverage.acceptanceRate ?? 0),
            yieldRateDiff: (yourSchool.yieldRate ?? 0) - (peerAverage.yieldRate ?? 0),
            fillRateDiff: (yourSchool.fillRate ?? 0) - (peerAverage.fillRate ?? 0),
            enrollmentDiff: (yourSchool.enrollments ?? 0) - (peerAverage.enrollments ?? 0),
          },
      peerFilterContext: {
        regionCd: userRegionCd || null,
        groupCd: userGroupCd || null,
      },
      message: redacted
        ? `${peerFilterWarning ? `${peerFilterWarning} ` : ''}Peer group has fewer than ${MIN_PEER_SCHOOLS} schools. Aggregated peer metrics are hidden for privacy.`
        : 'Comparison includes only aggregated peer averages. Individual peer school identities and raw records are hidden.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching peer comparison', error: err.message });
  }
});

module.exports = router;
