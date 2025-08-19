

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/RegisterNewBorn.css';

const RegisterNewBorn = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    certificateNumber: '',
    childName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    fatherName: '',
    motherName: '',
    residentOfParents: '',
    informantName: '',
    dateOfIssue: ''
  });

  const [editingId, setEditingId] = useState(null);

  // Field labels for display
  const fieldLabels = {
    certificateNumber: 'Certificate Number',
    childName: 'Child Name',
    dateOfBirth: 'Date of Birth',
    placeOfBirth: 'Place of Birth',
    gender: 'Gender',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    residentOfParents: "Parents' Residence",
    informantName: "Informant's Name",
    dateOfIssue: 'Date of Issue'
  };

  // Fetch all birth records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/birth-records');
      setRecords(res.data);
    } catch (err) {
      alert('Failed to fetch records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/birth-records/${editingId}`, formData);
        alert('Record updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/birth-records', formData);
        alert('Record added successfully!');
      }
      resetForm();
      fetchRecords();
    } catch (err) {
      alert('Error saving record: ' + err.message);
    }
  };

  const handleEdit = record => {
    setFormData(record);
    setEditingId(record.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:8080/api/birth-records/${id}`);
        alert('Record deleted successfully!');
        fetchRecords();
      } catch (err) {
        alert('Error deleting record: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData());
    setEditingId(null);
  };

  const initialFormData = () => ({
    certificateNumber: '',
    childName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    fatherName: '',
    motherName: '',
    residentOfParents: '',
    informantName: '',
    dateOfIssue: ''
  });

  // Filter records based on search term
  const filteredRecords = records.filter(record => {
    return Object.values(record).some(value => {
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="register-container">
      <h2>{editingId ? 'Update Birth Record' : 'Register New Born'}</h2>
      
      <form className="birth-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {Object.keys(formData).map(key => (
            <div key={key} className="form-group">
              <label htmlFor={key}>{fieldLabels[key] || key}</label>
              {key === 'gender' ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <input
                  type={key.includes('date') ? 'date' : 'text'}
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  placeholder={`Enter ${fieldLabels[key] || key}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Record' : 'Register New Born'}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="records-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h3>Birth Records</h3>
        {loading ? (
          <p>Loading records...</p>
        ) : filteredRecords.length === 0 ? (
          <p>No records found</p>
        ) : (
          <div className="table-responsive">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Cert. No.</th>
                  <th>Child Name</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Father</th>
                  <th>Mother</th>
                  <th>Place of Birth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.certificateNumber || '-'}</td>
                    <td>{record.childName || '-'}</td>
                    <td>{record.dateOfBirth || '-'}</td>
                    <td>{record.gender || '-'}</td>
                    <td>{record.fatherName || '-'}</td>
                    <td>{record.motherName || '-'}</td>
                    <td>{record.placeOfBirth || '-'}</td>
                    <td className="actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(record)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(record.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterNewBorn;