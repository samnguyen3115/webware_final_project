import React, { useState, useEffect } from "react";
import axios from "axios";

const BenchmarkForm = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState({
    year: "",
    totalApplicants: "",
    totalOffered: "",
    totalEnrolled: "",
    percentInState: "",
    percentOutOfState: "",
    internationalPerc: "",
    aveTestScore: "",
    percentAthlete: "",
    avgGPA: "",
    numStudents: "",
    numTeachers: "",
  });
  const [benchmarks, setBenchmarks] = useState([]);
  const [searchYear, setSearchYear] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch all benchmarks for table
  const fetchAll = async () => {
    try {
      const res = await axios.get("/api/benchmark");
      setBenchmarks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const validate = () => {
    let tempErrors = {};
    const { totalApplicants, totalOffered, totalEnrolled, percentInState, percentOutOfState, internationalPerc, percentAthlete, avgGPA } = formData;

    if (!totalApplicants || totalApplicants <= 0) tempErrors.totalApplicants = "Enter total applicants";
    if (!totalOffered || totalOffered <= 0) tempErrors.totalOffered = "Enter total offered";
    if (!totalEnrolled || totalEnrolled <= 0) tempErrors.totalEnrolled = "Enter total enrolled";
    if (Number(totalOffered) > Number(totalApplicants)) tempErrors.totalOffered = "Offered cannot exceed applicants";
    if (Number(totalEnrolled) > Number(totalOffered)) tempErrors.totalEnrolled = "Enrolled cannot exceed offered";

    if (percentInState < 0 || percentInState > 100) tempErrors.percentInState = "Must be 0-100";
    if (percentOutOfState < 0 || percentOutOfState > 100) tempErrors.percentOutOfState = "Must be 0-100";
    if (internationalPerc < 0 || internationalPerc > 100) tempErrors.internationalPerc = "Must be 0-100";
    if (percentAthlete < 0 || percentAthlete > 100) tempErrors.percentAthlete = "Must be 0-100";
    if (avgGPA < 0 || avgGPA > 4) tempErrors.avgGPA = "GPA must be 0-4";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (activeTab === "create") {
        await axios.post("/api/benchmark", formData);
      } else if (activeTab === "edit" && searchResult) {
        await axios.put(`/api/benchmark/year/${searchResult.year}`, formData);
      }
      alert("Saved successfully");
      fetchAll();
      setFormData({
        year: "",
        totalApplicants: "",
        totalOffered: "",
        totalEnrolled: "",
        percentInState: "",
        percentOutOfState: "",
        internationalPerc: "",
        aveTestScore: "",
        percentAthlete: "",
        avgGPA: "",
        numStudents: "",
        numTeachers: "",
      });
      setSearchResult(null);
    } catch (err) {
      console.error(err);
      alert("Error saving record");
    }
  };

  const handleDelete = async (year) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`/api/benchmark/year/${year}`);
      alert("Deleted successfully");
      fetchAll();
      setSearchResult(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting record");
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`/api/benchmark/year/${searchYear}`);
      setSearchResult(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      alert("Record not found");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Benchmark Management</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>Create, Search, Edit, Delete benchmark records</p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem", gap: "1rem" }}>
        <button onClick={() => setActiveTab("create")} style={{ padding: "0.5rem 1rem", cursor: "pointer", background: activeTab==="create"?"#1976d2":"#ddd", color: activeTab==="create"?"white":"black" }}>Create</button>
        <button onClick={() => setActiveTab("search")} style={{ padding: "0.5rem 1rem", cursor: "pointer", background: activeTab==="search"?"#1976d2":"#ddd", color: activeTab==="search"?"white":"black" }}>Search</button>
      </div>

      {activeTab === "create" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {["year","totalApplicants","totalOffered","totalEnrolled","percentInState","percentOutOfState","internationalPerc","aveTestScore","percentAthlete","avgGPA"].map(field => (
              <div key={field}>
                <label>{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="number"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  step={field==="avgGPA"?"0.01":"1"}
                  style={{ width: "100%" }}
                />
                {errors[field] && <small style={{color:"red"}}>{errors[field]}</small>}
              </div>
            ))}
          </div>
          {/* Student Teacher Ratio at bottom */}
          <div style={{ display:"flex", gap:"1rem", marginTop:"1rem" }}>
            <label>Student : Teacher Ratio</label>
            <input type="number" name="numStudents" value={formData.numStudents} onChange={handleChange} placeholder="Students"/>
            <input type="number" name="numTeachers" value={formData.numTeachers} onChange={handleChange} placeholder="Teachers"/>
          </div>
          <div style={{ marginTop:"1rem" }}>
            <button onClick={handleSubmit} style={{ padding:"0.5rem 1rem", cursor:"pointer", background:"#1976d2", color:"white" }}>Submit</button>
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div>
          <div style={{ marginBottom:"1rem" }}>
            <input type="number" placeholder="Enter Year" value={searchYear} onChange={(e)=>setSearchYear(e.target.value)}/>
            <button onClick={handleSearch} style={{ padding:"0.5rem 1rem", marginLeft:"0.5rem", background:"#1976d2", color:"white"}}>Search</button>
          </div>
          {searchResult && (
            <div style={{ border:"1px solid #ccc", padding:"1rem", marginTop:"1rem" }}>
              <h3>Record for Year {searchResult.year}</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                {["totalApplicants","totalOffered","totalEnrolled","percentInState","percentOutOfState","internationalPerc","aveTestScore","percentAthlete","avgGPA"].map(field=>(
                  <div key={field}>
                    <label>{field.replace(/([A-Z])/g,' $1')}</label>
                    <input type="number" name={field} value={formData[field]} onChange={handleChange} style={{width:"100%"}}/>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:"1rem", marginTop:"1rem" }}>
                <label>Student : Teacher Ratio</label>
                <input type="number" name="numStudents" value={formData.numStudents} onChange={handleChange} placeholder="Students"/>
                <input type="number" name="numTeachers" value={formData.numTeachers} onChange={handleChange} placeholder="Teachers"/>
              </div>
              <div style={{ marginTop:"1rem", display:"flex", gap:"1rem" }}>
                <button onClick={handleSubmit} style={{ padding:"0.5rem 1rem", background:"#1976d2", color:"white" }}>Update</button>
                <button onClick={()=>handleDelete(searchResult.year)} style={{ padding:"0.5rem 1rem", background:"red", color:"white" }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop:"2rem" }}>
        <button onClick={()=>window.location.href="/dashboard"} style={{ padding:"0.5rem 1rem", cursor:"pointer" }}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default BenchmarkForm;