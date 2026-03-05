const mongoose = require('mongoose');

const employeeAdminSupportSchema = new mongoose.Schema({
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
  ADMIN_STAFF_FUNC_CD: {
    type: String,
    default: ''
  },
  NR_EXEMPT: {
    type: Number,
    default: 0
  },
  NR_NONEXEMPT: {
    type: Number,
    default: 0
  },
  FTE_EXEMPT: {
    type: Number,
    default: 0
  },
  FTE_NONEXEMPT: {
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmployeeAdminSupport', employeeAdminSupportSchema, 'employeeadminsupports');
