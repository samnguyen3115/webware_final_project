const mongoose = require('mongoose');

const benchmarkSchema = new mongoose.Schema(
    {
        SCHOOL_ID: { type: Number, required: true },

        SCHOOL_YR_ID: { type: Number, required: true },

        CAPACITY_ENROLL: { type: Number, default: null },

        CONTRACTED_ENROLL_BOYS: { type: Number, default: null },

        CONTRACTED_ENROLL_GIRLS: { type: Number, default: null },

        GRADE_DEF_ID: { type: Number, required: true },

        CONTRACTED_ENROLL_NB: { type: Number, default: null },

        COMPLETED_APPLICATION_TOTAL: { type: Number, default: 0 },

        ACCEPTANCES_TOTAL: { type: Number, default: 0 },

        NEW_ENROLLMENTS_TOTAL: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Benchmark', benchmarkSchema);
