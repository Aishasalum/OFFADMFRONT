import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/VerifierSidebar.css';

const VerifierSidebar = () => {
  return (
    <div className="verifier-sidebar">
      <h2 className="sidebar-title">Verifier Panel</h2>
      <nav className="sidebar-nav">
        <NavLink to="/verifier/dashboard" activeClassName="active">Dashboard</NavLink>
        <NavLink to="/verifier/view-requests" activeClassName="active">User Requests</NavLink>
        <NavLink to="/verifier/uploaded-certificates" activeClassName="active">Uploaded Certificates</NavLink>
        <NavLink to="/verifier/birth-records" activeClassName="active">Certificate Records</NavLink>
        <NavLink to="/verifier/payments" activeClassName="active">Payments</NavLink>
        <NavLink to="/verifier/pending" activeClassName="active">Pending</NavLink>
        <NavLink to="/verifier/verified" activeClassName="active">Verified</NavLink>
        <NavLink to="/verifier/rejected" activeClassName="active">Rejected</NavLink>
        <NavLink to="/" activeClassName="active">Logout</NavLink>
      </nav>
    </div>
  );
};

export default VerifierSidebar;
