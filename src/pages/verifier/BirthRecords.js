import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BirthRecords.css';
import { FaEye, FaSpinner, FaSearch, FaSyncAlt, FaUpload } from 'react-icons/fa';

const BirthRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/birth-records');
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    return (
      record.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.childName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.motherName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewDetails = (id) => {
    navigate(`/verifier/birth-record/${id}`);
  };

  const handleRefresh = () => {
    fetchRecords();
  };

  return (
    <div className="birth-records-container">
      <div className="header-section">
        <h2 className="title">Birth Records Management</h2>
        
        <div className="search-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by Certificate #, Child Name, Parent Names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="action-buttons">
            <button className="upload-btn" onClick={() => navigate('/verifier/uploaded-certificates')}>
              <FaUpload /> VIEW UPLOADED CERTIFICATES
            </button>
            <button className="refresh-btn" onClick={handleRefresh}>
              <FaSyncAlt /> REFRESH
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading birth records...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchRecords}>Retry</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Certificate Number</th>
                <th>Child Name</th>
                <th>Date of Birth</th>
                <th>Father's Name</th>
                <th>Mother's Name</th>
                <th>Place of Birth</th>
                <th>Date of Issue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.certificateNumber || 'N/A'}</td>
                    <td>{record.childName || 'N/A'}</td>
                    <td>{record.dateOfBirth || 'N/A'}</td>
                    <td>{record.fatherName || 'N/A'}</td>
                    <td>{record.motherName || 'N/A'}</td>
                    <td>{record.placeOfBirth || 'N/A'}</td>
                    <td>{record.dateOfIssue || 'N/A'}</td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(record.id)}
                        className="view-btn"
                      >
                        <FaEye title="View Details" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-records">
                    No records found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BirthRecords;