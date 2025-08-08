import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiUserPlus, FiX, FiCheck, FiUser, FiMail, FiLock, FiPhone, FiUsers, FiSearch } from 'react-icons/fi';
import '../../styles/VerifierOfficer.css';

function VerifierOfficerPage() {
  const [officers, setOfficers] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    gender: 'male',
    role: 'verifier_officer',
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/verifier-officer/all');
      setOfficers(res.data || []); // Ensure we always have an array
    } catch (err) {
      console.error('Failed to fetch officers', err);
      setError('Failed to fetch officers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const endpoint = editingId 
        ? `http://localhost:8080/api/verifier-officer/update/${editingId}`
        : 'http://localhost:8080/api/verifier-officer/add';
      
      const method = editingId ? 'put' : 'post';
      
      await axios[method](endpoint, form);
      setSuccess(`Officer ${editingId ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchOfficers();
    } catch (err) {
      console.error('Failed to save officer', err);
      setError(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} officer. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      email: '',
      username: '',
      password: '',
      phone: '',
      gender: 'male',
      role: 'verifier_officer',
      active: true,
    });
    setEditingId(null);
  };

  const handleEdit = officer => {
    setForm({
      fullName: officer.fullName || '',
      email: officer.email || '',
      username: officer.username || '',
      password: '',
      phone: officer.phone || '',
      gender: officer.gender || 'male',
      role: officer.role || 'verifier_officer',
      active: officer.active !== undefined ? officer.active : true,
    });
    setEditingId(officer.id);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this verifier officer?')) {
      setIsLoading(true);
      try {
        await axios.delete(`http://localhost:8080/api/verifier-officer/delete/${id}`);
        setSuccess('Officer deleted successfully!');
        fetchOfficers();
      } catch (err) {
        console.error('Failed to delete officer', err);
        setError('Failed to delete verifier officer.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredOfficers = officers.filter(officer => {
    const search = searchTerm.toLowerCase();
    const name = officer.fullName?.toLowerCase() || '';
    const email = officer.email?.toLowerCase() || '';
    const username = officer.username?.toLowerCase() || '';
    
    return (
      name.includes(search) ||
      email.includes(search) ||
      username.includes(search)
    );
  });

  return (
    <div className="verifier-dashboard-container">
      <div className="verifier-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <FiUsers className="header-icon" />
            Verifier Officer Management
          </h1>
          <p className="dashboard-subtitle">
            {editingId ? 'Update existing officer details' : 'Register and manage verifier officers'}
          </p>
        </div>
      </div>

      <div className="verifier-content-wrapper">
        <div className="verifier-main-content">
          {/* Form Section */}
          <div className="verifier-form-card">
            <div className="form-card-header">
              <h2>
                {editingId ? (
                  <>
                    <FiEdit2 className="form-icon" />
                    Update Officer
                  </>
                ) : (
                  <>
                    <FiUserPlus className="form-icon" />
                    New Officer Registration
                  </>
                )}
              </h2>
            </div>

            <div className="form-card-body">
              {error && (
                <div className="alert-message error">
                  <FiX className="alert-icon" />
                  {error}
                </div>
              )}
              {success && (
                <div className="alert-message success">
                  <FiCheck className="alert-icon" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FiUser className="input-icon" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter full name"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiMail className="input-icon" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiUser className="input-icon" />
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiLock className="input-icon" />
                      Password {editingId && '(leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder={editingId ? "Enter new password" : "Create password"}
                      value={form.password}
                      onChange={handleChange}
                      {...(!editingId && { required: true })}
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiPhone className="input-icon" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter phone number"
                      value={form.phone}
                      onChange={handleChange}
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <div className="select-wrapper">
                      <select 
                        name="gender" 
                        value={form.gender} 
                        onChange={handleChange}
                        className="modern-select"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <div className="select-wrapper">
                      <select 
                        name="role" 
                        value={form.role} 
                        onChange={handleChange}
                        className="modern-select"
                      >
                        <option value="verifier_officer">Verifier Officer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group checkbox-container">
                    <label className="modern-checkbox">
                      <input
                        type="checkbox"
                        name="active"
                        checked={form.active}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      Active Status
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="primary-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="button-loader"></span>
                    ) : editingId ? (
                      'Update Officer'
                    ) : (
                      'Register Officer'
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="officer-list-card">
            <div className="list-card-header">
              <h2>Officers List</h2>
              <div className="list-controls">
                <div className="search-box">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search officers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-input search-input"
                  />
                </div>
                <div className="total-badge">
                  {filteredOfficers.length} {filteredOfficers.length === 1 ? 'officer' : 'officers'} found
                </div>
              </div>
            </div>

            <div className="list-card-body">
              {isLoading && officers.length === 0 ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading officers...</p>
                </div>
              ) : filteredOfficers.length > 0 ? (
                <div className="responsive-table">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Officer Details</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOfficers.map((officer, i) => (
                        <tr key={officer.id} className={!officer.active ? 'inactive-row' : ''}>
                          <td>{i + 1}</td>
                          <td>
                            <div className="officer-details">
                              <div className="officer-name">{officer.fullName || 'N/A'}</div>
                              <div className="officer-meta">
                                <span className="meta-item">
                                  <FiUser className="meta-icon" />
                                  {officer.username || 'N/A'}
                                </span>
                                <span className="meta-item role-badge">
                                  {officer.role === 'admin' ? 'Admin' : 'Verifier'}
                                </span>
                                <span className="meta-item gender-tag">
                                  {officer.gender || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div className="contact-email">
                                <FiMail className="contact-icon" />
                                {officer.email || 'N/A'}
                              </div>
                              {officer.phone && (
                                <div className="contact-phone">
                                  <FiPhone className="contact-icon" />
                                  {officer.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className={`status-pill ${officer.active ? 'active' : 'inactive'}`}>
                              {officer.active ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleEdit(officer)}
                                className="icon-button edit-button"
                                title="Edit"
                                disabled={isLoading}
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                onClick={() => handleDelete(officer.id)}
                                className="icon-button delete-button"
                                title="Delete"
                                disabled={isLoading}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <FiUsers className="empty-icon" />
                  <p>No verifier officers found</p>
                  {searchTerm && (
                    <button 
                      className="text-button"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifierOfficerPage;