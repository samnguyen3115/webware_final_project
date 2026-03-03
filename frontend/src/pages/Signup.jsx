import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'school' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      const response = await axios.post('/api/auth/signup', formData);
      login(response.data.token, response.data.user);

      if (response.data.user.role === "admin") {
        navigate('/benchmark');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-xl bg-gray-100 p-10 shadow-2xl">
        <h1 className="mb-8 text-center text-3xl font-semibold text-black">Sign Up</h1>
        {error && (
          <div className="mb-5 rounded-md border border-gray-400 bg-gray-200 p-3 text-sm text-black">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="rounded-md border border-gray-400 bg-white px-3 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-gray-300"
            required
          />
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
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="rounded-mb border border-gray-400 bg-white px-3 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-gray-300"
            required
          >
            <option value="school">School User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-black px-3 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-black hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
