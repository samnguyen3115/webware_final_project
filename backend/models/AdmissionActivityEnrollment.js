const mongoose = require('mongoose');

const admissionActivityEnrollmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  admissionActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionActivity',
    required: true
  },
  admissionActivitySOCId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionActivitySOC'
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  schoolYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolYear'
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  enrollmentDate: {
    type: Date,
    required: true
  },
  enrollmentStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Deferred', 'Withdrawn'],
    default: 'Active'
  },
  grade: {
    type: String,
    required: true
  },
  classCode: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  tuitionPaid: {
    type: Boolean,
    default: false
  },
  tuitionAmount: {
    type: Number
  },
  scholarshipAmount: {
    type: Number
  },
  parentGuardianName: {
    type: String
  },
  parentGuardianEmail: {
    type: String
  },
  parentGuardianPhone: {
    type: String
  },
  emergengyContactName: {
    type: String
  },
  emergencyContactPhone: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AdmissionActivityEnrollment', admissionActivityEnrollmentSchema);
