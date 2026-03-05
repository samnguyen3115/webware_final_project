const mongoose = require('mongoose');

const admissionActivitySchema = new mongoose.Schema({
  ID: {
    type: Number,
    unique: true
  },
  SCHOOL_ID: {
    type: Number
  },
  SCHOOL_YR_ID: {
    type: Number
  },
  CAPACITY_ENROLL: {
    type: Number
  },
  CONTRACTED_ENROLL_BOYS: {
    type: Number,
    default: 0
  },
  CONTRACTED_ENROLL_GIRLS: {
    type: Number,
    default: 0
  },
  GRADE_DEF_ID: {
    type: Number
  },
  CONTRACTED_ENROLL_NB: {
    type: Number
  },
  COMPLETED_APPLICATION_TOTAL: {
    type: Number,
    default: 0
  },
  ACCEPTANCES_TOTAL: {
    type: Number,
    default: 0
  },
  NEW_ENROLLMENTS_TOTAL: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AdmissionActivity', admissionActivitySchema, 'admissionactivities');
