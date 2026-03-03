import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BenchmarkForm = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("form");
  const [formData, setFormData] = useState({
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
  });
  const [errors, setErrors] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [editingYear, setEditingYear] = useState(null);
  const [searchYear, setSearchYear] = useState("");

  useEffect(() => {
    if (tab === "search") fetchAll();
  }, [tab]);

  const change = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let error = {};
    if (!/^\d{4}$/.test(formData.year)) error.year = "Enter a 4-digit year";
    if (formData.avgGPA < 0 || formData.avgGPA > 4)
      error.avgGPA = "GPA must be between 0–4";
    if (formData.percentAthlete < 0 || formData.percentAthlete > 100)
      error.percentAthlete = "Percent Athlete must be 0–100";
    const totalPercent =
      Number(formData.percentInState || 0) +
      Number(formData.percentOutofState || 0) +
      Number(formData.internationalPerc || 0);
    if (totalPercent !== 100)
      error.percentInState =
        "In-State, Out-of-State, International must sum to 100";
    setErrors(error);
    return Object.keys(error).length === 0;
  };

  const resetForm = () => {
    setFormData({
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
    });
    setErrors({});
    setEditingYear(null);
    setTab("form");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingYear) {
        await axios.put(
          `http://localhost:5000/api/benchmark/year/${editingYear}`,
          formData
        );
        alert("Record updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/benchmark", formData);
        alert("New record created successfully!");
      }
      resetForm();
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error saving record. Check backend endpoints.");
    }
  };

  const loadForEdit = (record) => {
    setFormData(record);
    setEditingYear(record.year);
    setTab("form");
  };

  const deleteRecord = async (year) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/benchmark/year/${year}`);
      fetchAll();
      alert("Record deleted successfully.");
    } catch {
      alert("Error deleting record. Check backend endpoints.");
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
    if (!/^\d{4}$/.test(searchYear)) {
      alert("Enter a valid 4-digit year");
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/benchmark/year/${searchYear}`
      );
      setSearchResults([res.data]);
    } catch {
      setSearchResults([]);
      alert("No record found for that year");
    }
  };

  // Dashboard stats
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

  const fields = [
    { key: "year", label: "Year", example: "2023" },
    { key: "totalApplicants", label: "Total Applicants", example: "200" },
    { key: "totalOffered", label: "Total Offered", example: "120" },
    { key: "totalEnrolled", label: "Total Enrolled", example: "80" },
    { key: "percentInState", label: "Percent In-State", example: "30" },
    { key: "percentOutofState", label: "Percent Out-of-State", example: "20" },
    { key: "internationalPerc", label: "Percent International", example: "50" },
    { key: "avgGPA", label: "Average GPA", example: "3.75" },
    { key: "aveTestScore", label: "Average Test Score", example: "1200" },
    { key: "percentAthlete", label: "Percent Athlete", example: "10" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Header Area */}
      <div className="w-full bg-gray-800 text-white p-10 flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-bold">Benchmark Management</h1>
          <p className="text-gray-300 mt-2 text-lg">
            Create | Search | Edit | Delete Benchmarks
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl shadow font-semibold"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 mb-8 text-center">
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 font-semibold">Acceptance Rate</p>
          <p className="text-2xl font-bold">{acceptanceRate}%</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 font-semibold">Yield Rate</p>
          <p className="text-2xl font-bold">{yieldRate}%</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500 font-semibold">Student : Teacher Ratio</p>
          <p className="text-2xl font-bold">{teacherRatio}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-4">
          <button
            className={`px-6 py-2 rounded-full font-semibold ${tab === "form"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => {
              resetForm();
              setTab("form");
            }}
          >
            Create / Edit
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold ${tab === "search"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setTab("search")}
          >
            Search / Delete
          </button>
        </div>
      </div>

      {/* Form Tab */}
      {tab === "form" && (
        <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-xl">
          <form onSubmit={submit} className="grid grid-cols-2 gap-6">
            {fields
              .filter((f) => f.key !== "percentAthlete" && f.key !== "students")
              .map((f) => (
                <div key={f.key} className="flex flex-col">
                  <label className="font-semibold mb-1">{f.label}</label>
                  <input
                    type="number"
                    step={f.key === "avgGPA" ? "0.01" : "1"}
                    name={f.key}
                    value={formData[f.key]}
                    onChange={change}
                    className="border p-2 rounded focus:ring-2 focus:ring-gray-800 outline-none"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Example: {f.example}{" "}
                    {f.key.includes("percent") &&
                      f.key !== "percentAthlete" &&
                      "(All percentages must sum to 100)"}
                  </p>
                  {errors[f.key] && (
                    <p className="text-red-600 text-sm mt-1">{errors[f.key]}</p>
                  )}
                </div>
              ))}

            {/* Percent Athlete */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Percent Athlete</label>
              <input
                type="number"
                step="1"
                name="percentAthlete"
                value={formData.percentAthlete}
                onChange={change}
                className="border p-2 rounded focus:ring-2 focus:ring-gray-800 outline-none"
              />
              <p className="text-gray-500 text-sm mt-1">
                Example: 10 (Maximum 100)
              </p>
              {errors.percentAthlete && (
                <p className="text-red-600 text-sm mt-1">{errors.percentAthlete}</p>
              )}
            </div>

            {/* Student : Teacher Ratio */}
            <div className="flex flex-col col-span-2">
              <label className="font-semibold mb-1">Student : Teacher Ratio</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="1"
                  name="students"
                  value={formData.students}
                  onChange={change}
                  placeholder="Students"
                  className="border p-2 rounded flex-1"
                />
                <span className="self-center font-bold">:</span>
                <input
                  type="number"
                  step="1"
                  name="teachers"
                  value={formData.teachers}
                  onChange={change}
                  placeholder="Teachers"
                  className="border p-2 rounded flex-1"
                />
              </div>
              {errors.students && (
                <p className="text-red-600 text-sm mt-1">{errors.students}</p>
              )}
            </div>

            <div className="col-span-2 mt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold"
              >
                {editingYear ? "Update Record" : "Create Benchmark"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Tab */}
      {tab === "search" && (
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by Year"
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              className="border p-2 rounded flex-1 focus:ring-2 focus:ring-gray-800 outline-none"
            />
            <button
              onClick={searchByYear}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-semibold"
            >
              Search
            </button>
            <button
              onClick={fetchAll}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-semibold"
            >
              Reset
            </button>
          </div>

          {searchResults.length ? (
            <table className="w-full border rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Applicants</th>
                  <th className="p-3">Offered</th>
                  <th className="p-3">Enrolled</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((rec, i) => (
                  <tr
                    key={rec.year}
                    className={i % 2 === 0 ? "bg-gray-100 text-center" : "bg-white text-center"}
                  >
                    <td className="p-2">{rec.year}</td>
                    <td className="p-2">{rec.totalApplicants}</td>
                    <td className="p-2">{rec.totalOffered}</td>
                    <td className="p-2">{rec.totalEnrolled}</td>
                    <td className="py-2 flex justify-center gap-2">
                      <button
                        onClick={() => loadForEdit(rec)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRecord(rec.year)}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1 rounded font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No records found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BenchmarkForm;