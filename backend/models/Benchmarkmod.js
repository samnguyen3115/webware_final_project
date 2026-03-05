const mongoose = require("mongoose");

const BenchmarkSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },

  totalApplicants: { type: Number, required: true },
  totalOffered: { type: Number, required: true },
  totalEnrolled: { type: Number, required: true },

  percentInState: { type: Number },
  percentOutofState: { type: Number },
  internationalPerc: { type: Number },

  aveGPA: { type: Number },       
  aveTestScore: { type: Number },

  students: { type: Number },
  teachers: { type: Number },
  teacherStudentRatio: { type: Number }, 

  percentAthlete: { type: Number },

  entryDateTime: { type: Date },
},
{ timestamps: true });

module.exports = mongoose.model("Benchmark", BenchmarkSchema);