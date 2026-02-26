import React, { useState } from "react";
import axios from "axios";

const BenchmarkForm = () => {

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

/* validations */
  const validate = () => {
    let error = {};
    
    if (!formData.year) {error.year = "Year is required.";}
    
    if (formData.aveTestScore && (formData.aveTestScore < 0 || formData.aveTestScore > 100)) {
  error.aveTestScore = "Test score must be between 0 and 100."; }
  
    if (formData.teacherStudentRatio && formData.teacherStudentRatio <= 0) {
  error.teacherStudentRatio = "Ratio must be greater than 0.";}
/* Field checks */
    if (!formData.applicants) {
      error.applicants = "Total applicants required.";
    }

    if (!formData.enrolled) {
      error.enrolled = "Total enrolled required.";
    }

    if (
      Number(formData.enrolled) >
      Number(formData.applicants)
    ) {
      error.enrolled =
        "Total enrolled cannot exceed total applicants.";
    }

/* Check GPA input */
    if (
      formData.avgGPA &&
      (formData.avgGPA < 0 || formData.avgGPA > 4)
    ) {
      error.avgGPA = "GPA must be between 0 and 4.";
    }

/* Check percentage inputs */
    if (
      formData.percentAthlete &&
      (formData.percentAthlete < 0 ||
        formData.percentAthlete > 100)
    ) {
      error.percentAthlete =
        "Must be between 0 and 100.";
    }

    if (
      formData.internationalPerc &&
      (formData.internationalPerc < 0 ||
        formData.internationalPerc > 100)
    ) {
      error.internationalPerc =
        "Must be between 0 and 100.";
    }

    setErrors(error);

    return Object.keys(error).length === 0;
  };

/* submit form */
  const submit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        setIsSubmitting(true); 
        await axios.post(
          "http://localhost:5000/api/benchmark",
          formData
        );

        alert("Form is saved and submitted.");
      } catch (err) {
        alert("Error saving form.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white border p-8 rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">
        {formData.year} Benchmark Form
      </h2>

      <form onSubmit={submit} className="space-y-6">
    <div>
        <h3 className="font-semibold mb-2">Year</h3>
        <input
        type="number"
        name="year"
        placeholder="Year"
        onChange={change}
        className="w-full border p-2 rounded mb-2"/>
        {errors.year && (
            <p className="text-red-600 text-sm">{errors.year}</p>
            )}
    </div>

{/* Admissions */}
        <div>
          <h3 className="font-semibold mb-2">Admissions</h3>

          <input
            type="number"
            name="applicants"
            placeholder="Total Applicants"
            onChange={change}
            className="w-full border p-2 rounded mb-2"
          />
          {errors.applicants && (
            <p className="text-red-600 text-sm">
              {errors.applicants}
            </p>
          )}

          <input
            type="number"
            name="enrolled"
            placeholder="Total Enrolled"
            onChange={change}
            className="w-full border p-2 rounded"
          />
          {errors.enrolled && (
            <p className="text-red-600 text-sm">
              {errors.enrolled}
            </p>
          )}
        </div>

{/* Demographics */}
        <div>
          <h3 className="font-semibold mb-2">Demographics</h3>

          <input
            type="number"
            name="internationalPerc"
            placeholder="% International Students"
            onChange={change}
            className="w-full border p-2 rounded"
          />
          {errors.internationalPerc && (
            <p className="text-red-600 text-sm">
              {errors.internationalPerc}
            </p>
          )}
        </div>

{/* Academics */}
        <div>
          <h3 className="font-semibold mb-2">Academics</h3>

          <input
            type="number"
            step="0.01"
            name="avgGPA"
            placeholder="Average GPA (0-4)"
            onChange={change}
            className="w-full border p-2 rounded"
          />
          {errors.avgGPA && (
            <p className="text-red-600 text-sm">
              {errors.avgGPA}
            </p>
          )}
          <input
          type="number"
          step="0.01"
          name="aveTestScore"
          placeholder="Average Test Score"
          onChange={change}
          className="w-full border p-2 rounded mt-2"/>
          {errors.aveTestScore && (
            <p className="text-red-600 text-sm">{errors.aveTestScore}</p>
        )}
          <input
          type="number"
          step="0.01"
          name="teacherStudentRatio"
          placeholder="Student-Teacher Ratio"
          onChange={change}
          className="w-full border p-2 rounded"
          />
          {errors.teacherStudentRatio && (
            <p className="text-red-600 text-sm">
            {errors.teacherStudentRatio}
         </p>
)}
        </div>

{/* Athletics */}
        <div>
          <h3 className="font-semibold mb-2">Athletics</h3>

          <input
            type="number"
            name="percentAthlete"
            placeholder="% Students in Athletics"
            onChange={change}
            className="w-full border p-2 rounded"
          />
          {errors.percentAthlete && (
            <p className="text-red-600 text-sm">
              {errors.percentAthlete}
            </p>
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
  );
};

export default BenchmarkForm;