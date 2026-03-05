import React, { useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import BenchmarkVoiceFillButton from "./BenchmarkVoiceFillButton.jsx";

const API = "http://localhost:5000";

export default function BenchmarkForm() {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext) || {};
  const schoolId = Number(user?.schoolId) || "N/A";

  const defaultFormData = {
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

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState("form");
  const [searchResults, setSearchResults] = useState([]);
  const [editingYear, setEditingYear] = useState(null);
  const [searchYearId, setSearchYearId] = useState("");

  const validate = (data = formData) => {
    const error = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === "" || value === null) error[key] = "Required field.";
      if (!isNaN(value) && Number(value) < 0) error[key] = "Cannot be negative.";
    });

    const capacity = Number(data.CAPACITY_ENROLL);
    const boys = Number(data.CONTRACTED_ENROLL_BOYS);
    const girls = Number(data.CONTRACTED_ENROLL_GIRLS);
    const nb = Number(data.CONTRACTED_ENROLL_NB);
    const apps = Number(data.COMPLETED_APPLICATION_TOTAL);
    const accepted = Number(data.ACCEPTANCES_TOTAL);
    const enrolled = Number(data.NEW_ENROLLMENTS_TOTAL);
    const contractedTotal = boys + girls + nb;

    if (accepted > apps) {
      error.ACCEPTANCES_TOTAL = "Cannot exceed completed applications.";
    }
    if (enrolled > accepted) {
      error.NEW_ENROLLMENTS_TOTAL = "Cannot exceed acceptances.";
    }
    if (enrolled > capacity) {
      error.NEW_ENROLLMENTS_TOTAL = "New enrollments cannot exceed capacity.";
    }
    if (contractedTotal > capacity * 1.5) {
      error.CONTRACTED_ENROLL_BOYS = `Combined contracted enrollment (${contractedTotal}) seems too high vs capacity (${capacity}).`;
    }
    if (capacity === 0) {
      error.CAPACITY_ENROLL = "Capacity must be greater than 0.";
    }
    if (apps > capacity * 10) {
      error.COMPLETED_APPLICATION_TOTAL = `Completed applications (${apps}) seem unusually high vs capacity (${capacity}). Please verify.`;
    }

    const grade = Number(data.GRADE_DEF_ID);
    if (isNaN(grade) || !Number.isInteger(grade) || grade <= 0) {
      error.GRADE_DEF_ID = "Grade Definition ID must be a positive whole number.";
    }

    const yearId = Number(data.SCHOOL_YR_ID);
    if (!Number.isInteger(yearId) || yearId <= 0) {
      error.SCHOOL_YR_ID = "School Year ID must be a positive whole number.";
    }

    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setErrors({});
    setEditingYear(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...formData, SCHOOL_ID: schoolId };
    try {
      if (editingYear) {
        await axios.put(`${API}/api/benchmark/year/${editingYear}`, payload, { withCredentials: true });
        alert("Record updated successfully!");
      } else {
        await axios.post(`${API}/api/benchmark`, payload, { withCredentials: true });
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
    setEditingYear(record.SCHOOL_YR_ID);
    setTab("form");
  };

  const deleteRecord = async (yearId) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API}/api/benchmark/year/${yearId}`, { withCredentials: true });
      fetchAll(50);
    } catch {
      alert("Error deleting record.");
    }
  };

  const fetchAll = async (limit = 50) => {
    try {
      const res = await axios.get(`${API}/api/benchmark?limit=${limit}`, { withCredentials: true });
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
      const res = await axios.get(`${API}/api/benchmark/year/${searchYearId}`, { withCredentials: true });
      setSearchResults([res.data]);
    } catch {
      setSearchResults([]);
      alert("No record found.");
    }
  };

  const acceptanceRate = useMemo(() => {
    return formData.COMPLETED_APPLICATION_TOTAL && formData.ACCEPTANCES_TOTAL
      ? ((Number(formData.ACCEPTANCES_TOTAL) / Number(formData.COMPLETED_APPLICATION_TOTAL)) * 100).toFixed(1)
      : "-";
  }, [formData.ACCEPTANCES_TOTAL, formData.COMPLETED_APPLICATION_TOTAL]);

  const yieldRate = useMemo(() => {
    return formData.ACCEPTANCES_TOTAL && formData.NEW_ENROLLMENTS_TOTAL
      ? ((Number(formData.NEW_ENROLLMENTS_TOTAL) / Number(formData.ACCEPTANCES_TOTAL)) * 100).toFixed(1)
      : "-";
  }, [formData.NEW_ENROLLMENTS_TOTAL, formData.ACCEPTANCES_TOTAL]);

  const capacityFill = useMemo(() => {
    return formData.CAPACITY_ENROLL && formData.NEW_ENROLLMENTS_TOTAL
      ? ((Number(formData.NEW_ENROLLMENTS_TOTAL) / Number(formData.CAPACITY_ENROLL)) * 100).toFixed(1)
      : "-";
  }, [formData.NEW_ENROLLMENTS_TOTAL, formData.CAPACITY_ENROLL]);

  useEffect(() => {
    if (tab === "search") fetchAll(50);
  }, [tab]);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">

      {/* kpi */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-3 gap-6 text-center">
        <StatCard title="Acceptance Rate" value={`${acceptanceRate}%`} />
        <StatCard title="Yield Rate" value={`${yieldRate}%`} />
        <StatCard title="Capacity Fill" value={`${capacityFill}%`} />
      </div>

      {/* tabs */}
      <div className="max-w-6xl mx-auto mt-10 flex gap-4 justify-center">
        <TabButton active={tab === "form"} onClick={() => { resetForm(); setTab("form"); }}>+ Create Benchmark</TabButton>
        <TabButton active={tab === "search"} onClick={() => { fetchAll(50); setTab("search"); }}>Search / Edit / Delete Benchmark</TabButton>
      </div>

      <BenchmarkVoiceFillButton formData={formData} setFormData={(next) => { setFormData(next); validate(next); }} validateAndShowErrors={validate} />

      {/* the form */}
      {tab === "form" && (
        <div className="max-w-6xl mx-auto mt-10 bg-white p-12 shadow-md border border-gray-200 rounded-2xl">
          <form onSubmit={submit} className="space-y-10">
            <Section title="Benchmark Details">
              <Input name="SCHOOL_YR_ID" label="School Year ID" value={formData.SCHOOL_YR_ID} onChange={(e) => setFormData({ ...formData, SCHOOL_YR_ID: e.target.value })} error={errors.SCHOOL_YR_ID} />
              <Input name="GRADE_DEF_ID" label="Grade Definition ID" value={formData.GRADE_DEF_ID} onChange={(e) => setFormData({ ...formData, GRADE_DEF_ID: e.target.value })} error={errors.GRADE_DEF_ID} />
              <Input name="CAPACITY_ENROLL" label="Capacity Enrollment" value={formData.CAPACITY_ENROLL} onChange={(e) => setFormData({ ...formData, CAPACITY_ENROLL: e.target.value })} error={errors.CAPACITY_ENROLL} />
            </Section>

            <Section title="Contracted Enrollment">
              <Input name="CONTRACTED_ENROLL_BOYS" label="Boys" value={formData.CONTRACTED_ENROLL_BOYS} onChange={(e) => setFormData({ ...formData, CONTRACTED_ENROLL_BOYS: e.target.value })} error={errors.CONTRACTED_ENROLL_BOYS} />
              <Input name="CONTRACTED_ENROLL_GIRLS" label="Girls" value={formData.CONTRACTED_ENROLL_GIRLS} onChange={(e) => setFormData({ ...formData, CONTRACTED_ENROLL_GIRLS: e.target.value })} error={errors.CONTRACTED_ENROLL_GIRLS} />
              <Input name="CONTRACTED_ENROLL_NB" label="Non-Binary" value={formData.CONTRACTED_ENROLL_NB} onChange={(e) => setFormData({ ...formData, CONTRACTED_ENROLL_NB: e.target.value })} error={errors.CONTRACTED_ENROLL_NB} />
            </Section>

            <Section title="Application Outcomes">
              <Input name="COMPLETED_APPLICATION_TOTAL" label="Completed Applications" value={formData.COMPLETED_APPLICATION_TOTAL} onChange={(e) => setFormData({ ...formData, COMPLETED_APPLICATION_TOTAL: e.target.value })} error={errors.COMPLETED_APPLICATION_TOTAL} />
              <Input name="ACCEPTANCES_TOTAL" label="Acceptances" value={formData.ACCEPTANCES_TOTAL} onChange={(e) => setFormData({ ...formData, ACCEPTANCES_TOTAL: e.target.value })} error={errors.ACCEPTANCES_TOTAL} />
              <Input name="NEW_ENROLLMENTS_TOTAL" label="New Enrollments" value={formData.NEW_ENROLLMENTS_TOTAL} onChange={(e) => setFormData({ ...formData, NEW_ENROLLMENTS_TOTAL: e.target.value })} error={errors.NEW_ENROLLMENTS_TOTAL} />
            </Section>

            <ArrowButton type="submit" fullWidth>
              {editingYear ? "Update Benchmark Record" : "Save Benchmark Record"}
            </ArrowButton>

            <button
              type="button"
              onClick={resetForm}
              className="w-full py-3 text-lg font-semibold rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all duration-300"
            >
              Reset Form
            </button>

          </form>
        </div>
      )}

      {/* searching */}
      {tab === "search" && (
        <div className="max-w-6xl mx-auto mt-10">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by School Year ID"
              value={searchYearId}
              onChange={(e) => setSearchYearId(e.target.value)}
              className="border p-3 rounded flex-1 focus:ring-2 focus:ring-[#0F2D52] outline-none"
            />
            <ArrowButton onClick={searchByYearId} bg="#0F2D52" hoverBg="#1a4a7a" textColor="white">Search</ArrowButton>
            <ArrowButton onClick={() => fetchAll(50)} bg="#6B7280" hoverBg="#4B5563" textColor="white">Reset</ArrowButton>
          </div>

          <table className="w-full border rounded-lg overflow-hidden shadow">
            <thead className="bg-[#0F2D52] text-white">
              <tr>
                <th className="p-3">School Year ID</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Completed Apps</th>
                <th className="p-3">Accepted</th>
                <th className="p-3">Enrolled</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length ? searchResults.map((rec, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-100 text-center" : "bg-white text-center"}>
                  <td className="p-3">{rec.SCHOOL_YR_ID}</td>
                  <td className="p-3">{rec.GRADE_DEF_ID}</td>
                  <td className="p-3">{rec.CAPACITY_ENROLL}</td>
                  <td className="p-3">{rec.COMPLETED_APPLICATION_TOTAL}</td>
                  <td className="p-3">{rec.ACCEPTANCES_TOTAL}</td>
                  <td className="p-3">{rec.NEW_ENROLLMENTS_TOTAL}</td>
                  <td className="py-2 flex justify-center gap-6 min-w-40">
                    <ArrowButton onClick={() => loadForEdit(rec)} small>Edit</ArrowButton>
                    <ArrowButton onClick={() => deleteRecord(rec.SCHOOL_YR_ID)} small bg="#D94141" hoverBg="#B23030" textColor="white">Delete</ArrowButton>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#0F2D52] mb-6 border-b pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{children}</div>
    </div>
  );
}

function Input({ name, label, value, onChange, error }) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-lg">{label} <span className="text-red-600">*</span></label>
      <input type="number" name={name} value={value} onChange={onChange} className="w-full border px-4 py-4 text-lg rounded focus:ring-2 focus:ring-[#0F2D52] outline-none" />
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 shadow rounded">
      <p className="text-gray-500 font-semibold">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-10 py-3 rounded-full font-semibold text-lg ${active ? "bg-[#0F2D52] text-white" : "bg-gray-200 text-gray-700"} transform transition-all duration-200 hover:scale-105 shadow-md`}
    >
      {children}
    </button>
  );
}

/* arrows */
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