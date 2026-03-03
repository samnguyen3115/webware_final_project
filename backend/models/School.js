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
