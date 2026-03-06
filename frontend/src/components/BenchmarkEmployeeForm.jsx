import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API = "http://localhost:5000";

const EMPLOYEE_CATEGORY_CODES = {
  "EMPCAT_T": "Teachers",
  "EMPCAT_TS": "Teacher Support",
  "EMPCAT_TA": "Teaching Asst",
  "EMPCAT_TAID": "Teaching Asst ID",
  "EMPCAT_PMS": "Principals/Mgmt",
  "EMPCAT_ADM": "Admin",
  "EMPCAT_OAS": "Office Admin",
  "EMPCAT_AS": "Admin Support",
  "EMPCAT_AO": "Admin Other",
  "EMPCAT_CS": "Counselors",
  "EMPCAT_INT": "Instr Specialists",
  "EMPCAT_IS": "Instr Support",
  "EMPCAT_RS": "Reading Specialists",
  "EMPCAT_DCP": "Directors/Coords",
  "EMPCAT_SS": "Social Services",
  "EMPCAT_HS": "Health/Nurses",
  "EMPCAT_KS": "Food Service",
  "EMPCAT_OE": "Operations/Maint",
  "EMPCAT_MLS": "Media/Library",
  "EMPCAT_OC": "Other Support",
};

export default function BenchmarkEmployeeForm() {
  const { user } = useContext(AuthContext) || {};
  const schoolId = Number(user?.schoolId) || "N/A";

  const defaultFormData = {
    SCHOOL_YR_ID: "",
    EMP_CAT_CD: "",
    TOTAL_EMPLOYEES: "",
    FT_EMPLOYEES: "",
    SUBCONTRACT_FTE: "",
    FTE_ONLY_SALARY_MIN: "",
    FTE_ONLY_SALARY_MAX: "",
    POC_EMPLOYEES: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState("form");
  const [searchResults, setSearchResults] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchYearId, setSearchYearId] = useState("");

  const validate = (data = formData) => {
    const error = {};

    if (!data.SCHOOL_YR_ID || data.SCHOOL_YR_ID === "") {
      error.SCHOOL_YR_ID = "Required field.";
    } else if (isNaN(Number(data.SCHOOL_YR_ID)) || Number(data.SCHOOL_YR_ID) <= 0) {
      error.SCHOOL_YR_ID = "Must be a positive number.";
    }

    if (!data.EMP_CAT_CD || data.EMP_CAT_CD === "") {
      error.EMP_CAT_CD = "Required field.";
    }

    // Validate numeric fields
    const numericFields = ["TOTAL_EMPLOYEES", "FT_EMPLOYEES", "SUBCONTRACT_FTE", "FTE_ONLY_SALARY_MIN", "FTE_ONLY_SALARY_MAX", "POC_EMPLOYEES"];
    numericFields.forEach((field) => {
      if (data[field] !== "" && data[field] !== null) {
        const val = Number(data[field]);
        if (isNaN(val) || val < 0) {
          error[field] = "Must be a non-negative number.";
        }
      }
    });

    // Salary validation
    const minSalary = Number(data.FTE_ONLY_SALARY_MIN) || 0;
    const maxSalary = Number(data.FTE_ONLY_SALARY_MAX) || 0;
    if (minSalary > 0 && maxSalary > 0 && minSalary > maxSalary) {
      error.FTE_ONLY_SALARY_MAX = "Max salary cannot be less than min salary.";
    }

    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setErrors({});
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...formData, SCHOOL_ID: schoolId };
    try {
      if (editingId) {
        await axios.put(`${API}/api/employee/personnel/${editingId}`, payload, { withCredentials: true });
        alert("Record updated successfully!");
      } else {
        await axios.post(`${API}/api/employee/personnel`, payload, { withCredentials: true });
        alert("New record created successfully!");
      }
      resetForm();
      setTab("search");
      fetchAll(50);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Error saving record.");
    }
  };

  const loadForEdit = (record) => {
    setFormData(record);
    setEditingId(record._id || record.ID);
    setTab("form");
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API}/api/employee/personnel/${id}`, { withCredentials: true });
      fetchAll(50);
    } catch {
      alert("Error deleting record.");
    }
  };

  const fetchAll = async (limit = 50) => {
    try {
      const res = await axios.get(`${API}/api/employee/personnel?limit=${limit}`, { withCredentials: true });
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSearchResults([]);
    }
  };

  const searchByYearId = async () => {
    if (!searchYearId) {
      alert("Enter a School Year ID to search.");
      return;
    }
    try {
      const res = await axios.get(`${API}/api/employee/personnel/${searchYearId}`, { withCredentials: true });
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSearchResults([]);
      alert("No records found.");
    }
  };

  useEffect(() => {
    if (tab === "search") fetchAll(50);
  }, [tab]);

  return (
    <div className="bg-[#F4F6F9]">
      {/* tabs */}
      <div className="w-full mt-8 flex gap-4 justify-center">
        <TabButton active={tab === "form"} onClick={() => { resetForm(); setTab("form"); }}>+ Create Benchmark</TabButton>
        <TabButton active={tab === "search"} onClick={() => { fetchAll(50); setTab("search"); }}>Search / Edit / Delete Benchmark</TabButton>
      </div>

      {/* form */}
      {tab === "form" && (
        <div className="w-full mt-8">
          <div className="bg-white p-10 shadow-md border border-gray-200 rounded-2xl">
            <form onSubmit={submit} className="space-y-10">
              <Section title="Employee Benchmark Details" note="Basic benchmark information for the selected employee category">
                <Input 
                  name="SCHOOL_YR_ID" 
                  label="School Year ID" 
                  hint="Example: 7" 
                  value={formData.SCHOOL_YR_ID} 
                  onChange={(e) => setFormData({ ...formData, SCHOOL_YR_ID: e.target.value })} 
                  error={errors.SCHOOL_YR_ID} 
                />
                <SelectInput 
                  name="EMP_CAT_CD" 
                  label="Employee Category" 
                  value={formData.EMP_CAT_CD} 
                  onChange={(e) => setFormData({ ...formData, EMP_CAT_CD: e.target.value })} 
                  error={errors.EMP_CAT_CD}
                  options={EMPLOYEE_CATEGORY_CODES}
                />
              </Section>

              <Section title="Employee Counts" note="Total headcount and full-time equivalent employees">
                <Input 
                  name="TOTAL_EMPLOYEES" 
                  label="Total Employees" 
                  hint="Example: 45" 
                  value={formData.TOTAL_EMPLOYEES} 
                  onChange={(e) => setFormData({ ...formData, TOTAL_EMPLOYEES: e.target.value })} 
                  error={errors.TOTAL_EMPLOYEES} 
                />
                <Input 
                  name="FT_EMPLOYEES" 
                  label="Full-Time Employees" 
                  hint="Example: 40" 
                  value={formData.FT_EMPLOYEES} 
                  onChange={(e) => setFormData({ ...formData, FT_EMPLOYEES: e.target.value })} 
                  error={errors.FT_EMPLOYEES} 
                />
                <Input 
                  name="POC_EMPLOYEES" 
                  label="Part-Time/Contractors" 
                  hint="Example: 5" 
                  value={formData.POC_EMPLOYEES} 
                  onChange={(e) => setFormData({ ...formData, POC_EMPLOYEES: e.target.value })} 
                  error={errors.POC_EMPLOYEES} 
                />
              </Section>

              <Section title="Subcontracting & Salary" note="Subcontracting FTE and salary range for full-time equivalent positions">
                <Input 
                  name="SUBCONTRACT_FTE" 
                  label="Subcontract FTE" 
                  hint="Example: 2.5" 
                  value={formData.SUBCONTRACT_FTE} 
                  onChange={(e) => setFormData({ ...formData, SUBCONTRACT_FTE: e.target.value })} 
                  error={errors.SUBCONTRACT_FTE} 
                />
                <Input 
                  name="FTE_ONLY_SALARY_MIN" 
                  label="Min Salary (FTE)" 
                  hint="Example: 32000" 
                  value={formData.FTE_ONLY_SALARY_MIN} 
                  onChange={(e) => setFormData({ ...formData, FTE_ONLY_SALARY_MIN: e.target.value })} 
                  error={errors.FTE_ONLY_SALARY_MIN} 
                />
                <Input 
                  name="FTE_ONLY_SALARY_MAX" 
                  label="Max Salary (FTE)" 
                  hint="Example: 85000" 
                  value={formData.FTE_ONLY_SALARY_MAX} 
                  onChange={(e) => setFormData({ ...formData, FTE_ONLY_SALARY_MAX: e.target.value })} 
                  error={errors.FTE_ONLY_SALARY_MAX} 
                />
              </Section>

              <ArrowButton type="submit" fullWidth>
                {editingId ? "Update Benchmark Record" : "Save Benchmark Record"}
              </ArrowButton>

              <button
                type="button"
                onClick={resetForm}
                className="w-full py-3 text-lg font-semibold rounded-lg text-white bg-[#4B5563] hover:bg-[#374151] transition-all duration-300"
              >
                Reset Form
              </button>
            </form>
          </div>
        </div>
      )}

      {/* search */}
      {tab === "search" && (
        <div className="w-full mt-8">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by School Year ID"
              value={searchYearId}
              onChange={(e) => setSearchYearId(e.target.value)}
              className="border p-3 rounded flex-1 focus:ring-2 focus:ring-[#0F2D52] outline-none"
            />
            <ArrowButton onClick={searchByYearId} bg="#0F2D52" hoverBg="#1a4a7a" textColor="white">Search</ArrowButton>
            <ArrowButton onClick={() => fetchAll(50)} bg="#4B5563" hoverBg="#374151" textColor="white">Reset</ArrowButton>
          </div>

          <table className="w-full border rounded-lg overflow-hidden shadow">
            <thead className="bg-[#0F2D52] text-white">
              <tr>
                <th className="p-3">School Year ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Total Employees</th>
                <th className="p-3">FT Employees</th>
                <th className="p-3">Min Salary</th>
                <th className="p-3">Max Salary</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length > 0 ? (
                searchResults.map((record, i) => (
                  <tr key={record._id || record.ID} className={i % 2 === 0 ? "bg-gray-100 text-center" : "bg-white text-center"}>
                    <td className="p-3">{record.SCHOOL_YR_ID}</td>
                    <td className="p-3">{EMPLOYEE_CATEGORY_CODES[record.EMP_CAT_CD] || record.EMP_CAT_CD}</td>
                    <td className="p-3">{record.TOTAL_EMPLOYEES ?? "-"}</td>
                    <td className="p-3">{record.FT_EMPLOYEES ?? "-"}</td>
                    <td className="p-3">${record.FTE_ONLY_SALARY_MIN ?? "-"}</td>
                    <td className="p-3">${record.FTE_ONLY_SALARY_MAX ?? "-"}</td>
                    <td className="py-2 flex justify-center gap-6 min-w-[160px]">
                      <ArrowButton onClick={() => loadForEdit(record)} small>Edit</ArrowButton>
                      <ArrowButton onClick={() => deleteRecord(record._id || record.ID)} small bg="#D94141" hoverBg="#B23030" textColor="white">Delete</ArrowButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Section({ title, note, children }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#0F2D52] mb-6 border-b pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{children}</div>
      {note && <p className="text-gray-500 text-sm mt-4 italic">Note: {note}</p>}
    </div>
  );
}

function Input({ name, label, hint, value, onChange, error }) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-lg">{label} <span className="text-red-600">*</span></label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border px-4 py-4 text-lg rounded focus:ring-2 focus:ring-[#0F2D52] outline-none"
      />
      {hint && <p className="text-gray-400 text-sm mt-1">{hint}</p>}
      {error && <p className="text-red-600 mt-1 text-sm">{error}</p>}
    </div>
  );
}

function SelectInput({ name, label, value, onChange, error, options }) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-lg">{label} <span className="text-red-600">*</span></label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border px-4 py-4 text-lg rounded focus:ring-2 focus:ring-[#0F2D52] outline-none"
      >
        <option value="">-- Select Category --</option>
        {Object.entries(options).map(([code, label]) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
      {error && <p className="text-red-600 mt-1 text-sm">{error}</p>}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-10 py-3 rounded-full font-semibold text-lg ${active ? "bg-[#0F2D52] text-white" : "bg-gray-200 text-gray-700"} transform transition-all duration-200 hover:scale-105 shadow-md`}
    >
      {children}
    </button>
  );
}

function ArrowButton({ children, onClick, bg = "#FFA500", hoverBg = "#f39200", textColor = "#000", small, fullWidth, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        ${fullWidth ? "w-full" : ""}
        ${small ? "px-4 py-2 text-sm" : "px-6 py-3 text-lg"}
        font-semibold rounded-lg relative flex items-center justify-center
        transition-colors duration-300 group overflow-hidden
      `}
      style={{
        backgroundColor: bg,
        color: textColor,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bg)}
    >
      <span className="transition-all duration-300 group-hover:-translate-x-2">{children}</span>
      <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        →
      </span>
    </button>
  );
}
