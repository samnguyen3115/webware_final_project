const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  ID: {
    type: Number,
    required: true,
    unique: true,
    primaryKey: true
  },
  NAME_TX: {
    type: String,
    required: true
  },
  GROUP_CD: {
    type: String,
    default: null
  },
  REGION_CD: {
    type: String,
    default: null
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

module.exports = mongoose.model('School', schoolSchema);
