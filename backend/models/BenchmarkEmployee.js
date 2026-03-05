const mongoose = require('mongoose');

const benchmarkEmployeeSchema = new mongoose.Schema(
    {
        SCHOOL_ID: { type: Number, required: true },

        SCHOOL_YR_ID: { type: Number, required: true },

        EMP_CAT_CD: { type: String, required: true },

        TOTAL_EMPLOYEES: { type: Number, default: null },

        FT_EMPLOYEES: { type: Number, default: null },

        SUBCONTRACT_FTE: { type: Number, default: null },

        FTE_ONLY_SALARY_MIN: { type: Number, default: null },

        FTE_ONLY_SALARY_MAX: { type: Number, default: null },

        POC_EMPLOYEES: { type: Number, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('BenchmarkEmployee', benchmarkEmployeeSchema);
