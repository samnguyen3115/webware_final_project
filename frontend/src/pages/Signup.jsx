import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'school', schoolId: '' });
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('/api/auth/schools');
        const sorted = response.data.sort((a, b) => a.NAME_TX.localeCompare(b.NAME_TX));
        setSchools(sorted);
        setFilteredSchools(sorted);
      } catch (err) {
        console.error('Failed to fetch schools:', err);
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.school-dropdown') === null) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = {
      ...formData,
      [name]: value
    };

    if (name === 'role' && value === 'admin') {
      next.schoolId = '1';
    }

    if (name === 'role' && value === 'school' && formData.schoolId === '1') {
      next.schoolId = '';
    }

    setFormData(next);
  };

  const handleSchoolSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSchoolSearch(searchValue);
    setShowDropdown(true);
    
    const filtered = schools.filter(school =>
      school.NAME_TX.toLowerCase().includes(searchValue) ||
      school.ID.toString().includes(searchValue)
    );
    
    setFilteredSchools(filtered);
  };

  const handleSchoolSelect = (school) => {
    setFormData({
      ...formData,
      schoolId: school.ID.toString()
    });
    setSchoolSearch(school.NAME_TX);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signupData = {
        ...formData,
        schoolId: formData.role === 'admin' ? 1 : Number(formData.schoolId)
      };

      const response = await axios.post('/api/auth/signup', signupData, { withCredentials: true });

      login(response.data.user);

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
            <option value="school">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          
          {formData.role !== 'admin' && (
            <div className="relative school-dropdown">
              <input
                type="text"
                placeholder="Search or select a school"
                value={schoolSearch}
                onChange={handleSchoolSearch}
                onFocus={() => setShowDropdown(true)}
                className="w-full rounded-md border border-gray-400 bg-white px-3 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-gray-300"
              />
              {showDropdown && (
                <div className="absolute top-full z-10 w-full mt-1 max-h-56 overflow-y-auto border border-gray-400 rounded-md bg-white shadow-lg">
                  {filteredSchools.length > 0 ? (
                    filteredSchools.map((school) => (
                      <div
                        key={school._id}
                        onClick={() => handleSchoolSelect(school)}
                        className={`px-3 py-3 cursor-pointer hover:bg-blue-100 transition ${
                          formData.schoolId === school.ID.toString() ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="text-sm text-black font-medium">{school.NAME_TX}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-sm text-gray-600">
                      No schools found
                    </div>
                  )}
                </div>
              )}
              {formData.schoolId && (
                <input
                  type="hidden"
                  name="schoolId"
                  value={formData.schoolId}
                />
              )}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || (formData.role !== 'admin' && !formData.schoolId) || schoolsLoading}
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
