import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "";

const inputClass =
  "w-full border border-gray-300 px-4 py-4 text-lg rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#0F2D52]";

const tabClass = (active) =>
  `px-8 py-3 rounded-full font-semibold text-lg shadow-md transition-all duration-200 ${active
    ? "bg-[#0F2D52] text-white"
    : "bg-gray-200 text-gray-700 hover:scale-105"
  }`;

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "school",
    schoolId: "",
  });

  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${API}/api/auth/schools`);
        const sorted = response.data.sort((a, b) =>
          a.NAME_TX.localeCompare(b.NAME_TX)
        );
        setSchools(sorted);
        setFilteredSchools(sorted);
      } catch (err) {
        console.error("Failed to fetch schools:", err);
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".school-dropdown") === null) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const next = {
      ...formData,
      [name]: value,
    };

    if (name === "role" && value === "admin") {
      next.schoolId = "1";
      setSchoolSearch("");
    }

    if (name === "role" && value === "school" && formData.schoolId === "1") {
      next.schoolId = "";
    }

    setFormData(next);
  };

  const handleSchoolSearch = (e) => {
    const searchValue = e.target.value;
    const lowered = searchValue.toLowerCase();

    setSchoolSearch(searchValue);
    setShowDropdown(true);

    const filtered = schools.filter(
      (school) =>
        school.NAME_TX.toLowerCase().includes(lowered) ||
        school.ID.toString().includes(lowered)
    );

    setFilteredSchools(filtered);
  };

  const handleSchoolSelect = (school) => {
    setFormData((prev) => ({
      ...prev,
      schoolId: school.ID.toString(),
    }));
    setSchoolSearch(school.NAME_TX);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const signupData = {
        ...formData,
        schoolId: formData.role === "admin" ? 1 : Number(formData.schoolId),
      };

      const response = await axios.post(`${API}/api/auth/signup`, signupData, {
        withCredentials: true,
      });

      login(response.data.user);

      if (response.data.user.role === "admin") {
        navigate("/benchmark");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="bg-white p-10 shadow-md border border-gray-200 rounded-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-[#0F2D52]">
              Create Account
            </h1>
            <p className="mt-2 text-gray-500 text-base">
              Register for access to the dashboard
            </p>
          </div>

          <div className="mb-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  role: "school",
                  schoolId: prev.schoolId === "1" ? "" : prev.schoolId,
                }))
              }
              className={tabClass(formData.role === "school")}
            >
              Teacher
            </button>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  role: "admin",
                  schoolId: "1",
                }))
              }
              className={tabClass(formData.role === "admin")}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 text-lg text-[#111827]">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-lg text-[#111827]">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-lg text-[#111827]">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-lg text-[#111827]">
                  Role <span className="text-red-600">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="school">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {formData.role !== "admin" && (
              <div className="school-dropdown relative">
                <label className="block font-semibold mb-2 text-lg text-[#111827]">
                  School <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Search or select a school"
                  value={schoolSearch}
                  onChange={handleSchoolSearch}
                  onFocus={() => setShowDropdown(true)}
                  className={inputClass}
                />

                {showDropdown && (
                  <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-md">
                    {filteredSchools.length > 0 ? (
                      filteredSchools.map((school) => (
                        <button
                          type="button"
                          key={school._id || school.ID}
                          onClick={() => handleSchoolSelect(school)}
                          className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-100 ${formData.schoolId === school.ID.toString()
                              ? "bg-gray-100"
                              : ""
                            }`}
                        >
                          <div className="font-semibold text-[#111827]">
                            {school.NAME_TX}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {school.ID}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No schools found
                      </div>
                    )}
                  </div>
                )}

                {formData.schoolId && (
                  <input type="hidden" name="schoolId" value={formData.schoolId} />
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                schoolsLoading ||
                (formData.role !== "admin" && !formData.schoolId)
              }
              className="w-full py-3 text-lg font-semibold rounded-lg text-black bg-[#FFA500] hover:bg-[#f39200] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#0F2D52] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}