const mongoose = require('mongoose');

const admissionActivitySchema = new mongoose.Schema({
  ID: {
    type: Number,
    required: true,
    unique: true
  },
  SCHOOL_ID: {
    type: Number,
    default: 0
  },
  SCHOOL_YR_ID: {
    type: Number,
    default: 0
  },
  CAPACITY_ENROLL: {
    type: Number,
    default: 0
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
    type: Number,
    default: 0
  },
  LOCK_ID: {
    type: Number,
    default: 0
  },
  UPDATE_USER_TX: {
    type: String,
    default: ''
  },
  UPDATE_DT: {
    type: String,
    default: ''
  },
  CONTRACTED_ENROLL_NB: {
    type: Number,
    default: 0
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
