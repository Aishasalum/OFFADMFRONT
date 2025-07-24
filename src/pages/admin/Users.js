import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'USER',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch users based on status filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let endpoint = 'http://localhost:8080/api/users/';
        if (statusFilter === 'active') {
          endpoint += 'active';
        } else if (statusFilter === 'deleted') {
          endpoint += 'deleted';
        } else {
          endpoint += 'all';
        }
        
        const response = await axios.get(endpoint);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [statusFilter]);

  // Filter and pagination logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber || '').includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Pagination functions
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Modal handlers
  const openAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'USER',
      password: ''
    });
    setModalMode('add');
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (user) => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'USER',
      password: ''
    });
    setSelectedUserId(user.id);
    setModalMode('edit');
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };

  const openDeleteConfirm = (userId) => {
    setSelectedUserId(userId);
    setShowConfirmModal(true);
    setError(null);
    setSuccess(null);
  };

  const openRestoreConfirm = (userId) => {
    setSelectedUserId(userId);
    setShowRestoreModal(true);
    setError(null);
    setSuccess(null);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (modalMode === 'add') {
        const response = await axios.post('http://localhost:8080/api/users/register', formData);
        setUsers(prev => [...prev, response.data]);
        setSuccess('User added successfully');
      } else {
        const response = await axios.put(`http://localhost:8080/api/users/${selectedUserId}`, formData);
        setUsers(prev => prev.map(user => user.id === selectedUserId ? response.data : user));
        setSuccess('User updated successfully');
      }
      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${selectedUserId}`);
      setUsers(prev => prev.filter(user => user.id !== selectedUserId));
      setSuccess('User moved to trash');
      setTimeout(() => {
        setShowConfirmModal(false);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to delete user');
    }
  };

  const handleRestore = async () => {
    try {
      await axios.put(`http://localhost:8080/api/users/restore/${selectedUserId}`);
      setUsers(prev => prev.filter(user => user.id !== selectedUserId));
      setSuccess('User restored successfully');
      setTimeout(() => {
        setShowRestoreModal(false);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to restore user');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/users/permanent-delete/${selectedUserId}`);
      setUsers(prev => prev.filter(user => user.id !== selectedUserId));
      setSuccess('User permanently deleted');
      setTimeout(() => {
        setShowConfirmModal(false);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to permanently delete user');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: '#2c3e50',
          fontSize: '28px',
          fontWeight: '600',
          margin: '0'
        }}>User Management</h1>
        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
        >
          <span style={{ marginRight: '8px' }}>+</span> Add User
        </button>
      </div>

      {/* Status, Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          position: 'relative', 
          flex: '1', 
          minWidth: '250px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d'
          }}>🔍</div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 15px 12px 35px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              backgroundColor: '#f8f9fa'
            }}
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '12px 15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px',
            backgroundColor: '#f8f9fa',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        >
          <option value="all">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px',
            backgroundColor: '#f8f9fa',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        >
          <option value="active">Active Users</option>
          <option value="deleted">Trash</option>
          <option value="all">All Users</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0'
              }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                }}>Name</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                }}>Email</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                }}>Phone</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                }}>Role</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                }}>Status</th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map(user => (
                  <tr key={user.id} style={{
                    borderBottom: '1px solid #eee',
                    transition: 'all 0.2s ease'
                  }} 
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }} 
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#2c3e50',
                      fontWeight: '500'
                    }}>{user.fullName || '-'}</td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#2c3e50'
                    }}>{user.email || '-'}</td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#2c3e50'
                    }}>{user.phoneNumber || '-'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: user.role === 'ADMIN' ? '#e3f2fd' : '#e8f5e9',
                        color: user.role === 'ADMIN' ? '#1976d2' : '#2e7d32',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: user.deleted ? '#ffebee' : '#e8f5e9',
                        color: user.deleted ? '#c62828' : '#2e7d32',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        {user.deleted ? 'Deleted' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {!user.deleted && (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#3498db',
                                cursor: 'pointer',
                                fontSize: '16px',
                                transition: 'all 0.2s ease',
                                padding: '6px',
                                borderRadius: '4px'
                              }}
                              onMouseOver={(e) => {
                                e.target.color = '#2980b9';
                                e.target.backgroundColor = '#ebf5fb';
                              }}
                              onMouseOut={(e) => {
                                e.target.color = '#3498db';
                                e.target.backgroundColor = 'transparent';
                              }}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(user.id)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#e74c3c',
                                cursor: 'pointer',
                                fontSize: '16px',
                                transition: 'all 0.2s ease',
                                padding: '6px',
                                borderRadius: '4px'
                              }}
                              onMouseOver={(e) => {
                                e.target.color = '#c0392b';
                                e.target.backgroundColor = '#fdedec';
                              }}
                              onMouseOut={(e) => {
                                e.target.color = '#e74c3c';
                                e.target.backgroundColor = 'transparent';
                              }}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        {user.deleted && (
                          <>
                            <button
                              onClick={() => openRestoreConfirm(user.id)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#2ecc71',
                                cursor: 'pointer',
                                fontSize: '16px',
                                transition: 'all 0.2s ease',
                                padding: '6px',
                                borderRadius: '4px'
                              }}
                              onMouseOver={(e) => {
                                e.target.color = '#27ae60';
                                e.target.backgroundColor = '#e8f8f5';
                              }}
                              onMouseOut={(e) => {
                                e.target.color = '#2ecc71';
                                e.target.backgroundColor = 'transparent';
                              }}
                              title="Restore"
                            >
                              ♻️
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setShowConfirmModal(true);
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#e74c3c',
                                cursor: 'pointer',
                                fontSize: '16px',
                                transition: 'all 0.2s ease',
                                padding: '6px',
                                borderRadius: '4px'
                              }}
                              onMouseOver={(e) => {
                                e.target.color = '#c0392b';
                                e.target.backgroundColor = '#fdedec';
                              }}
                              onMouseOut={(e) => {
                                e.target.color = '#e74c3c';
                                e.target.backgroundColor = 'transparent';
                              }}
                              title="Permanently Delete"
                            >
                              ⚠️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#7f8c8d',
                    fontSize: '14px'
                  }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#7f8c8d',
        fontSize: '14px'
      }}>
        <div style={{ fontWeight: '500' }}>
          Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          backgroundColor: '#f8f9fa',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? '#bdc3c7' : '#3498db',
              fontSize: '16px',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (currentPage !== 1) {
                e.target.backgroundColor = '#ebf5fb';
              }
            }}
            onMouseOut={(e) => {
              e.target.backgroundColor = 'transparent';
            }}
          >
            ◀
          </button>
          <span style={{ 
            padding: '0 10px',
            fontWeight: '500'
          }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
              color: (currentPage === totalPages || totalPages === 0) ? '#bdc3c7' : '#3498db',
              fontSize: '16px',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (currentPage !== totalPages && totalPages !== 0) {
                e.target.backgroundColor = '#ebf5fb';
              }
            }}
            onMouseOut={(e) => {
              e.target.backgroundColor = 'transparent';
            }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '1000',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #eee',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{
                margin: '0',
                fontSize: '20px',
                color: '#2c3e50',
                fontWeight: '600'
              }}>
                {modalMode === 'add' ? 'Add New User' : 'Edit User'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#7f8c8d',
                  transition: 'color 0.2s ease',
                  padding: '4px'
                }}
                onMouseOver={(e) => e.target.color = '#e74c3c'}
                onMouseOut={(e) => e.target.color = '#7f8c8d'}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '25px' }}>
              {error && (
                <div style={{
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    Password {modalMode === 'edit' && '(leave empty to keep current)'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalMode === 'add'}
                      minLength={modalMode === 'add' ? 6 : undefined}
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        backgroundColor: '#f8f9fa',
                        paddingRight: '40px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#7f8c8d',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.color = '#3498db';
                        e.target.backgroundColor = '#ebf5fb';
                      }}
                      onMouseOut={(e) => {
                        e.target.color = '#7f8c8d';
                        e.target.backgroundColor = 'transparent';
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '15px',
                  marginTop: '30px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '12px 20px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.target.backgroundColor = '#f8f9fa';
                      e.target.borderColor = '#bdc3c7';
                    }}
                    onMouseOut={(e) => {
                      e.target.backgroundColor = 'white';
                      e.target.borderColor = '#e0e0e0';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => e.target.backgroundColor = '#2980b9'}
                    onMouseOut={(e) => e.target.backgroundColor = '#3498db'}
                  >
                    {modalMode === 'add' ? 'Add User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '1000'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '400px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #eee',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{
                margin: '0',
                fontSize: '18px',
                color: '#2c3e50',
                fontWeight: '600'
              }}>Confirm Action</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#7f8c8d',
                  transition: 'color 0.2s ease',
                  padding: '4px'
                }}
                onMouseOver={(e) => e.target.color = '#e74c3c'}
                onMouseOut={(e) => e.target.color = '#7f8c8d'}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '25px' }}>
              {error && (
                <div style={{
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {success}
                </div>
              )}
              <p style={{
                marginBottom: '25px',
                color: '#2c3e50',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {statusFilter === 'deleted' 
                  ? 'Are you sure you want to permanently delete this user? This action cannot be undone.' 
                  : 'Are you sure you want to move this user to trash?'}
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '15px'
              }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    padding: '10px 18px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#2c3e50',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.target.backgroundColor = '#f8f9fa';
                    e.target.borderColor = '#bdc3c7';
                  }}
                  onMouseOut={(e) => {
                    e.target.backgroundColor = 'white';
                    e.target.borderColor = '#e0e0e0';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={statusFilter === 'deleted' ? handlePermanentDelete : handleDelete}
                  style={{
                    padding: '10px 18px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight:'500' ,
                  transition: 'all 0.3s ease',
                 boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
               onMouseOver={(e) => e.target.backgroundColor = '#c0392b'}
              onMouseOut={(e) => e.target.backgroundColor = '#e74c3c'}
           >
              Delete
              </button>
             </div>
            </div>
           </div>
         </div>
       )}
     </div>
   );
 };

 export default Users;


