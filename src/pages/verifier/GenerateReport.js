import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/GenerateReport.css';

const GenerateReport = ({ onReportSubmitted, officerId = 1 }) => {
  const [reportId, setReportId] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [verifiedCount, setVerifiedCount] = useState('');
  const [rejectedCount, setRejectedCount] = useState('');
  const [comments, setComments] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [sendMethod, setSendMethod] = useState('dashboard');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form fields to empty/default
  const clearForm = () => {
    setReportId(null);
    setReportTitle('');
    setFromDate('');
    setToDate('');
    setVerifiedCount('');
    setRejectedCount('');
    setComments('');
    setAdminEmail('');
    setSendMethod('dashboard');
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/reports/officer/${officerId}`);
        if (res.data && res.data.length > 0) {
          const report = res.data[0];
          setReportId(report.id);
          setReportTitle(report.reportTitle);
          setFromDate(report.fromDate);
          setToDate(report.toDate);
          setVerifiedCount(report.verifiedCount);
          setRejectedCount(report.rejectedCount);
          setComments(report.comments);
          setSendMethod(report.sendMethod || 'dashboard');
          setAdminEmail(report.adminEmail || '');
        } else {
          clearForm();
        }
      } catch (err) {
        console.log("No previous report found for this officer.");
        clearForm();
      }
    };
    fetchReport();
  }, [officerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = {
      officerId,
      reportTitle: reportTitle.trim(),
      fromDate,
      toDate,
      verifiedCount: Number(verifiedCount) || 0,
      rejectedCount: Number(rejectedCount) || 0,
      comments: comments.trim(),
      sendMethod,
      adminEmail: sendMethod === 'email' ? adminEmail.trim() : ''
    };

    try {
      // Since no update endpoint, all submits are POST
      const res = await axios.post("http://localhost:8080/api/reports/submit", null, { params });
      setSuccessMsg("Report submitted successfully!");
      setErrorMsg('');
      clearForm();

      if (onReportSubmitted) {
        onReportSubmitted(res.data);
      }
    } catch (error) {
      console.error('Submission error:', error.response ? error.response.data : error.message);
      setErrorMsg("Failed to submit report. Please try again.");
      setSuccessMsg('');
    }
  };

  return (
    <div className="report-form-container">
      <h2>{reportId ? "Send Report" : "Generate & Submit Report"}</h2>
      {successMsg && <p className="success">{successMsg}</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="report-form">
        <label>Report Title:</label>
        <input
          type="text"
          value={reportTitle}
          onChange={e => setReportTitle(e.target.value)}
          required
        />

        <label>From Date:</label>
        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          required
        />

        <label>To Date:</label>
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          required
        />

        <label>Certificates Verified:</label>
        <input
          type="number"
          value={verifiedCount}
          onChange={e => setVerifiedCount(e.target.value)}
          required
        />

        <label>Certificates Rejected:</label>
        <input
          type="number"
          value={rejectedCount}
          onChange={e => setRejectedCount(e.target.value)}
          required
        />

        <label>Comments / Summary:</label>
        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          rows="4"
          placeholder="Write summary or challenges encountered..."
        />

        <label>Send Report Via:</label>
        <select
          value={sendMethod}
          onChange={e => setSendMethod(e.target.value)}
        >
          <option value="dashboard">Dashboard Only</option>
          <option value="email">Email to Admin</option>
        </select>

        {sendMethod === 'email' && (
          <>
            <label>Admin Email:</label>
            <input
              type="email"
              value={adminEmail}
              onChange={e => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </>
        )}

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default GenerateReport;
