import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BenchmarkForm = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("form");

  const defaultFormData = {
    year: "",
    totalApplicants: "",
    totalOffered: "",
    totalEnrolled: "",
    students: "",
    teachers: "",
    avgGPA: "",
    aveTestScore: "",
    percentInState: "",
    percentOutofState: "",
    internationalPerc: "",
    percentAthlete: "",
    boys: "",
    girls: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [editingYear, setEditingYear] = useState(null);
  const [searchYear, setSearchYear] = useState("");

  useEffect(() => {
    if (tab === "search") fetchAll();
  }, [tab]);

  const change = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    let error = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] === "") error[key] = "Required";
    });

    if (formData.year && !/^\d{4}$/.test(formData.year)) error.year = "Enter a valid 4-digit year";
    if (formData.avgGPA && (formData.avgGPA < 0 || formData.avgGPA > 4)) error.avgGPA = "GPA must be between 0–4";

    const totalPercent =
      Number(formData.percentInState || 0) +
      Number(formData.percentOutofState || 0) +
      Number(formData.internationalPerc || 0);
    if (
      formData.percentInState !== "" &&
      formData.percentOutofState !== "" &&
      formData.internationalPerc !== "" &&
      totalPercent !== 100
    ) {
      error.percentInState = "In-State + Out-of-State + International must sum to 100";
    }

    if (
      formData.totalApplicants !== "" &&
      formData.totalOffered !== "" &&
      Number(formData.totalOffered) > Number(formData.totalApplicants)
    ) {
      error.totalOffered = "Cannot exceed Total Applicants";
    }

    if (
      formData.totalOffered !== "" &&
      formData.totalEnrolled !== "" &&
      Number(formData.totalEnrolled) > Number(formData.totalOffered)
    ) {
      error.totalEnrolled = "Cannot exceed Total Offers";
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
    try {
      if (editingYear) {
        await axios.put(`http://localhost:5000/api/benchmark/year/${editingYear}`, formData);
        alert("Record updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/benchmark", formData);
        alert("New record created successfully!");
      }
      resetForm();
      fetchAll();
    } catch {
      alert("Error saving record.");
    }
  };

  const loadForEdit = (record) => {
    setFormData(record);
    setEditingYear(record.year);
    setTab("form");
  };

  const deleteRecord = async (year) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/benchmark/year/${year}`);
      fetchAll();
    } catch {
      alert("Error deleting record.");
    }
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/benchmark");
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSearchResults([]);
    }
  };

  const searchByYear = async () => {
    if (!/^\d{4}$/.test(searchYear)) { alert("Enter a valid 4-digit year"); return; }
    try {
      const res = await axios.get(`http://localhost:5000/api/benchmark/year/${searchYear}`);
      setSearchResults([res.data]);
    } catch {
      setSearchResults([]);
      alert("No record found.");
    }
  };

  const acceptanceRate =
    formData.totalApplicants && formData.totalOffered
      ? ((formData.totalOffered / formData.totalApplicants) * 100).toFixed(1)
      : "-";
  const yieldRate =
    formData.totalOffered && formData.totalEnrolled
      ? ((formData.totalEnrolled / formData.totalOffered) * 100).toFixed(1)
      : "-";
  const teacherRatio =
    formData.students && formData.teachers
      ? `${formData.students} : ${formData.teachers}`
      : "-";

  return (
    <div className="min-h-screen bg-[#F4F6F9]">

      {/* header */}
      <div className="bg-[#0F2D52] text-white px-12 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold">Institutional Benchmark Management</h1>
          <p className="text-gray-300 mt-1 text-lg">Admissions, Enrollment, and Academic Metrics Reporting</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-[#F4A300] hover:bg-[#d99100] px-6 py-3 text-black font-bold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-110 group flex items-center justify-center"
        >
          Return to Dashboard
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </button>
      </div>

      {/* stats */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-3 gap-6 text-center">
        <StatCard title="Acceptance Rate" value={`${acceptanceRate}%`} />
        <StatCard title="Yield Rate" value={`${yieldRate}%`} />
        <StatCard title="Student : Faculty Ratio" value={teacherRatio} />
      </div>

      {/* tabs */}
      <div className="max-w-6xl mx-auto mt-10 flex gap-4 justify-center">
        <TabButton active={tab === "form"} onClick={() => { resetForm(); setTab("form"); }}>+ Create Benchmark</TabButton>
        <TabButton active={tab === "search"} onClick={() => setTab("search")}>Search / Edit / Delete Benchmark</TabButton>
      </div>

      {/* form */}
      {tab === "form" && (
        <div className="max-w-6xl mx-auto mt-10 bg-white p-12 shadow-md border border-gray-200 rounded-2xl">
          <form onSubmit={submit} className="space-y-12">

            <Section title="Admissions Overview">
              <Input name="year" label="Year" value={formData.year} onChange={change} error={errors.year} example="2026"/>
              <Input name="totalApplicants" label="Total Applicants" value={formData.totalApplicants} onChange={change} error={errors.totalApplicants} example="5000"/>
              <Input name="totalOffered" label="Total Offers Extended" value={formData.totalOffered} onChange={change} error={errors.totalOffered} example="1200"/>
              <Input name="totalEnrolled" label="Total Enrolled Students" value={formData.totalEnrolled} onChange={change} error={errors.totalEnrolled} example="800"/>
              <p className="text-gray-500 text-sm col-span-2 mt-1">
                Note: Total Offers cannot exceed Total Applicants. Total Enrolled cannot exceed Total Offers.
              </p>
            </Section>

            <Section title="Enrollment Demographics">
              <div className="grid grid-cols-2 gap-4">
                <Input name="boys" label="Boys (%)" value={formData.boys} onChange={change} error={errors.boys} example="50"/>
                <Input name="girls" label="Girls (%)" value={formData.girls} onChange={change} error={errors.girls} example="50"/>
              </div>
              <Input name="percentInState" label="In-State Students (%)" value={formData.percentInState} onChange={change} error={errors.percentInState} example="60"/>
              <Input name="percentOutofState" label="Out-of-State Students (%)" value={formData.percentOutofState} onChange={change} error={errors.percentOutofState} example="25"/>
              <Input name="internationalPerc" label="International Students (%)" value={formData.internationalPerc} onChange={change} error={errors.internationalPerc} example="15"/>
              <Input name="percentAthlete" label="Student Athletes (%)" value={formData.percentAthlete} onChange={change} error={errors.percentAthlete} example="5"/>
              <p className="text-gray-500 text-sm col-span-2 mt-1">
                Note: In-State + Out-of-State + International must sum to 100
              </p>
            </Section>

            <Section title="Academic Performance">
              <Input name="avgGPA" label="Average GPA" value={formData.avgGPA} onChange={change} error={errors.avgGPA} example="3.6"/>
              <Input name="aveTestScore" label="Average Test Score" value={formData.aveTestScore} onChange={change} error={errors.aveTestScore} example="1200"/>
            </Section>

            <Section title="Student–Faculty Ratio">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-lg">Students: <span className="text-red-600">*</span></label>
                  <input type="number" name="students" value={formData.students} onChange={change} placeholder="" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#0F2D52] outline-none"/>
                  {errors.students && <p className="text-red-600 mt-1">{errors.students}</p>}
                  <p className="text-gray-400 text-sm mt-1">Example: 200</p>
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-lg">Faculty: <span className="text-red-600">*</span></label>
                  <input type="number" name="teachers" value={formData.teachers} onChange={change} placeholder="" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#0F2D52] outline-none"/>
                  {errors.teachers && <p className="text-red-600 mt-1">{errors.teachers}</p>}
                  <p className="text-gray-400 text-sm mt-1">Example: 10</p>
                </div>
              </div>
            </Section>

            <div className="flex flex-col gap-2">
              <HoverButton type="submit" primary bold> {editingYear ? "Update Benchmark Record" : "Save Benchmark Record"} </HoverButton>
              <HoverButton type="button" reset bold onClick={resetForm}>Reset Form</HoverButton>
            </div>

          </form>
        </div>
      )}

      {/* search */}
      {tab === "search" && (
        <div className="max-w-6xl mx-auto mt-10">
          <div className="flex gap-4 mb-6 justify-end">
            <input type="text" placeholder="Search by Year" value={searchYear} onChange={(e)=>setSearchYear(e.target.value)} className="border border-gray-300 p-2 rounded w-1/4 focus:ring-2 focus:ring-[#0F2D52] outline-none"/>
            <HoverButton small primary onClick={searchByYear}>Search</HoverButton>
          </div>

          {searchResults.length ? (
            <table className="w-full border rounded-lg overflow-hidden shadow">
              <thead className="bg-[#0F2D52] text-white">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Applicants</th>
                  <th className="p-3">Offered</th>
                  <th className="p-3">Enrolled</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((rec,i)=>(
                  <tr key={rec.year} className={i%2===0?"bg-gray-100 text-center":"bg-white text-center"}>
                    <td className="p-3">{rec.year}</td>
                    <td className="p-3">{rec.totalApplicants}</td>
                    <td className="p-3">{rec.totalOffered}</td>
                    <td className="p-3">{rec.totalEnrolled}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <HoverButton small primary onClick={()=>loadForEdit(rec)}>Edit</HoverButton>
                      <HoverButton small danger onClick={()=>deleteRecord(rec.year)}>Delete</HoverButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-gray-600">No records found.</p>}
        </div>
      )}
    </div>
  );
};

export default BenchmarkForm;

export function Section({ title, children }) { return (<div><h2 className="text-2xl font-semibold text-[#0F2D52] mb-6 border-b pb-2">{title}</h2><div className="grid grid-cols-2 gap-8">{children}</div></div>); }
export function Input({ name, label, value, onChange, error, example }) {
  return (<div><label className="block font-semibold mb-2 text-lg">{label} <span className="text-red-600">*</span></label>
    <input type="number" name={name} value={value} onChange={onChange} className="w-full border border-gray-300 px-4 py-2 text-base rounded-lg focus:ring-2 focus:ring-[#0F2D52] outline-none"/>
    {error && <p className="text-red-600 mt-1">{error}</p>}
    <p className="text-gray-400 text-sm mt-1">Example: {example}</p>
  </div>);
}
export function StatCard({ title, value }) { return (<div className="bg-white p-6 shadow rounded"><p className="text-gray-500 font-semibold">{title}</p><p className="text-2xl font-bold mt-2">{value}</p></div>); }
export function TabButton({ active, children, onClick }) { return (<button onClick={onClick} className={`px-10 py-3 rounded-full font-semibold text-lg transform transition-all duration-200 hover:scale-110 group ${active?"bg-[#0F2D52] text-white":"bg-gray-200 text-gray-700"}`}>{children}<span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span></button>); }
export function HoverButton({ children, primary, danger, reset, small, bold, ...props }) {
  let bg = primary?"bg-[#F4A300] hover:bg-[#d99100]":reset?"bg-gray-400 hover:bg-gray-500":danger?"bg-[#D94141] hover:bg-[#B23030]":"bg-[#0F6CA6] hover:bg-[#0C5C8F]";
  let text = primary || reset ? "text-black":"text-white";
  let weight = bold?"font-bold":"font-semibold";
  let padding = small?"px-4 py-2 text-sm":"px-6 py-3 text-lg";
  return (
    <button {...props} className={`${bg} ${text} ${weight} ${padding} ${small?"w-auto":"w-full"} rounded-xl transform transition-all duration-200 hover:scale-110 group flex items-center justify-center`}>
      <span className="transition-transform">{children}</span>
      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
    </button>
  );
}