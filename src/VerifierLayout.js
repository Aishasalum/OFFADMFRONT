import React from 'react';
import VerifierSidebar from './components/VerifierSidebar';
import VerifierNavbar from './components/VerifierNavbar';
import './styles/VerifierLayout.css';
import { Outlet } from 'react-router-dom';

const VerifierLayout = () => {
  return (
    <div className="verifier-layout">
      <VerifierSidebar />
      <div className="verifier-main">
        <VerifierNavbar />
        <div className="verifier-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default VerifierLayout;
