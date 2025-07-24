import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { FaUsers, FaUserShield, FaMoneyBillWave } from 'react-icons/fa';
import '../../styles/AdminDashboard.css';

const pieData = [
  { name: 'Verified', value: 50 },
  { name: 'Pending', value: 30 },
  { name: 'Rejected', value: 20 },
];

const barData = [
  { name: 'Paid', count: 120 },
  { name: 'Not Paid', count: 40 },
];

const COLORS = ['#00C49F', '#FFBB28', '#FF4444'];

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Welcome Admin</h2>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card blue">
          <FaUsers className="stat-icon" />
          <div>
            <h4>Total Users</h4>
            <p>350</p>
          </div>
        </div>
        <div className="stat-card green">
          <FaUserShield className="stat-icon" />
          <div>
            <h4>Verifier Officers</h4>
            <p>12</p>
          </div>
        </div>
        <div className="stat-card purple">
          <FaMoneyBillWave className="stat-icon" />
          <div>
            <h4>Total Payments</h4>
            <p>TZS 3,250,000</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-section pie-chart">
          <h3>Certificate Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section bar-chart">
          <h3>Payment Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4e73df" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
