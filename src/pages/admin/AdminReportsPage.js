import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";



const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/reports");
        setReports(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load reports.");
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const generatePdf = (report) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(report.reportTitle, 10, 20);

    doc.setFontSize(12);
    doc.text(`From: ${report.fromDate}`, 10, 40);
    doc.text(`To: ${report.toDate}`, 10, 50);
    doc.text(`Verified Count: ${report.verifiedCount}`, 10, 60);
    doc.text(`Rejected Count: ${report.rejectedCount}`, 10, 70);
    doc.text(`Comments:`, 10, 80);
    
    // Split comments by lines for better layout
    const lines = doc.splitTextToSize(report.comments || "No comments", 180);
    doc.text(lines, 10, 90);

    doc.text(`Send Method: ${report.sendMethod}`, 10, 120);
    doc.text(`Admin Email: ${report.adminEmail || "N/A"}`, 10, 130);

    doc.save(`${report.reportTitle.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Reports Dashboard</h2>
      {reports.length === 0 ? (
        <p>No reports available.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Report Title</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Verified Count</th>
              <th>Rejected Count</th>
              <th>Officer ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.reportTitle}</td>
                <td>{report.fromDate}</td>
                <td>{report.toDate}</td>
                <td>{report.verifiedCount}</td>
                <td>{report.rejectedCount}</td>
                <td>{report.officer?.id || "N/A"}</td>
                <td>
                  <button onClick={() => generatePdf(report)}>View PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReportsPage;
