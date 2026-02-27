const mongoose = require('mongoose');

const admissionActivityEnrollmentSchema = new mongoose.Schema({
  ID: {
    type: String,
    required: true,
    unique: true
  },
  SCHOOL_ID: {
    type: Number
  },
  SCHOOL_YR_ID: {
    type: Number
  },
  ENROLLMENT_TYPE_CD: {
    type: String
  },
  GENDER: {
    type: String,
    enum: ['M', 'F', 'U', 'NB', 'Other']
  },
  NR_ENROLLED: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AdmissionActivityEnrollment', admissionActivityEnrollmentSchema, 'admissionactivityenrollments');
