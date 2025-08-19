

//mpyaa

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  Grid, Card, CardContent, CircularProgress, Snackbar, Alert,
  IconButton, Tooltip, FormControl, InputLabel, Chip, Avatar,
  Badge, Collapse, List, ListItem, ListItemText, Switch, FormControlLabel,
  styled, Divider
} from '@mui/material';
import {
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon, 
  Search as SearchIcon, 
  CheckCircle as VerifiedIcon, 
  Cancel as RejectedIcon,
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon,
  DeleteForever as DeleteForeverIcon,
  RestoreFromTrash as RestoreIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
  MonetizationOn,
  MoneyOff,
  ReceiptLong,
  AccountBalanceWallet
} from '@mui/icons-material';
import { teal, deepPurple, green, red, blue, orange, pink, indigo, amber } from '@mui/material/colors';
import axios from 'axios';

// Custom styled components with consistent color scheme
const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'active' ? theme.palette.success.main : theme.palette.error.main,
    color: status === 'active' ? theme.palette.success.contrastText : theme.palette.error.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
  borderLeft: '4px solid',
}));

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
    search: '',
    showDeleted: false
  });
  const [expandedRequest, setExpandedRequest] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    matched: 0,
    notMatched: 0,
    pending: 0,
    deleted: 0
  });

  // Color scheme matching Payment Management
  const colorScheme = {
    primary: indigo[500],
    secondary: deepPurple[500],
    success: green[500],
    error: red[500],
    warning: orange[500],
    info: blue[500],
    paymentMethods: {
      TigoPesa: pink[500],
      HaloPesa: teal[500],
      AirtelMoney: indigo[500],
      CRDB: orange[500],
      NMB: deepPurple[500]
    }
  };

  // Fetch all requests based on showDeleted filter
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const endpoint = filters.showDeleted 
        ? 'http://localhost:8080/api/verification-requests/deleted'
        : 'http://localhost:8080/api/verification-requests/active';
      
      const response = await axios.get(endpoint);
      const processedData = response.data.map(request => ({
        ...request,
        matchStatus: request.matchResult === 'MATCHED' ? 'matched' : 
                     request.matchResult === 'NOT_MATCHED' ? 'notMatched' : 
                     request.matchResult === 'NOT_FOUND' ? 'notMatched' : 
                     request.matchStatus || 'notMatched'
      }));
      setRequests(processedData);
      applyFilters(processedData);
      calculateStats(processedData);
      
      if (!filters.showDeleted) {
        const deletedRes = await axios.get('http://localhost:8080/api/verification-requests/deleted');
        setStats(prev => ({ ...prev, deleted: deletedRes.data.length }));
      }
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
    const matched = data.filter(r => r.matchStatus === 'matched').length;
    const notMatched = data.filter(r => r.matchStatus === 'notMatched').length;
    const pending = data.filter(r => r.status === 'pending').length;

    setStats(prev => ({
      ...prev,
      total,
      matched,
      notMatched,
      pending
    }));
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
        (r.childName && r.childName.toLowerCase().includes(searchTerm)) ||
        (r.certificateNumber && r.certificateNumber.toLowerCase().includes(searchTerm)) ||
        (r.fatherName && r.fatherName.toLowerCase().includes(searchTerm)) ||
        (r.motherName && r.motherName.toLowerCase().includes(searchTerm))
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

  // Toggle show deleted requests
  const toggleShowDeleted = () => {
    setFilters(prev => ({
      ...prev,
      showDeleted: !prev.showDeleted
    }));
  };

  // Handle edit request
  const handleEdit = (request) => {
    setCurrentRequest(request);
    setOpenDialog(true);
  };

  // Handle soft delete (move to trash)
  const handleSoftDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/verification-requests/soft-delete/${id}`);
      setSnackbar({ open: true, message: 'Request moved to trash successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete request', severity: 'error' });
      console.error(err);
    }
  };

  // Handle hard delete (permanent)
  const handleHardDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/verification-requests/hard-delete/${id}`);
      setSnackbar({ open: true, message: 'Request permanently deleted', severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to permanently delete', severity: 'error' });
      console.error(err);
    }
  };

  // Handle restore request
  const handleRestore = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/verification-requests/restore/${id}`);
      setSnackbar({ open: true, message: 'Request restored successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to restore request', severity: 'error' });
      console.error(err);
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const { id, ...requestData } = currentRequest;
      await axios.put(`http://localhost:8080/api/verification-requests/${id}`, requestData);
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

  // Toggle expanded view for request details
  const toggleExpandRequest = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Initial fetch and when filters.showDeleted changes
  useEffect(() => {
    fetchRequests();
  }, [filters.showDeleted]);

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
      <Typography variant="h4" gutterBottom sx={{ 
        mb: 3, 
        fontWeight: 'bold', 
        color: colorScheme.primary,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <VerifiedUserIcon fontSize="large" />
        User Request Management
      </Typography>

      {/* Stats Cards - Matching Payment Management style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ borderColor: blue[500] }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="subtitle1" color="text.secondary">Total Requests</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
                </div>
                <ReceiptLong sx={{ fontSize: 48, color: blue[500], opacity: 0.3 }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ borderColor: green[500] }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="subtitle1" color="text.secondary">Matched</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: green[500] }}>{stats.matched}</Typography>
                </div>
                <VerifiedIcon sx={{ fontSize: 48, color: green[500], opacity: 0.3 }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ borderColor: red[500] }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="subtitle1" color="text.secondary">Not Matched</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: red[500] }}>{stats.notMatched}</Typography>
                </div>
                <RejectedIcon sx={{ fontSize: 48, color: red[500], opacity: 0.3 }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ borderColor: amber[500] }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="subtitle1" color="text.secondary">Deleted</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: amber[500] }}>{stats.deleted}</Typography>
                </div>
                <DeleteIcon sx={{ fontSize: 48, color: amber[500], opacity: 0.3 }} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Filters Card */}
      <Card sx={{ 
        mb: 3, 
        p: 3, 
        borderRadius: '12px', 
        boxShadow: 3,
        borderLeft: `4px solid ${colorScheme.secondary}`
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2, 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: colorScheme.primary
        }}>
          <FilterIcon /> Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search requests..."
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                sx: { borderRadius: '8px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Match Status</InputLabel>
              <Select
                name="matchStatus"
                value={filters.matchStatus}
                onChange={handleFilterChange}
                label="Match Status"
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="all">All Match Statuses</MenuItem>
                <MenuItem value="matched">Matched</MenuItem>
                <MenuItem value="notMatched">Not Matched</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showDeleted}
                    onChange={toggleShowDeleted}
                    color="warning"
                  />
                }
                label="Show Deleted"
                labelPlacement="start"
              />
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchRequests}
                sx={{ 
                  borderRadius: '8px',
                  bgcolor: colorScheme.primary,
                  '&:hover': { bgcolor: indigo[700] }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Requests Table */}
      <Card sx={{ 
        borderRadius: '12px', 
        boxShadow: 3,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
            {filters.showDeleted ? 'Deleted Requests' : 'Active Requests'}
            <Typography variant="body2" component="span" sx={{ ml: 2, color: 'text.secondary' }}>
              ({filteredRequests.length} of {requests.length} requests)
            </Typography>
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            sx={{ 
              borderRadius: '8px',
              borderColor: colorScheme.primary,
              color: colorScheme.primary,
              '&:hover': {
                borderColor: indigo[700],
                color: indigo[700]
              }
            }}
          >
            Export
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                bgcolor: 'background.paper',
                '& th': { 
                  fontWeight: 'bold',
                  color: 'text.primary',
                  py: 2
                }
              }}>
                <TableCell>Certificate #</TableCell>
                <TableCell>Child Details</TableCell>
                <TableCell>Parents</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Match Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell width="50px" />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <TableRow 
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        opacity: request.deleted ? 0.7 : 1,
                        bgcolor: request.deleted ? 'rgba(255, 152, 0, 0.05)' : 'inherit'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ 
                            bgcolor: request.matchStatus === 'matched' ? green[100] : red[100],
                            color: request.matchStatus === 'matched' ? green[600] : red[600],
                            width: 32, 
                            height: 32
                          }}>
                            {request.certificateNumber?.charAt(0) || '?'}
                          </Avatar>
                          {request.certificateNumber || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {request.childName || 'N/A'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <DateIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(request.dateOfBirth)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Father</Typography>
                            <Typography variant="body2">{request.fatherName || 'N/A'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Mother</Typography>
                            <Typography variant="body2">{request.motherName || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          color={
                            request.status === 'verified' ? 'success' : 
                            request.status === 'rejected' ? 'error' : 'warning'
                          }
                          size="small"
                          sx={{ 
                            fontWeight: 'medium',
                            minWidth: 80,
                            justifyContent: 'center'
                          }}
                          icon={
                            request.status === 'verified' ? <VerifiedIcon fontSize="small" /> :
                            request.status === 'rejected' ? <RejectedIcon fontSize="small" /> : 
                            <InfoIcon fontSize="small" />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.matchStatus === 'matched' ? 'Matched' : 'Not Matched'}
                          color={request.matchStatus === 'matched' ? 'success' : 'error'}
                          size="small"
                          sx={{ 
                            fontWeight: 'medium',
                            minWidth: 100,
                            justifyContent: 'center'
                          }}
                          icon={
                            request.matchStatus === 'matched' ? <VerifiedIcon fontSize="small" /> :
                            <WarningIcon fontSize="small" />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {!request.deleted ? (
                            <>
                              <Tooltip title="Edit">
                                <IconButton 
                                  color="primary" 
                                  onClick={() => handleEdit(request)}
                                  sx={{ 
                                    bgcolor: blue[50],
                                    '&:hover': { bgcolor: blue[100] }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Move to Trash">
                                <IconButton 
                                  color="warning" 
                                  onClick={() => handleSoftDelete(request.id)}
                                  sx={{ 
                                    bgcolor: orange[50],
                                    '&:hover': { bgcolor: orange[100] }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Restore">
                                <IconButton 
                                  color="success" 
                                  onClick={() => handleRestore(request.id)}
                                  sx={{ 
                                    bgcolor: green[50],
                                    '&:hover': { bgcolor: green[100] }
                                  }}
                                >
                                  <RestoreIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Permanently Delete">
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleHardDelete(request.id)}
                                  sx={{ 
                                    bgcolor: red[50],
                                    '&:hover': { bgcolor: red[100] }
                                  }}
                                >
                                  <DeleteForeverIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpandRequest(request.id)}
                          sx={{ 
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          {expandedRequest === request.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} style={{ padding: 0 }}>
                        <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
                          <Box sx={{ 
                            p: 3, 
                            backgroundColor: 'background.default', 
                            borderTop: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'bold', 
                                  mb: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: colorScheme.primary
                                }}>
                                  <PersonIcon /> Child Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                                    <Typography variant="body1">{request.childName || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                                    <Typography variant="body1">{formatDate(request.dateOfBirth)}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Gender</Typography>
                                    <Typography variant="body1">{request.gender || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Place of Birth</Typography>
                                    <Typography variant="body1">{request.placeOfBirth || 'N/A'}</Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'bold', 
                                  mb: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: colorScheme.primary
                                }}>
                                  <VerifiedUserIcon /> Verification Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Requested By</Typography>
                                    <Typography variant="body1">{request.user?.username || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Request Date</Typography>
                                    <Typography variant="body1">{formatDate(request.createdAt)}</Typography>
                                  </Grid>
                                  {request.matchStatus === 'notMatched' && request.mismatchDetails && (
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary">Mismatch Reasons</Typography>
                                      <Typography variant="body1" color="error.main">
                                        {request.mismatchDetails}
                                      </Typography>
                                    </Grid>
                                  )}
                                  {request.deleted && (
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary">Deleted At</Typography>
                                      <Typography variant="body1" color="error.main">
                                        {formatDate(request.deletedAt)}
                                      </Typography>
                                    </Grid>
                                  )}
                                </Grid>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: 'text.secondary',
                      gap: 2
                    }}>
                      <SearchIcon sx={{ fontSize: 48 }} />
                      <Typography variant="h6">
                        No requests found
                      </Typography>
                      <Typography variant="body2">
                        Try adjusting your search or filters
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />}
                        onClick={fetchRequests}
                        sx={{ mt: 2 }}
                      >
                        Refresh Data
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: colorScheme.primary, 
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EditIcon /> Edit Request
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {currentRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Certificate Number"
                  name="certificateNumber"
                  value={currentRequest.certificateNumber || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <VerifiedUserIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Child Name"
                  name="childName"
                  value={currentRequest.childName || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={currentRequest.dateOfBirth || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Place of Birth"
                  name="placeOfBirth"
                  value={currentRequest.placeOfBirth || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  name="fatherName"
                  value={currentRequest.fatherName || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mother's Name"
                  name="motherName"
                  value={currentRequest.motherName || ''}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={currentRequest.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{ 
              borderRadius: '8px',
              px: 3,
              bgcolor: colorScheme.primary,
              '&:hover': {
                bgcolor: indigo[700]
              }
            }}
          >
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
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            boxShadow: 3,
            alignItems: 'center'
          }}
          iconMapping={{
            success: <VerifiedIcon fontSize="large" />,
            error: <RejectedIcon fontSize="large" />,
            warning: <WarningIcon fontSize="large" />,
            info: <InfoIcon fontSize="large" />
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRequests;