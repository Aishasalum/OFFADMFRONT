import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

// Verifier Layout and Pages
import VerifierLayout from './VerifierLayout';
import Dashboard from './pages/verifier/Dashboard';
import ViewRequests from './pages/verifier/ViewRequests';
import UploadedCertificates from './pages/verifier/UploadedCertificates';
import BirthRecords from './pages/verifier/BirthRecords';
import Payments from './pages/verifier/Payments';
import PendingCertificates from './pages/verifier/PendingCertificates';
import VerifiedCertificates from './pages/verifier/VerifiedCertificates';
import RejectedCertificates from './pages/verifier/RejectedCertificates';
import Settings from './pages/verifier/Settings';

// Admin Layout and Pages
import AdminLayout from './AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import VerifierOfficers from './pages/admin/VerifierOfficers';
import AdminPayments from './pages/admin/Payments';
import UserRequests from './pages/admin/UserRequests';
import AdminUploadedCertificates from './pages/admin/UploadedCertificates';
import RecycleBin from './pages/admin/bin/RecycleBin';
import RegisterNewBorn from './pages/admin/RegisterNewBorn';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import ContactAdmin from './pages/ContactAdmin';
import GenerateReport from './pages/verifier/GenerateReport';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route */}
        
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact-admin" element={<ContactAdmin />} />

        {/* Verifier Officer Dashboard routes */}
        <Route path="/verifier" element={<VerifierLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="view-requests" element={<ViewRequests />} />
          <Route path="uploaded-certificates" element={<UploadedCertificates />} />
          <Route path="birth-records" element={<BirthRecords />} />
          <Route path="payments" element={<Payments />} />
          <Route path="pending" element={<PendingCertificates />} />
          <Route path="verified" element={<VerifiedCertificates />} />
          <Route path="rejected" element={<RejectedCertificates />} />
          <Route path="generate-report" element={<GenerateReport />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* === ADMIN DASHBOARD ROUTES START HERE === */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="verifier-officers" element={<VerifierOfficers />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="user-requests" element={<UserRequests />} />
          <Route path="uploaded-certificates" element={<AdminUploadedCertificates />} />
          <Route path='bin/recyclebin' element={<RecycleBin />} />
          <Route path='register-born' element={<RegisterNewBorn />} />
          <Route path='reports' element={<AdminReportsPage />} />
        </Route>
        {/* === END OF ADMIN DASHBOARD ROUTES === */}
      </Routes>
    </Router>
  );
}

export default App;
