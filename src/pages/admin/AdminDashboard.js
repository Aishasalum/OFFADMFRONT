import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { FaUsers, FaUserShield, FaMoneyBillWave } from 'react-icons/fa';
import '../../styles/AdminDashboard.css';

// Rangi za pie chart
const COLORS = ['#00C49F', '#FFBB28', '#FF4444'];

const CATEGORY_COLORS = {
  Users: '#00C49F',                 // Green
  'Verification Requests': '#FFBB28', // Yellow
  'New Applications': '#FF4444',      // Red
};

// Custom tooltip ya Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0] || {};
    let labelText = '';
    if (name === 'Users') labelText = `Users: ${value}`;
    else if (name === 'Verification Requests') labelText = `Total Requests: ${value}`;
    else if (name === 'New Applications') labelText = `New Applications: ${value}`;
    else labelText = `${name}: ${value}`;

    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '8px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <strong>{labelText}</strong>
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifierCount, setVerifierCount] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);

  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // USERS (active)
        const usersRes = await axios.get('http://localhost:8080/api/users/active');
        const totalUsersCount = Array.isArray(usersRes.data) ? usersRes.data.length : 0;
        setTotalUsers(totalUsersCount);

        // VERIFIER OFFICERS
        const verifiersRes = await axios.get('http://localhost:8080/api/verifier-officer/all');
        const verifiersCount = Array.isArray(verifiersRes.data) ? verifiersRes.data.length : 0;
        setVerifierCount(verifiersCount);

        // CERTIFICATE APPLICATIONS (NEW only)
        const applicationsRes = await axios.get('http://localhost:8080/api/certificate-applications');
        const apps = Array.isArray(applicationsRes.data) ? applicationsRes.data : [];
        const newApplicationsCount = apps.filter(app => String(app.status).toUpperCase() === 'NEW').length;

        // ACTIVE VERIFICATION REQUESTS
        const activeRequestsRes = await axios.get('http://localhost:8080/api/verification-requests/active');
        const activeRequestsCount = Array.isArray(activeRequestsRes.data) ? activeRequestsRes.data.length : 0;

        // PAYMENTS (active)
        const paymentsRes = await axios.get('http://localhost:8080/api/payments/active');
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
        const paidCount = payments.filter(p => String(p.status).toUpperCase() === 'PAID').length;
        const notPaidCount = payments.filter(p => String(p.status).toUpperCase() !== 'PAID').length;
        const totalAmt = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        setTotalPayments(totalAmt);

        // PIE DATA
        setPieData([
          { name: 'Users', value: totalUsersCount },
          { name: 'Verification Requests', value: activeRequestsCount },
          { name: 'New Applications', value: newApplicationsCount },
        ]);

        // BAR DATA
        setBarData([
          { name: 'Paid', count: paidCount },
          { name: 'Not Paid', count: notPaidCount },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Welcome Admin</h2>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card blue">
          <FaUsers className="stat-icon" />
          <div>
            <h4>Total Users</h4>
            <p>{totalUsers}</p>
          </div>
        </div>
        <div className="stat-card green">
          <FaUserShield className="stat-icon" />
          <div>
            <h4>Verifier Officers</h4>
            <p>{verifierCount}</p>
          </div>
        </div>
        <div className="stat-card purple">
          <FaMoneyBillWave className="stat-icon" />
          <div>
            <h4>Total Payments</h4>
            <p>TZS {Number(totalPayments).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        {/* Pie Chart */}
        <div className="chart-section pie-chart">
          <h3>System Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={110}
                dataKey="value"
                isAnimationActive={true}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
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









// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import { 
//   FaUsers, FaUserShield, FaMoneyBillWave, FaFileAlt, FaCertificate, 
//   FaUserClock, FaUserCheck, FaChartLine, FaCalendarAlt 
// } from 'react-icons/fa';
// import { FiUser, FiUserX } from 'react-icons/fi';
// import '../../styles/AdminDashboard.css';

// const API_BASE_URL = 'http://localhost:8080/api';

// const COLORS = ['#0088FE', '#00C49F'];

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     currentUsers: 0,
//     formerUsers: 0,
//     verifierOfficers: 0,
//     totalPayments: 0,
//     newApplications: 0,
//     birthRecords: 0,
//     totalCertificates: 0,
//     loading: true
//   });
  
//   const [paymentData, setPaymentData] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const apiClient = axios.create({
//           baseURL: API_BASE_URL,
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         });

//         // Fetch all data in parallel
//         const [
//           usersResponse,
//           verifierOfficersResponse,
//           paymentsResponse,
//           applicationsResponse,
//           certificatesResponse
//         ] = await Promise.all([
//           apiClient.get('/users/active').catch(() => ({ data: [] })),
//           apiClient.get('/verifier-officer/all').catch(() => ({ data: [] })),
//           apiClient.get('/payments/active').catch(() => ({ data: [] })),
//           apiClient.get('/certificate-applications').catch(() => ({ data: [] })),
//           apiClient.get('/certificates').catch(() => ({ data: [] }))
//         ]);

//         // Process user data
//         const users = usersResponse.data || [];
//         const currentUsers = users.filter(u => u.lastLogin && isRecentLogin(u.lastLogin)).length;
        
//         // Process payment data
//         const payments = paymentsResponse.data || [];
//         const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
//         setPaymentData([
//           { name: 'Paid', value: payments.filter(p => p.status === 'paid').length },
//           { name: 'Unpaid', value: payments.filter(p => p.status !== 'paid').length }
//         ]);

//         // Process application data
//         const applications = applicationsResponse.data || [];
//         const birthRecords = applications.filter(app => app.type === 'birth').length;

//         // Update stats
//         setStats({
//           totalUsers: users.length,
//           currentUsers,
//           formerUsers: users.length - currentUsers,
//           verifierOfficers: verifierOfficersResponse.data.length || 0,
//           totalPayments,
//           newApplications: applications.filter(app => isNewApplication(app.createdAt)).length,
//           birthRecords,
//           totalCertificates: certificatesResponse.data.length || 0,
//           loading: false
//         });

//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Failed to load live data. Showing sample data.');
//         setStats({
//           totalUsers: 350,
//           currentUsers: 220,
//           formerUsers: 130,
//           verifierOfficers: 12,
//           totalPayments: 3250000,
//           newApplications: 15,
//           birthRecords: 8,
//           totalCertificates: 40,
//           loading: false
//         });
//         setPaymentData([
//           { name: 'Paid', value: 120 },
//           { name: 'Unpaid', value: 40 }
//         ]);
//       }
//     };

//     fetchData();
//   }, []);

//   const isRecentLogin = (loginDate) => {
//     const date = new Date(loginDate);
//     const now = new Date();
//     const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
//     return diffDays <= 30;
//   };

//   const isNewApplication = (createdDate) => {
//     const date = new Date(createdDate);
//     const now = new Date();
//     const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
//     return diffDays <= 7;
//   };

//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
//     const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

//     return (
//       <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
//         {`${name}: ${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   return (
//     <div className="modern-dashboard">
//       <div className="dashboard-header">
//         <h2>Admin Dashboard Overview</h2>
//       </div>

//       {error && <div className="alert alert-warning">{error}</div>}

//       {/* Summary Cards */}
//       <div className="summary-cards">
//         <div className="summary-card">
//           <div className="card-icon blue">
//             <FaUsers />
//           </div>
//           <div className="card-content">
//             <h4>Total Users</h4>
//             <p>{stats.totalUsers}</p>
//             <div className="card-subtext">
//               <span className="current"><FiUser /> {stats.currentUsers} Current</span>
//               <span className="former"><FiUserX /> {stats.formerUsers} Former</span>
//             </div>
//           </div>
//         </div>

//         <div className="summary-card">
//           <div className="card-icon green">
//             <FaUserShield />
//           </div>
//           <div className="card-content">
//             <h4>Verifier Officers</h4>
//             <p>{stats.verifierOfficers}</p>
//           </div>
//         </div>

//         <div className="summary-card">
//           <div className="card-icon purple">
//             <FaFileAlt />
//           </div>
//           <div className="card-content">
//             <h4>Applications</h4>
//             <p>{stats.newApplications + stats.birthRecords}</p>
//             <div className="card-subtext">
//               <span><FaCertificate /> {stats.newApplications} New</span>
//               <span><FaFileAlt /> {stats.birthRecords} Birth</span>
//             </div>
//           </div>
//         </div>

//         <div className="summary-card">
//           <div className="card-icon orange">
//             <FaMoneyBillWave />
//           </div>
//           <div className="card-content">
//             <h4>Total Payments</h4>
//             <p>TZS {stats.totalPayments.toLocaleString()}</p>
//           </div>
//         </div>
//       </div>

//       {/* Charts Row */}
//       <div className="charts-row">
//         {/* User Status Pie Chart */}
//         <div className="chart-container">
//           <div className="chart-header">
//             <h3>User Status</h3>
//             <div className="total-badge">
//               Total: {stats.totalUsers}
//             </div>
//           </div>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={[
//                   { name: 'Current Users', value: stats.currentUsers },
//                   { name: 'Former Users', value: stats.formerUsers }
//                 ]}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={renderCustomizedLabel}
//                 outerRadius={120}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 <Cell fill="#00C49F" />
//                 <Cell fill="#FFBB28" />
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Payment Status Bar Chart */}
//         <div className="chart-container">
//           <div className="chart-header">
//             <h3>Payment Status</h3>
//           </div>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={paymentData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="value" fill="#8884d8">
//                 <Cell fill="#00C49F" />
//                 <Cell fill="#FF4444" />
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;