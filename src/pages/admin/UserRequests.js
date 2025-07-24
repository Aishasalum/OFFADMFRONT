import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  Grid, Card, CardContent, CircularProgress, Snackbar, Alert,
  IconButton, Tooltip, FormControl, InputLabel
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, FilterAlt as FilterIcon,
  CheckCircle as VerifiedIcon, Cancel as RejectedIcon,
  PendingActions as PendingIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    status: 'all',
    matchStatus: 'all',
    search: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    matched: 0,
    notMatched: 0
  });

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/verification-requests/all');
      setRequests(response.data);
      applyFilters(response.data);
      calculateStats(response.data);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(r => r.status === 'pending').length;
    const verified = data.filter(r => r.status === 'verified').length;
    const rejected = data.filter(r => r.status === 'rejected').length;
    const matched = data.filter(r => r.matchStatus === 'matched').length;
    const notMatched = data.filter(r => r.matchStatus === 'notMatched').length;

    setStats({
      total,
      pending,
      verified,
      rejected,
      matched,
      notMatched
    });
  };

  // Apply filters
  const applyFilters = (data) => {
    let result = [...data];

    if (filters.status !== 'all') {
      result = result.filter(r => r.status === filters.status);
    }

    if (filters.matchStatus !== 'all') {
      result = result.filter(r => r.matchStatus === filters.matchStatus);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(r =>
        r.childName.toLowerCase().includes(searchTerm) ||
        r.certificateNumber.toLowerCase().includes(searchTerm) ||
        r.fatherName.toLowerCase().includes(searchTerm) ||
        r.motherName.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredRequests(result);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit request
  const handleEdit = (request) => {
    setCurrentRequest(request);
    setOpenDialog(true);
  };

  // Handle delete request
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/verification-requests/${id}`);
      setSnackbar({ open: true, message: 'Request deleted successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete request', severity: 'error' });
      console.error(err);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:8080/api/verification-requests/${id}/status`, { status: newStatus });
      setSnackbar({ open: true, message: `Request marked as ${newStatus}`, severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
      console.error(err);
    }
  };

  // Handle match status change
  const handleMatchStatusChange = async (id, newMatchStatus) => {
    try {
      await axios.patch(`http://localhost:8080/api/verification-requests/${id}/match-status`, { matchStatus: newMatchStatus });
      setSnackbar({ open: true, message: `Match status updated to ${newMatchStatus}`, severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update match status', severity: 'error' });
      console.error(err);
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      await axios.put(`http://localhost:8080/api/verification-requests/${currentRequest.id}`, currentRequest);
      setSnackbar({ open: true, message: 'Request updated successfully', severity: 'success' });
      setOpenDialog(false);
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update request', severity: 'error' });
      console.error(err);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, []);

  // Apply filters when filters or requests change
  useEffect(() => {
    applyFilters(requests);
  }, [filters, requests]);

  if (loading && requests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        User Request Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Requests</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h4">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Verified</Typography>
              <Typography variant="h4">{stats.verified}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Rejected</Typography>
              <Typography variant="h4">{stats.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Matched</Typography>
              <Typography variant="h4">{stats.matched}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Not Matched</Typography>
              <Typography variant="h4">{stats.notMatched}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1 }} /> Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Match Status</InputLabel>
              <Select
                name="matchStatus"
                value={filters.matchStatus}
                onChange={handleFilterChange}
                label="Match Status"
              >
                <MenuItem value="all">All Match Statuses</MenuItem>
                <MenuItem value="matched">Matched</MenuItem>
                <MenuItem value="notMatched">Not Matched</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or certificate number..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setFilters({ status: 'all', matchStatus: 'all', search: '' })}
              sx={{ height: '56px' }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Requests Table */}
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Certificate #</TableCell>
                <TableCell sx={{ color: 'white' }}>Child Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Parents</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Match Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.certificateNumber}</TableCell>
                    <TableCell>{request.childName}</TableCell>
                    <TableCell>
                      {request.fatherName} & {request.motherName}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {request.status === 'verified' && (
                          <VerifiedIcon color="success" sx={{ mr: 1 }} />
                        )}
                        {request.status === 'rejected' && (
                          <RejectedIcon color="error" sx={{ mr: 1 }} />
                        )}
                        {request.status === 'pending' && (
                          <PendingIcon color="warning" sx={{ mr: 1 }} />
                        )}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {request.matchStatus === 'matched' ? (
                        <Box display="flex" alignItems="center" color="success.main">
                          <VerifiedIcon sx={{ mr: 1 }} />
                          Matched
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center" color="error.main">
                          <RejectedIcon sx={{ mr: 1 }} />
                          Not Matched
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => handleEdit(request)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(request.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        {request.status !== 'verified' && (
                          <Tooltip title="Mark as Verified">
                            <IconButton
                              color="success"
                              onClick={() => handleStatusChange(request.id, 'verified')}
                            >
                              <VerifiedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {request.status !== 'rejected' && (
                          <Tooltip title="Mark as Rejected">
                            <IconButton
                              color="error"
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                            >
                              <RejectedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {request.matchStatus !== 'matched' && (
                          <Tooltip title="Mark as Matched">
                            <IconButton
                              color="success"
                              onClick={() => handleMatchStatusChange(request.id, 'matched')}
                            >
                              <VerifiedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {request.matchStatus !== 'notMatched' && (
                          <Tooltip title="Mark as Not Matched">
                            <IconButton
                              color="error"
                              onClick={() => handleMatchStatusChange(request.id, 'notMatched')}
                            >
                              <RejectedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No requests found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Request</DialogTitle>
        <DialogContent dividers>
          {currentRequest && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Certificate Number"
                  name="certificateNumber"
                  value={currentRequest.certificateNumber}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Child Name"
                  name="childName"
                  value={currentRequest.childName}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={currentRequest.dateOfBirth}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Place of Birth"
                  name="placeOfBirth"
                  value={currentRequest.placeOfBirth}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  name="fatherName"
                  value={currentRequest.fatherName}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mother's Name"
                  name="motherName"
                  value={currentRequest.motherName}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Resident of Parents"
                  name="residentOfParents"
                  value={currentRequest.residentOfParents}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Informant Name"
                  name="informantName"
                  value={currentRequest.informantName}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Issue"
                  name="dateOfIssue"
                  value={currentRequest.dateOfIssue}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={currentRequest.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRequests;