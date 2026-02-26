import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BenchmarkForm from './components/BenchmarkForm.jsx';  //i added
import './App.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route                //i added
            path="/dashboard/benchmark"
            element={
              <ProtectedRoute>
              <BenchmarkForm />
              </ProtectedRoute>
            }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>  
      </Router>
    </AuthProvider>
  );
}

export default App;
