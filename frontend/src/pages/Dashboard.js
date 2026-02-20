import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Hi, this is the first iteration</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
