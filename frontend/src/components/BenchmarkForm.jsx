import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

import BenchmarkVoiceFillButton from "./BenchmarkVoiceFillButton";

const EMPLOYEE_CATEGORY_NAMES = {
    EMPCAT_T: "Teachers",
    EMPCAT_TS: "Teacher Support",
    EMPCAT_TA: "Teaching Asst",
    EMPCAT_TAID: "Teaching Asst ID",
    EMPCAT_PMS: "Principals/Mgmt",
    EMPCAT_ADM: "Admin",
    EMPCAT_OAS: "Office Admin",
    EMPCAT_AS: "Admin Support",
    EMPCAT_AO: "Admin Other",
    EMPCAT_CS: "Counselors",
    EMPCAT_INT: "Instr Specialists",
    EMPCAT_IS: "Instr Support",
    EMPCAT_RS: "Reading Specialists",
    EMPCAT_DCP: "Directors/Coords",
    EMPCAT_SS: "Social Services",
    EMPCAT_HS: "Health/Nurses",
    EMPCAT_KS: "Food Service",
    EMPCAT_OE: "Operations/Maint",
    EMPCAT_MLS: "Media/Library",
    EMPCAT_OC: "Other Support",
};

const BenchmarkForm = ({ category = "Admissions" }) => {
  const { user } = useContext(AuthContext) || {};
  const schoolId = Number(user?.schoolId) || "N/A";

  /* Separate empty forms for each category */
  const EMPTY_ADMISSIONS_FORM = {
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
  };

  const EMPTY_EMPLOYEE_FORM = {
    SCHOOL_ID: Number(user?.schoolId) || "",
    SCHOOL_YR_ID: "",
    EMP_CAT_CD: "",
    TOTAL_EMPLOYEES: "",
    FT_EMPLOYEES: "",
    SUBCONTRACT_FTE: "",
    FTE_ONLY_SALARY_MIN: "",
    FTE_ONLY_SALARY_MAX: "",
    POC_EMPLOYEES: "",
  };

  const EMPTY_FORM = category === "Employee" ? EMPTY_EMPLOYEE_FORM : EMPTY_ADMISSIONS_FORM;
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* Validate based on category */
  const validate = (data = formData) => {
    let error = {};

    if (category === "Employee") {
      const requiredFields = ["SCHOOL_ID", "SCHOOL_YR_ID", "EMP_CAT_CD"];
      requiredFields.forEach((field) => {
        if (data[field] === "" || data[field] === null || data[field] === undefined) {
          error[field] = "Required field.";
        }
      });

      const numericFields = [
        "SCHOOL_ID",
        "SCHOOL_YR_ID",
        "TOTAL_EMPLOYEES",
        "FT_EMPLOYEES",
        "SUBCONTRACT_FTE",
        "FTE_ONLY_SALARY_MIN",
        "FTE_ONLY_SALARY_MAX",
        "POC_EMPLOYEES",
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
    } else {
      /* Admissions validation */
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
    }

    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const buildAdmissionsPayload = (data) => ({
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

  const buildEmployeePayload = (data) => ({
    SCHOOL_ID: Number(data.SCHOOL_ID),
    SCHOOL_YR_ID: Number(data.SCHOOL_YR_ID),
    EMP_CAT_CD: String(data.EMP_CAT_CD),
    TOTAL_EMPLOYEES: toNumberOrNull(data.TOTAL_EMPLOYEES),
    FT_EMPLOYEES: toNumberOrNull(data.FT_EMPLOYEES),
    SUBCONTRACT_FTE: toNumberOrNull(data.SUBCONTRACT_FTE),
    FTE_ONLY_SALARY_MIN: toNumberOrNull(data.FTE_ONLY_SALARY_MIN),
    FTE_ONLY_SALARY_MAX: toNumberOrNull(data.FTE_ONLY_SALARY_MAX),
    POC_EMPLOYEES: toNumberOrNull(data.POC_EMPLOYEES),
  });

  const validateAndShowErrors = (next) => {
    return validate(next);
  };

  /* Submit form */
  const submit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        setIsSubmitting(true);
        const endpoint = category === "Employee" ? "/api/benchmark-employee" : "/api/benchmark";
        const payload = category === "Employee" ? buildEmployeePayload(formData) : buildAdmissionsPayload(formData);
        await axios.post(endpoint, payload, { withCredentials: true });
        alert(`${category} benchmark saved and submitted.`);
        setFormData({
          ...EMPTY_FORM,
          SCHOOL_ID: Number(user?.schoolId) || ""
        });
        setErrors({});
      } catch (err) {
        const message = err?.response?.data?.error || err?.response?.data?.message || "Error saving form.";
        alert(message);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <BenchmarkVoiceFillButton
        formData={formData}
        setFormData={(next) => {
          setFormData(next);
          validateAndShowErrors(next);
        }}
        validateAndShowErrors={validateAndShowErrors}
        category={category}
      />

      <div className="mt-4 bg-white border p-8 rounded shadow">
        <form onSubmit={submit} className="space-y-6">
          {category === "Admissions" ? (
            <>
              <div>
                <h3 className="font-semibold mb-2">Required IDs</h3>

                <a className="font-light italic">School ID</a>
              <input
                  type="number"
                  name="SCHOOL_ID"
                  value={formData.SCHOOL_ID}
                  placeholder="School ID"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.SCHOOL_ID && <p className="text-red-600 text-sm">{errors.SCHOOL_ID}</p>}

                <a className="font-light italic">School Year ID</a>
              <input
                  type="number"
                  name="SCHOOL_YR_ID"
                  value={formData.SCHOOL_YR_ID}
                  placeholder="School Year ID"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.SCHOOL_YR_ID && <p className="text-red-600 text-sm">{errors.SCHOOL_YR_ID}</p>}

                <a className="font-light italic">Grade Definition ID</a>
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

                <a className="font-light italic">Capacity Enrollment</a>
              <input
                  type="number"
                  name="CAPACITY_ENROLL"
                  value={formData.CAPACITY_ENROLL}
                  placeholder="Capacity Enrollment"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.CAPACITY_ENROLL && <p className="text-red-600 text-sm">{errors.CAPACITY_ENROLL}</p>}

                <a className="font-light italic">Contracted Enrollment (Boys)</a>
              <input
                  type="number"
                  name="CONTRACTED_ENROLL_BOYS"
                  value={formData.CONTRACTED_ENROLL_BOYS}
                  placeholder="Contracted Enrollment (Boys)"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.CONTRACTED_ENROLL_BOYS && <p className="text-red-600 text-sm">{errors.CONTRACTED_ENROLL_BOYS}</p>}

                <a className="font-light italic">Contracted Enrollment (Girls)</a>
              <input
                  type="number"
                  name="CONTRACTED_ENROLL_GIRLS"
                  value={formData.CONTRACTED_ENROLL_GIRLS}
                  placeholder="Contracted Enrollment (Girls)"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.CONTRACTED_ENROLL_GIRLS && <p className="text-red-600 text-sm">{errors.CONTRACTED_ENROLL_GIRLS}</p>}

                <a className="font-light italic">Contracted Enrollment (Non-Binary)</a>
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

                <a className="font-light italic">Completed Applications Total</a>
              <input
                  type="number"
                  name="COMPLETED_APPLICATION_TOTAL"
                  value={formData.COMPLETED_APPLICATION_TOTAL}
                  placeholder="Completed Applications Total"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.COMPLETED_APPLICATION_TOTAL && <p className="text-red-600 text-sm">{errors.COMPLETED_APPLICATION_TOTAL}</p>}

                <a className="font-light italic">Acceptances Total</a>
              <input
                  type="number"
                  name="ACCEPTANCES_TOTAL"
                  value={formData.ACCEPTANCES_TOTAL}
                  placeholder="Acceptances Total"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.ACCEPTANCES_TOTAL && <p className="text-red-600 text-sm">{errors.ACCEPTANCES_TOTAL}</p>}

                <a className="font-light italic">New Enrollments Total</a>
              <input
                  type="number"
                  name="NEW_ENROLLMENTS_TOTAL"
                  value={formData.NEW_ENROLLMENTS_TOTAL}
                  placeholder="New Enrollments Total"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.NEW_ENROLLMENTS_TOTAL && (
                  <p className="text-red-600 text-sm">{errors.NEW_ENROLLMENTS_TOTAL}</p>
                )}
              </div>
            </>
          ) : (
            <>
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

                <select
                  name="EMP_CAT_CD"
                  value={formData.EMP_CAT_CD}
                  onChange={change}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Employee Category</option>
                  {Object.entries(EMPLOYEE_CATEGORY_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{name} ({code})</option>
                  ))}
                </select>
                {errors.EMP_CAT_CD && <p className="text-red-600 text-sm">{errors.EMP_CAT_CD}</p>}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Employee Data</h3>

                <input
                  type="number"
                  name="TOTAL_EMPLOYEES"
                  value={formData.TOTAL_EMPLOYEES}
                  placeholder="Total Employees"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.TOTAL_EMPLOYEES && <p className="text-red-600 text-sm">{errors.TOTAL_EMPLOYEES}</p>}

                <input
                  type="number"
                  name="FT_EMPLOYEES"
                  value={formData.FT_EMPLOYEES}
                  placeholder="Full-Time Employees"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.FT_EMPLOYEES && <p className="text-red-600 text-sm">{errors.FT_EMPLOYEES}</p>}

                <input
                  type="number"
                  name="SUBCONTRACT_FTE"
                  value={formData.SUBCONTRACT_FTE}
                  placeholder="Subcontract FTE"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.SUBCONTRACT_FTE && <p className="text-red-600 text-sm">{errors.SUBCONTRACT_FTE}</p>}

                <input
                  type="number"
                  name="POC_EMPLOYEES"
                  value={formData.POC_EMPLOYEES}
                  placeholder="People of Color Employees"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.POC_EMPLOYEES && <p className="text-red-600 text-sm">{errors.POC_EMPLOYEES}</p>}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Salary Range (Optional)</h3>

                <input
                  type="number"
                  name="FTE_ONLY_SALARY_MIN"
                  value={formData.FTE_ONLY_SALARY_MIN}
                  placeholder="Minimum Salary"
                  onChange={change}
                  className="w-full border p-2 rounded mb-2"
                />
                {errors.FTE_ONLY_SALARY_MIN && <p className="text-red-600 text-sm">{errors.FTE_ONLY_SALARY_MIN}</p>}

                <input
                  type="number"
                  name="FTE_ONLY_SALARY_MAX"
                  value={formData.FTE_ONLY_SALARY_MAX}
                  placeholder="Maximum Salary"
                  onChange={change}
                  className="w-full border p-2 rounded"
                />
                {errors.FTE_ONLY_SALARY_MAX && <p className="text-red-600 text-sm">{errors.FTE_ONLY_SALARY_MAX}</p>}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700"
          >
            Save and Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default BenchmarkForm;