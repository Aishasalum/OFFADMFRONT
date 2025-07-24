import React from 'react';
import '../styles/AdminNavbar.css';
import { FaUserShield } from 'react-icons/fa';

const AdminNavbar = () => {
  return (
    <div className="admin-navbar">
      <div className="navbar-content">
        <FaUserShield className="admin-icon" />
        <marquee behavior="scroll" direction="left" scrollamount="5" className="admin-welcome">
          Welcome, Admin – Manage users, payments, and certificate verifications smoothly!
        </marquee>
      </div>
    </div>
  );
};

export default AdminNavbar;
