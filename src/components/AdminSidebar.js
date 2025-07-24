// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import '../styles/AdminSidebar.css';

// const AdminSidebar = () => {
//   return (
//     <div className="admin-sidebar">
//       <h2 className="sidebar-title">Admin Panel</h2>
//       <ul className="sidebar-links">
//         <li><NavLink to="/admin/dashboard" activeClassName="active-link">Dashboard</NavLink></li>
//         <li><NavLink to="/admin/users" activeClassName="active-link">Users</NavLink></li>
//         <li><NavLink to="/admin/verifier-officers" activeClassName="active-link">Verifier Officers</NavLink></li>
//         <li><NavLink to="/admin/payments" activeClassName="active-link">Payments</NavLink></li>
//         <li><NavLink to="/admin/user-requests" activeClassName="active-link">User Requests</NavLink></li>
//         <li><NavLink to="/admin/uploaded-certificates" activeClassName="active-link">Uploaded Certificates</NavLink></li>
//         {/* ✅ New Recycle Bin Link */}
//         <li><NavLink to="/admin/bin/recyclebin" activeClassName="active-link">Recycle Bin</NavLink></li>
//       </ul>
//     </div>
//   );
// };

// export default AdminSidebar;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/AdminSidebar.css';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Futaa token/session hapa
    localStorage.removeItem('adminToken'); // mfano kama umetumia localStorage
    navigate('/login'); // mpeleke user kwenye login page
  };

  return (
    <div className="admin-sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-links">
        <li><NavLink to="/admin/dashboard" activeClassName="active-link">Dashboard</NavLink></li>
        <li><NavLink to="/admin/users" activeClassName="active-link">Users</NavLink></li>
        <li><NavLink to="/admin/verifier-officers" activeClassName="active-link">Verifier Officers</NavLink></li>
        <li><NavLink to="/admin/payments" activeClassName="active-link">Payments</NavLink></li>
        <li><NavLink to="/admin/user-requests" activeClassName="active-link">User Requests</NavLink></li>
        <li><NavLink to="/admin/uploaded-certificates" activeClassName="active-link">Uploaded Certificates</NavLink></li>
        <li><NavLink to="/admin/bin/recyclebin" activeClassName="active-link">Recycle Bin</NavLink></li>
        <li><NavLink to="/admin/register-born" activeClassName="active-link">RegisterNewBorn</NavLink></li>
        {/* 🔴 Log Out Button */}
        <li>
          <button onClick={handleLogout} className="logout-button">Log Out</button>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
