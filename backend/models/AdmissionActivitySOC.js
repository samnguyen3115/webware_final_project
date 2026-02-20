const mongoose = require('mongoose');

const admissionActivitySOCSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  ethnicity: {
    type: String
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'In Review', 'Accepted', 'Rejected', 'Enrolled'],
    default: 'Applied'
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0
  },
  testScore: {
    type: Number
  },
  essays: {
    type: String
  },
  recommendationLetters: {
    type: Number
  },
  scholarshipEligibility: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('AdmissionActivitySOC', admissionActivitySOCSchema);
