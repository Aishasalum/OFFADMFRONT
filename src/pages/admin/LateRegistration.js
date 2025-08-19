import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,
  Select, InputLabel, FormControl, Chip, Box, Grid, IconButton,
  Snackbar, Alert, CircularProgress, Avatar, Tooltip, Badge
} from '@mui/material';
import {
  Delete, Edit, RestoreFromTrash, Visibility,
  Search, Clear, CheckCircle, Cancel, Close,
  Refresh, FilterAlt, FilterAltOff
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { deepPurple, green, red, orange, blue } from '@mui/material/colors';

// Custom styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f8f9fa',
  },
  '&:hover': {
    backgroundColor: '#e9ecef',
    cursor: 'pointer',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StatusBadge = styled(Chip)(({ status }) => ({
  backgroundColor: status === 'APPROVED' ? green[100] : 
                  status === 'REJECTED' ? red[100] : orange[100],
  color: status === 'APPROVED' ? green[800] : 
         status === 'REJECTED' ? red[800] : orange[800],
  fontWeight: 'bold',
  minWidth: 100,
}));

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error'
};

const CertificateApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletedFilter, setDeletedFilter] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, deletedFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/certificate-applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showSnackbar('Failed to fetch applications. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.nidNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    filtered = filtered.filter(app => app.deleted === deletedFilter);

    setFilteredApplications(filtered);
  };

  const handleView = (app) => {
    setCurrentApp(app);
    setOpenDialog(true);
  };

  const handleEdit = (id) => {
    navigate(`/edit-application/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await axios.put(`http://localhost:8080/api/certificate-applications/${id}/move-to-recycle`);
      showSnackbar('Application moved to recycle bin');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      showSnackbar('Failed to delete application. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setActionLoading(true);
      await axios.put(`http://localhost:8080/api/certificate-applications/${id}/restore`);
      showSnackbar('Application restored successfully');
      fetchApplications();
    } catch (error) {
      console.error('Error restoring application:', error);
      showSnackbar('Failed to restore application. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setActionLoading(true);
      
      if (status === 'REJECTED') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) {
          setActionLoading(false);
          return;
        }
        
        await axios.put(`http://localhost:8080/api/certificate-applications/${id}/reject`, null, {
          params: { reason }
        });
      } else {
        await axios.put(`http://localhost:8080/api/certificate-applications/${id}/approve`);
      }
      
      showSnackbar(`Application ${status.toLowerCase()} successfully`);
      fetchApplications();
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing application:`, error);
      showSnackbar(`Failed to ${status.toLowerCase()} application. Please try again.`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentApp(null);
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status && app.deleted === deletedFilter).length;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          backgroundColor: blue[50],
          borderRadius: 3
        }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold',
            color: deepPurple[800],
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Avatar sx={{ bgcolor: deepPurple[500] }}>
              <Edit />
            </Avatar>
            {deletedFilter ? 'Recycle Bin' : 'Certificate Applications Management'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title={deletedFilter ? "View active applications" : "View deleted applications"}>
              <Button
                variant="contained"
                color={deletedFilter ? 'primary' : 'secondary'}
                onClick={() => setDeletedFilter(!deletedFilter)}
                startIcon={deletedFilter ? <RestoreFromTrash /> : <Delete />}
                sx={{ borderRadius: 3 }}
              >
                {deletedFilter ? 'Active Applications' : 'Recycle Bin'}
              </Button>
            </Tooltip>
          </Box>
        </Box>


        {/* Filter Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: '#f8f9fa' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Applications"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: searchTerm && (
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <Clear />
                    </IconButton>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="ALL">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterAlt /> All Statuses
                    </Box>
                  </MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="info"
                onClick={fetchApplications}
                sx={{ 
                  height: '56px',
                  borderRadius: 3,
                  display: 'flex',
                  gap: 1
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : <Refresh />}
                Refresh Data
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Main Table */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300 
          }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: deepPurple[500] }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Applicant</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <StyledTableRow key={app.id} hover>
                      <TableCell>{app.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: deepPurple[300] }}>
                            {getInitials(app.fullName)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold">{app.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {app.nidNumber || 'No NIDA'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{app.phone}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {app.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          label={app.status} 
                          status={app.status}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {new Date(app.applicationDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(app.applicationDate).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              color="info"
                              onClick={() => handleView(app)}
                              disabled={actionLoading}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          {!app.deleted && (
                            <>
                              <Tooltip title="Edit Application">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEdit(app.id)}
                                  disabled={actionLoading}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Move to Recycle Bin">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(app.id)}
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? <CircularProgress size={24} /> : <Delete />}
                                </IconButton>
                              </Tooltip>
                              
                              {app.status === 'PENDING' && (
                                <>
                                  <Tooltip title="Approve Application">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleStatusChange(app.id, 'APPROVED')}
                                      disabled={actionLoading}
                                    >
                                      {actionLoading ? <CircularProgress size={24} /> : <CheckCircle />}
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Application">
                                    <IconButton
                                      color="warning"
                                      onClick={() => handleStatusChange(app.id, 'REJECTED')}
                                      disabled={actionLoading}
                                    >
                                      {actionLoading ? <CircularProgress size={24} /> : <Cancel />}
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </>
                          )}
                          
                          {app.deleted && (
                            <Tooltip title="Restore Application">
                              <IconButton
                                color="success"
                                onClick={() => handleRestore(app.id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? <CircularProgress size={24} /> : <RestoreFromTrash />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FilterAltOff sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No applications found matching your criteria
                        </Typography>
                        <Button 
                          variant="text" 
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                          }}
                          sx={{ mt: 2 }}
                        >
                          Clear all filters
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Application Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: deepPurple[500], 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ bgcolor: deepPurple[300] }}>
            {currentApp && getInitials(currentApp.fullName)}
          </Avatar>
          Application Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {currentApp && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: deepPurple[700],
                  borderBottom: `2px solid ${deepPurple[200]}`,
                  pb: 1,
                  mb: 2
                }}>
                  Applicant Information
                </Typography>
                <DetailItem label="Full Name" value={currentApp.fullName} />
                <DetailItem label="Date of Birth" value={currentApp.dateOfBirth} />
                <DetailItem label="Place of Birth" value={currentApp.placeOfBirth} />
                <DetailItem label="Gender" value={currentApp.gender} />
                <DetailItem label="Nationality" value={currentApp.nationality} />
                <DetailItem label="NIDA Number" value={currentApp.nidNumber || 'N/A'} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: deepPurple[700],
                  borderBottom: `2px solid ${deepPurple[200]}`,
                  pb: 1,
                  mb: 2
                }}>
                  Parents Information
                </Typography>
                <DetailItem label="Father's Name" value={currentApp.fatherName} />
                <DetailItem label="Father's Nationality" value={currentApp.fatherNationality} />
                <DetailItem label="Mother's Name" value={currentApp.motherName} />
                <DetailItem label="Mother's Nationality" value={currentApp.motherNationality} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: deepPurple[700],
                  borderBottom: `2px solid ${deepPurple[200]}`,
                  pb: 1,
                  mb: 2
                }}>
                  Contact Information
                </Typography>
                <DetailItem label="Phone" value={currentApp.phone} />
                <DetailItem label="Email" value={currentApp.email} />
                <DetailItem label="Address" value={currentApp.address} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: deepPurple[700],
                  borderBottom: `2px solid ${deepPurple[200]}`,
                  pb: 1,
                  mb: 2
                }}>
                  Application Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ minWidth: 100, fontWeight: 'bold' }}>Status:</Typography>
                  <StatusBadge 
                    label={currentApp.status} 
                    status={currentApp.status}
                  />
                </Box>
                <DetailItem 
                  label="Application Date" 
                  value={new Date(currentApp.applicationDate).toLocaleString()} 
                />
                <DetailItem label="Reason" value={currentApp.reason} />
                {currentApp.status === 'REJECTED' && currentApp.reason && (
                  <DetailItem 
                    label="Rejection Reason" 
                    value={currentApp.reason}
                    valueColor={red[700]}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
            sx={{ borderRadius: 3 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 3 }}
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Helper component for detail items
const DetailItem = ({ label, value, valueColor }) => (
  <Box sx={{ display: 'flex', mb: 1.5 }}>
    <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>{label}:</Typography>
    <Typography sx={{ color: valueColor || 'inherit' }}>{value || 'N/A'}</Typography>
  </Box>
);

export default CertificateApplicationsAdmin;