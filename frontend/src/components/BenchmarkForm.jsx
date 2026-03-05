import React, { useContext, useState } from "react";
import axios from "axios";
import DashboardHeader from "./dashboard/DashboardHeader";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

import BenchmarkVoiceFillButton from "./BenchmarkVoiceFillButton"; // <-- adjust path if needed

const BenchmarkForm = () => {
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = Number(user?.schoolId) || "N/A";

  /* stores user input */
  const [formData, setFormData] = useState({
    SCHOOL_ID: Number(user?.schoolId) || "",
    SCHOOL_YR_ID: "",
    GRADE_DEF_ID: "",
    CAPACITY_ENROLL: "",
    CONTRACTED_ENROLL_BOYS: "",
    CONTRACTED_ENROLL_GIRLS: "",
    CONTRACTED_ENROLL_NB: "",
    COMPLETED_APPLICATION_TOTAL: "",
    ACCEPTANCES_TOTAL: "",
    NEW_ENROLLMENTS_TOTAL: "",
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

    const requiredFields = ["SCHOOL_ID", "SCHOOL_YR_ID", "GRADE_DEF_ID"];
    requiredFields.forEach((field) => {
      if (data[field] === "" || data[field] === null || data[field] === undefined) {
        error[field] = "Required field.";
      }
    });

    const numericFields = [
      "SCHOOL_ID",
      "SCHOOL_YR_ID",
      "GRADE_DEF_ID",
      "CAPACITY_ENROLL",
      "CONTRACTED_ENROLL_BOYS",
      "CONTRACTED_ENROLL_GIRLS",
      "CONTRACTED_ENROLL_NB",
      "COMPLETED_APPLICATION_TOTAL",
      "ACCEPTANCES_TOTAL",
      "NEW_ENROLLMENTS_TOTAL",
    ];

    numericFields.forEach((field) => {
      const value = data[field];
      if (value === "" || value === null || value === undefined) return;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        error[field] = "Must be a valid number.";
      } else if (parsed < 0) {
        error[field] = "Cannot be negative.";
      }
    });

    if (
      data.ACCEPTANCES_TOTAL !== "" &&
      data.COMPLETED_APPLICATION_TOTAL !== "" &&
      Number(data.ACCEPTANCES_TOTAL) > Number(data.COMPLETED_APPLICATION_TOTAL)
    ) {
      error.ACCEPTANCES_TOTAL = "Cannot exceed completed applications.";
    }

    if (
      data.NEW_ENROLLMENTS_TOTAL !== "" &&
      data.ACCEPTANCES_TOTAL !== "" &&
      Number(data.NEW_ENROLLMENTS_TOTAL) > Number(data.ACCEPTANCES_TOTAL)
    ) {
      error.NEW_ENROLLMENTS_TOTAL = "Cannot exceed acceptances.";
    }

    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const buildPayload = (data) => ({
    SCHOOL_ID: Number(data.SCHOOL_ID),
    SCHOOL_YR_ID: Number(data.SCHOOL_YR_ID),
    GRADE_DEF_ID: Number(data.GRADE_DEF_ID),
    CAPACITY_ENROLL: toNumberOrNull(data.CAPACITY_ENROLL),
    CONTRACTED_ENROLL_BOYS: toNumberOrNull(data.CONTRACTED_ENROLL_BOYS),
    CONTRACTED_ENROLL_GIRLS: toNumberOrNull(data.CONTRACTED_ENROLL_GIRLS),
    CONTRACTED_ENROLL_NB: toNumberOrNull(data.CONTRACTED_ENROLL_NB),
    COMPLETED_APPLICATION_TOTAL: toNumberOrNull(data.COMPLETED_APPLICATION_TOTAL) ?? 0,
    ACCEPTANCES_TOTAL: toNumberOrNull(data.ACCEPTANCES_TOTAL) ?? 0,
    NEW_ENROLLMENTS_TOTAL: toNumberOrNull(data.NEW_ENROLLMENTS_TOTAL) ?? 0,
  });

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
        const payload = buildPayload(formData);
        await axios.post("/api/benchmark", payload, { withCredentials: true });
        alert("Form is saved and submitted.");
        setErrors({});
      } catch (err) {
        const message = err?.response?.data?.error || err?.response?.data?.message || "Error saving form.";
        alert(message);
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
          <h2 className="text-2xl font-semibold mb-6">Benchmark Form</h2>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Required IDs</h3>

              <input
                type="number"
                name="SCHOOL_ID"
                value={formData.SCHOOL_ID}
                placeholder="School ID"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.SCHOOL_ID && <p className="text-red-600 text-sm">{errors.SCHOOL_ID}</p>}

              <input
                type="number"
                name="SCHOOL_YR_ID"
                value={formData.SCHOOL_YR_ID}
                placeholder="School Year ID"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.SCHOOL_YR_ID && <p className="text-red-600 text-sm">{errors.SCHOOL_YR_ID}</p>}

              <input
                type="number"
                name="GRADE_DEF_ID"
                value={formData.GRADE_DEF_ID}
                placeholder="Grade Definition ID"
                onChange={change}
                className="w-full border p-2 rounded"
              />
              {errors.GRADE_DEF_ID && <p className="text-red-600 text-sm">{errors.GRADE_DEF_ID}</p>}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Capacity & Contracted Enrollment</h3>

              <input
                type="number"
                name="CAPACITY_ENROLL"
                value={formData.CAPACITY_ENROLL}
                placeholder="Capacity Enrollment"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.CAPACITY_ENROLL && <p className="text-red-600 text-sm">{errors.CAPACITY_ENROLL}</p>}

              <input
                type="number"
                name="CONTRACTED_ENROLL_BOYS"
                value={formData.CONTRACTED_ENROLL_BOYS}
                placeholder="Contracted Enrollment (Boys)"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.CONTRACTED_ENROLL_BOYS && <p className="text-red-600 text-sm">{errors.CONTRACTED_ENROLL_BOYS}</p>}

              <input
                type="number"
                name="CONTRACTED_ENROLL_GIRLS"
                value={formData.CONTRACTED_ENROLL_GIRLS}
                placeholder="Contracted Enrollment (Girls)"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.CONTRACTED_ENROLL_GIRLS && <p className="text-red-600 text-sm">{errors.CONTRACTED_ENROLL_GIRLS}</p>}

              <input
                type="number"
                name="CONTRACTED_ENROLL_NB"
                value={formData.CONTRACTED_ENROLL_NB}
                placeholder="Contracted Enrollment (Non-Binary)"
                onChange={change}
                className="w-full border p-2 rounded"
              />
              {errors.CONTRACTED_ENROLL_NB && (
                <p className="text-red-600 text-sm">{errors.CONTRACTED_ENROLL_NB}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Application Outcomes</h3>

              <input
                type="number"
                name="COMPLETED_APPLICATION_TOTAL"
                value={formData.COMPLETED_APPLICATION_TOTAL}
                placeholder="Completed Applications Total"
                onChange={change}
                className="w-full border p-2 rounded mb-2"
              />
              {errors.COMPLETED_APPLICATION_TOTAL && <p className="text-red-600 text-sm">{errors.COMPLETED_APPLICATION_TOTAL}</p>}

              <input
                type="number"
                name="ACCEPTANCES_TOTAL"
                value={formData.ACCEPTANCES_TOTAL}
                placeholder="Acceptances Total"
                onChange={change}
                className="w-full border p-2 rounded mt-2"
              />
              {errors.ACCEPTANCES_TOTAL && <p className="text-red-600 text-sm">{errors.ACCEPTANCES_TOTAL}</p>}

              <input
                type="number"
                name="NEW_ENROLLMENTS_TOTAL"
                value={formData.NEW_ENROLLMENTS_TOTAL}
                placeholder="New Enrollments Total"
                onChange={change}
                className="w-full border p-2 rounded mt-2"
              />
              {errors.NEW_ENROLLMENTS_TOTAL && (
                <p className="text-red-600 text-sm">{errors.NEW_ENROLLMENTS_TOTAL}</p>
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