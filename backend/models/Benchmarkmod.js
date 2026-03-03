const mongoose = require('mongoose');

const benchmarkSchema = new mongoose.Schema(
    {
        year: { type: Number, required: true },
        applicants: { type: Number, required: true },
        enrolled: { type: Number, required: true },
        internationalPerc: { type: Number, default: null },
        teacherStudentRatio: { type: Number, default: null },
        avgGPA: { type: Number, default: null },
        aveTestScore: { type: Number, default: null },
        percentAthlete: { type: Number, default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        schoolId: { type: Number, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Benchmark', benchmarkSchema);
