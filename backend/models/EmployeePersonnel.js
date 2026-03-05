const mongoose = require('mongoose');

const employeePersonnelSchema = new mongoose.Schema({
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
  EMP_CAT_CD: {
    type: String,
    default: ''
  },
  SUBCONTRACT_NUM: {
    type: Number,
    default: 0
  },
  SUBCONTRACT_FTE: {
    type: Number,
    default: 0
  },
  FTE_ONLY_NUM: {
    type: Number,
    default: 0
  },
  FTE_ONLY_SALARY_MIN: {
    type: Number,
    default: 0
  },
  FTE_ONLY_SALARY_MAX: {
    type: Number,
    default: 0
  },
  TOTAL_EMPLOYEES: {
    type: Number,
    default: 0
  },
  FT_EMPLOYEES: {
    type: Number,
    default: 0
  },
  POC_EMPLOYEES: {
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

module.exports = mongoose.model('EmployeePersonnel', employeePersonnelSchema, 'employeepersonnels');
