import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API = "http://localhost:5000";

const inputClass =
  "w-full border border-gray-300 px-4 py-4 text-lg rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#0F2D52]";

const tabClass = (active) =>
  `px-8 py-3 rounded-full font-semibold text-lg shadow-md transition-all duration-200 ${active
    ? "bg-[#0F2D52] text-white"
    : "bg-gray-200 text-gray-700 hover:scale-105"
  }`;

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("school");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/api/auth/login`, formData, {
        withCredentials: true,
      });

      const userRole = response.data.user.role;

      if (userRole !== loginType) {
        setError(
          `This account is not registered as a ${loginType === "admin" ? "admin" : "teacher"
          } user.`
        );
        setLoading(false);
        return;
      }

      login(response.data.user);

      if (userRole === "admin") {
        navigate("/benchmark");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="bg-white p-10 shadow-md border border-gray-200 rounded-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-[#0F2D52]">
              {loginType === "admin" ? "Admin Login" : "Teacher Login"}
            </h1>
            <p className="mt-2 text-gray-500 text-base">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="mb-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setLoginType("school")}
              className={tabClass(loginType === "school")}
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={tabClass(loginType === "admin")}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-semibold rounded-lg text-black bg-[#FFA500] hover:bg-[#f39200] transition-all duration-300"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#0F2D52] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}