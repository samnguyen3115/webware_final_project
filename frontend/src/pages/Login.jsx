import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginType, setLoginType] = useState("school"); // school maps to teacher/student

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData, { withCredentials: true });
      const userRole = response.data.user.role;

      if (userRole !== loginType) {
        setError(`This account is not registered as a ${loginType === 'admin' ? 'admin' : 'teacher/student'} user.`);
        setLoading(false);
        return;
      }

      login(response.data.user);

      if (userRole === "admin") {
        navigate('/benchmark');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-xl bg-gray-100 p-10 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-semibold text-black">{loginType === "admin" ? "Admin Login" : "Teacher/Student Login"}</h1>
        <div className="mb-6 flex justify-center gap-4">
          <button type="button"
            onClick={() => setLoginType("school")}
            className={`px-2 py-2 rounded-md ${loginType === "school" ? "bg-black text-white" : "bg-gray-300 text-black"}`}>Teacher/Student</button>

          <button type="button"
            onClick={() => setLoginType("admin")}
            className={`px-2 py-2 rounded-md ${loginType === "admin" ? "bg-black text-white" : "bg-gray-300 text-black"}`}>Admin</button>

        </div>

        {error && (
          <div className="mb-5 rounded-md border border-gray-400 bg-gray-200 p-3 text-sm text-black">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="rounded-md border border-gray-400 bg-white px-3 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-gray-300"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="rounded-md border border-gray-400 bg-white px-3 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-gray-300"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-black px-3 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-700">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-semibold text-black hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
