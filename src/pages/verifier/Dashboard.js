import React from 'react';
import '../../styles/VerifierDashboard.css';

const Dashboard = () => {
  return (
    <div className="verifier-dashboard">
      <h2>Welcome, Verifier Officer 👋</h2>
      <div className="verifier-stats">
        <div className="stat-card pending">
          <h3>12</h3>
          <p>Pending Requests</p>
        </div>
        <div className="stat-card verified">
          <h3>35</h3>
          <p>Verified Certificates</p>
        </div>
        <div className="stat-card rejected">
          <h3>7</h3>
          <p>Rejected Certificates</p>
        </div>
        <div className="stat-card payments">
          <h3>18</h3>
          <p>Payments Received</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
