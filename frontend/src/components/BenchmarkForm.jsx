import React, { useContext, useState } from "react";
import axios from "axios";
import DashboardHeader from "./dashboard/DashboardHeader";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

import BenchmarkVoiceFillButton from "./BenchmarkVoiceFillButton"; // <-- adjust path if needed

const BenchmarkForm = () => {
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = user?.schoolId ?? "N/A";

  /* stores user input */
  const [formData, setFormData] = useState({
    year: "",
    applicants: "",
    enrolled: "",
    internationalPerc: "",
    teacherStudentRatio: "",
    avgGPA: "",
    aveTestScore: "",
    percentAthlete: "",
  });

  /* if validation fails error appears */
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* updates specific field when user types */
  const change = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* validations (now accepts optional data for voice apply) */
  const validate = (data = formData) => {
    let error = {};

    if (!data.year) error.year = "Year is required.";

    // NOTE: your current rule says test score 0-100 (if you meant SAT/ACT, change this)
    if (data.aveTestScore && (Number(data.aveTestScore) < 0 || Number(data.aveTestScore) > 100)) {
      error.aveTestScore = "Test score must be between 0 and 100.";
    }

    if (data.teacherStudentRatio && Number(data.teacherStudentRatio) <= 0) {
      error.teacherStudentRatio = "Ratio must be greater than 0.";
    }

    /* Field checks */
    if (!data.applicants) error.applicants = "Total applicants required.";
    if (!data.enrolled) error.enrolled = "Total enrolled required.";

    if (data.enrolled && data.applicants && Number(data.enrolled) > Number(data.applicants)) {
      error.enrolled = "Total enrolled cannot exceed total applicants.";
    }

    /* Check GPA input */
    if (data.avgGPA && (Number(data.avgGPA) < 0 || Number(data.avgGPA) > 4)) {
      error.avgGPA = "GPA must be between 0 and 4.";
    }

    /* Check percentage inputs */
    if (data.percentAthlete && (Number(data.percentAthlete) < 0 || Number(data.percentAthlete) > 100)) {
      error.percentAthlete = "Must be between 0 and 100.";
    }

    if (data.internationalPerc && (Number(data.internationalPerc) < 0 || Number(data.internationalPerc) > 100)) {
      error.internationalPerc = "Must be between 0 and 100.";
    }

    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const validateAndShowErrors = (next) => {
    // validates and updates error UI
    return validate(next);
  };

  /* submit form */
  const submit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        setIsSubmitting(true);
        await axios.post("/api/benchmark", formData);
        alert("Form is saved and submitted.");
      } catch (err) {
        alert("Error saving form.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ✅ Voice-fill floating button (fills this formData) */}
      <BenchmarkVoiceFillButton
        formData={formData}
        setFormData={(next) => {
          setFormData(next);
          validateAndShowErrors(next);
        }}
        validateAndShowErrors={validateAndShowErrors}
      />

      <DashboardHeader schoolId={schoolId} onLogout={logout} />

      <main className="mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto mb-3">
          <Link
            to="/dashboard"
            className="inline-block rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-3xl mx-auto mt-4 bg-white border p-8 rounded shadow">
          <h2 className="text-2xl font-semibold mb-6">{formData.year} Benchmark Form</h2>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Year</h3>
              <input
                type="number"
                name="year"
                value={formData.year}              // ✅ controlled
                placeholder="Year"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.year && <p className="text-red-600 text-sm">{errors.year}</p>}
            </div>

            {/* Admissions */}
            <div>
              <h3 className="font-semibold mb-2">Admissions</h3>

              <input
                type="number"
                name="applicants"
                value={formData.applicants}        // ✅ controlled
                placeholder="Total Applicants"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.applicants && <p className="text-red-600 text-sm">{errors.applicants}</p>}

              <input
                type="number"
                name="enrolled"
                value={formData.enrolled}          // ✅ controlled
                placeholder="Total Enrolled"
                onChange={change}
                className="w-full border p-2 rounded"
              />
              {errors.enrolled && <p className="text-red-600 text-sm">{errors.enrolled}</p>}
            </div>

            {/* Demographics */}
            <div>
              <h3 className="font-semibold mb-2">Demographics</h3>

              <input
                type="number"
                name="internationalPerc"
                value={formData.internationalPerc} // ✅ controlled
                placeholder="% International Students"
                onChange={change}
                className="w-full border p-2 rounded"
              />
              {errors.internationalPerc && (
                <p className="text-red-600 text-sm">{errors.internationalPerc}</p>
              )}
            </div>

            {/* Academics */}
            <div>
              <h3 className="font-semibold mb-2">Academics</h3>

              <input
                type="number"
                step="0.01"
                name="avgGPA"
                value={formData.avgGPA}            // ✅ controlled
                placeholder="Average GPA (0-4)"
                onChange={change}
                className="w-full border p-2 rounded"
              />
              {errors.avgGPA && <p className="text-red-600 text-sm">{errors.avgGPA}</p>}

              <input
                type="number"
                step="0.01"
                name="aveTestScore"
                value={formData.aveTestScore}      // ✅ controlled
                placeholder="Average Test Score"
                onChange={change}
                className="w-full border p-2 rounded mt-2"
              />
              {errors.aveTestScore && <p className="text-red-600 text-sm">{errors.aveTestScore}</p>}

              <input
                type="number"
                step="0.01"
                name="teacherStudentRatio"
                value={formData.teacherStudentRatio} // ✅ controlled
                placeholder="Student-Teacher Ratio"
                onChange={change}
                className="w-full border p-2 rounded mt-2"
              />
              {errors.teacherStudentRatio && (
                <p className="text-red-600 text-sm">{errors.teacherStudentRatio}</p>
              )}
            </div>

            {/* Athletics */}
            <div>
              <h3 className="font-semibold mb-2">Athletics</h3>

              <input
                type="number"
                name="percentAthlete"
                value={formData.percentAthlete}    // ✅ controlled
                placeholder="% Students in Athletics"
                onChange={change}
                className="w-full border p-2 rounded"
              />
              {errors.percentAthlete && (
                <p className="text-red-600 text-sm">{errors.percentAthlete}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700"
            >
              Save and Submit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BenchmarkForm;