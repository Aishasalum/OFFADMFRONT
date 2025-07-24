import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiChevronLeft, 
  FiChevronRight, 
  FiDownload,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiDollarSign
} from 'react-icons/fi';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaRegClock,
  FaMoneyBillWave
} from 'react-icons/fa';
import { 
  MdOutlinePayment,
  MdOutlineVerifiedUser,
  MdOutlineAttachMoney
} from 'react-icons/md';
import '../../styles/Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all',
    dateRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_BASE_URL = 'http://localhost:8080/api/payments/active';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payment data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (payment.username?.toLowerCase().includes(searchTermLower) || false) ||
      (payment.certificateNumber?.toLowerCase().includes(searchTermLower) || false) ||
      (payment.controlNumber?.toLowerCase().includes(searchTermLower) || false);
    
    const matchesStatus = 
      filters.status === 'all' || 
      (payment.status?.toLowerCase() === filters.status.toLowerCase());
    
    const paymentMethod = payment.paymentMethod?.toString().toLowerCase() || '';
    const matchesMethod = 
      filters.method === 'all' || 
      paymentMethod === filters.method.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentItems = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'paid') return <FaCheckCircle className="text-emerald-500" />;
    if (statusLower === 'pending') return <FaRegClock className="text-amber-500" />;
    return <FaTimesCircle className="text-rose-500" />;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodClass = (method) => {
    if (!method) return '';
    return method.toLowerCase().replace(/\s+/g, '');
  };

  const calculateTotalRevenue = () => {
    return payments
      .filter(p => p.status?.toLowerCase() === 'paid')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };

  const handleExport = () => {
    alert('Export functionality will be implemented here');
  };

  return (
    <div className="payment-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Payment Verification</h1>
          <p className="dashboard-subtitle">Monitor and verify all payment transactions</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchPayments}>
            <FiRefreshCw className="icon" /> Refresh
          </button>
          <button className="btn-export" onClick={handleExport}>
            <FiDownload className="icon" /> Export
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, certificate #, or control #"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <FiFilter className="filter-icon" />
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({...filters, status: e.target.value});
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="filter-container">
          <FiCreditCard className="filter-icon" />
          <select
            value={filters.method}
            onChange={(e) => {
              setFilters({...filters, method: e.target.value});
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Methods</option>
            <option value="TigoPesa">Tigo Pesa</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="HaloPesa">Halo Pesa</option>
            <option value="AirtelMoney">Airtel Money</option>
            <option value="CRDB">CRDB</option>
            <option value="NMB">NMB</option>
          </select>
        </div>

        <div className="filter-container">
          <FiCalendar className="filter-icon" />
          <select
            value={filters.dateRange}
            onChange={(e) => {
              setFilters({...filters, dateRange: e.target.value});
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-transactions">
          <div className="stat-content">
            <div className="stat-icon">
              <MdOutlinePayment />
            </div>
            <div>
              <p className="stat-title">Total Transactions</p>
              <h3 className="stat-value">{payments.length}</h3>
            </div>
          </div>
        </div>

        <div className="stat-card paid-transactions">
          <div className="stat-content">
            <div className="stat-icon">
              <MdOutlineVerifiedUser />
            </div>
            <div>
              <p className="stat-title">Paid</p>
              <h3 className="stat-value">
                {payments.filter(p => p.status?.toLowerCase() === 'paid').length}
              </h3>
            </div>
          </div>
        </div>

        <div className="stat-card pending-transactions">
          <div className="stat-content">
            <div className="stat-icon">
              <FaRegClock />
            </div>
            <div>
              <p className="stat-title">Pending</p>
              <h3 className="stat-value">
                {payments.filter(p => p.status?.toLowerCase() === 'pending').length}
              </h3>
            </div>
          </div>
        </div>

        <div className="stat-card total-revenue">
          <div className="stat-content">
            <div className="stat-icon">
              <MdOutlineAttachMoney />
            </div>
            <div>
              <p className="stat-title">Total Revenue</p>
              <h3 className="stat-value">{formatAmount(calculateTotalRevenue())}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment data...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    <div className="table-header">
                      <FiUser className="header-icon" />
                      Applicant
                    </div>
                  </th>
                  <th>Certificate No</th>
                  <th>Control No</th>
                  <th>
                    <div className="table-header">
                      <FiDollarSign className="header-icon" />
                      Amount
                    </div>
                  </th>
                  <th>Method</th>
                  <th>Date/Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((payment, index) => (
                    <tr key={payment.id} className="table-row">
                      <td className="index-cell">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        <div className="user-cell">
                          <span className="username">{payment.username || 'Unknown'}</span>
                          {payment.email && <span className="email">{payment.email}</span>}
                        </div>
                      </td>
                      <td className="certificate-cell">{payment.certificateNumber || 'N/A'}</td>
                      <td className="control-cell">{payment.controlNumber || 'N/A'}</td>
                      <td className="amount-cell">{formatAmount(payment.amount)}</td>
                      <td>
                        {payment.paymentMethod ? (
                          <span className={`method-badge ${getPaymentMethodClass(payment.paymentMethod)}`}>
                            {payment.paymentMethod}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="date-cell">{formatDate(payment.paymentDate)}</td>
                      <td>
                        <div className={`status-badge ${payment.status?.toLowerCase()}`}>
                          {getStatusIcon(payment.status)}
                          <span>
                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1).toLowerCase() || 'Unknown'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">
                      No payment records found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPayments.length > itemsPerPage && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <FiChevronLeft /> Previous
              </button>
              
              <div className="page-indicator">
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Payments;