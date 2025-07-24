// import React, { useState, useEffect } from 'react';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
//   TextField, Button, Select, MenuItem, FormControl, InputLabel,
//   Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
//   Chip, Typography, Box, Grid, CircularProgress, TablePagination,
//   DialogContentText, Snackbar, Alert, Avatar, Badge, Tooltip,
//   Collapse
// } from '@mui/material';
// import {
//   Search, FilterList, CheckCircle, Cancel, Refresh,
//   Verified, Dangerous, Mail, Sms, ArrowUpward, ArrowDownward,
//   Person, Description, Visibility, ExpandMore, ExpandLess
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// const API_BASE_URL = 'http://localhost:8080/api/verification-requests';

// const statusColors = {
//   PENDING: 'default',
//   VERIFIED: 'success',
//   REJECTED: 'error'
// };

// const matchColors = {
//   MATCHED: 'success',
//   NOT_MATCHED: 'error',
//   PENDING: 'warning'
// };

// const VerificationManagement = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [matchFilter, setMatchFilter] = useState('ALL');
//   const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [actionDialogOpen, setActionDialogOpen] = useState(false);
//   const [currentRequest, setCurrentRequest] = useState(null);
//   const [actionType, setActionType] = useState(null);
//   const [notificationMethod, setNotificationMethod] = useState('EMAIL');
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });
//   const [expandedRequest, setExpandedRequest] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   useEffect(() => {
//     filterAndSortRequests();
//   }, [requests, searchTerm, statusFilter, matchFilter, sortConfig]);

//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(API_BASE_URL + '/all');
//       if (!response.ok) throw new Error('Failed to fetch requests');
//       const data = await response.json();
//       setRequests(data);
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//       showSnackbar('Failed to fetch requests', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterAndSortRequests = () => {
//     let result = [...requests];

//     // Apply search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(request => 
//         (request.certificateNumber && request.certificateNumber.toLowerCase().includes(term)) ||
//         (request.childName && request.childName.toLowerCase().includes(term)) ||
//         (request.user && request.user.username && request.user.username.toLowerCase().includes(term)) ||
//         (request.fatherName && request.fatherName.toLowerCase().includes(term)) ||
//         (request.motherName && request.motherName.toLowerCase().includes(term)) ||
//         (request.informantName && request.informantName.toLowerCase().includes(term))
//       );
//     }

//     // Apply status filter
//     if (statusFilter !== 'ALL') {
//       result = result.filter(request => request.status === statusFilter);
//     }

//     // Apply match filter
//     if (matchFilter !== 'ALL') {
//       result = result.filter(request => request.matchResult === matchFilter);
//     }

//     // Apply sorting
//     if (sortConfig.key) {
//       result.sort((a, b) => {
//         const aValue = getNestedValue(a, sortConfig.key);
//         const bValue = getNestedValue(b, sortConfig.key);
        
//         if (!aValue && !bValue) return 0;
//         if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        
//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     setFilteredRequests(result);
//     setPage(0);
//   };

//   const getNestedValue = (obj, path) => {
//     return path.split('.').reduce((o, p) => o?.[p], obj);
//   };

//   const handleSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleStatusFilterChange = (e) => {
//     setStatusFilter(e.target.value);
//   };

//   const handleMatchFilterChange = (e) => {
//     setMatchFilter(e.target.value);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleActionClick = (request, type) => {
//     setCurrentRequest(request);
//     setActionType(type);
//     setActionDialogOpen(true);
//   };

//   const handleActionConfirm = async () => {
//     if (!currentRequest) return;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/${currentRequest.id}/status`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status: actionType,
//           notifyVia: notificationMethod,
//           notes: ''
//         }),
//       });

//       if (!response.ok) throw new Error(await response.text());

//       fetchRequests();
//       showSnackbar(`Request ${actionType.toLowerCase()} successfully!`, 'success');
//     } catch (error) {
//       console.error('Error updating request:', error);
//       showSnackbar(`Failed to ${actionType.toLowerCase()} request`, 'error');
//     } finally {
//       setActionDialogOpen(false);
//     }
//   };

//   const handleActionCancel = () => {
//     setActionDialogOpen(false);
//     setCurrentRequest(null);
//     setActionType(null);
//   };

//   const handleViewBirthRecord = (recordId) => {
//     navigate(`/birth-records/${recordId}`);
//   };

//   const toggleExpandRequest = (requestId) => {
//     setExpandedRequest(expandedRequest === requestId ? null : requestId);
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString();
//     } catch {
//       return dateString;
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom sx={{ 
//         fontWeight: 'bold', 
//         mb: 3, 
//         color: 'primary.main',
//         display: 'flex',
//         alignItems: 'center',
//         gap: 2
//       }}>
//         <Verified fontSize="large" />
//         Verification Requests Management
//       </Typography>

//       <Grid container spacing={2} sx={{ mb: 3 }}>
//         <Grid item xs={12} md={5}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search by Certificate #, Child Name, Parent Names or User"
//             value={searchTerm}
//             onChange={handleSearch}
//             InputProps={{
//               startAdornment: <Search sx={{ mr: 1 }} />,
//             }}
//           />
//         </Grid>
//         <Grid item xs={6} md={2}>
//           <FormControl fullWidth>
//             <InputLabel>Status</InputLabel>
//             <Select
//               value={statusFilter}
//               onChange={handleStatusFilterChange}
//               label="Status"
//             >
//               <MenuItem value="ALL">All Statuses</MenuItem>
//               <MenuItem value="PENDING">Pending</MenuItem>
//               <MenuItem value="VERIFIED">Verified</MenuItem>
//               <MenuItem value="REJECTED">Rejected</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={6} md={2}>
//           <FormControl fullWidth>
//             <InputLabel>Match Result</InputLabel>
//             <Select
//               value={matchFilter}
//               onChange={handleMatchFilterChange}
//               label="Match Result"
//             >
//               <MenuItem value="ALL">All Results</MenuItem>
//               <MenuItem value="MATCHED">Matched</MenuItem>
//               <MenuItem value="NOT_MATCHED">Not Matched</MenuItem>
//               <MenuItem value="PENDING">Pending</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={6} md={2}>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<Description />}
//             onClick={() => navigate('/birth-records')}
//             fullWidth
//             sx={{ height: '56px' }}
//           >
//             View Birth Records
//           </Button>
//         </Grid>
//         <Grid item xs={6} md={1}>
//           <Button
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={fetchRequests}
//             fullWidth
//             sx={{ height: '56px' }}
//           >
//             Refresh
//           </Button>
//         </Grid>
//       </Grid>

//       {loading ? (
//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//           <CircularProgress />
//         </Box>
//       ) : (
//         <>
//           <TableContainer component={Paper} elevation={3}>
//             <Table sx={{ minWidth: 650 }} aria-label="verification requests table">
//               <TableHead sx={{ backgroundColor: 'primary.main' }}>
//                 <TableRow>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate #</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Child Name</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date of Birth</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Gender</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Match Result</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Request Date</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }} width="10px"></TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredRequests.length > 0 ? (
//                   filteredRequests
//                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((request) => (
//                       <React.Fragment key={request.id}>
//                         <TableRow hover>
//                           <TableCell>
//                             <Box display="flex" alignItems="center" gap={2}>
//                               <Avatar sx={{ bgcolor: 'primary.main' }}>
//                                 {request.user?.username?.charAt(0)?.toUpperCase() || 'U'}
//                               </Avatar>
//                               {request.user?.username || 'N/A'}
//                             </Box>
//                           </TableCell>
//                           <TableCell>{request.certificateNumber || 'N/A'}</TableCell>
//                           <TableCell>{request.childName || 'N/A'}</TableCell>
//                           <TableCell>{formatDate(request.dateOfBirth)}</TableCell>
//                           <TableCell>{request.gender || 'N/A'}</TableCell>
//                           <TableCell>
//                             <Chip
//                               label={request.status || 'PENDING'}
//                               color={statusColors[request.status] || 'default'}
//                               icon={request.status === 'VERIFIED' ? <CheckCircle /> : request.status === 'REJECTED' ? <Cancel /> : null}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               label={request.matchResult || 'PENDING'}
//                               color={matchColors[request.matchResult] || 'default'}
//                             />
//                           </TableCell>
//                           <TableCell>{formatDate(request.createdAt)}</TableCell>
//                           <TableCell align="center">
//                             <Box display="flex" gap={1} justifyContent="center">
//                               {request.recordId && (
//                                 <Tooltip title="View Birth Record">
//                                   <IconButton
//                                     color="primary"
//                                     onClick={() => handleViewBirthRecord(request.recordId)}
//                                   >
//                                     <Visibility />
//                                   </IconButton>
//                                 </Tooltip>
//                               )}
//                               {request.status === 'PENDING' && (
//                                 <>
//                                   <Tooltip title="Verify">
//                                     <IconButton
//                                       color="success"
//                                       onClick={() => handleActionClick(request, 'VERIFIED')}
//                                     >
//                                       <CheckCircle />
//                                     </IconButton>
//                                   </Tooltip>
//                                   <Tooltip title="Reject">
//                                     <IconButton
//                                       color="error"
//                                       onClick={() => handleActionClick(request, 'REJECTED')}
//                                     >
//                                       <Cancel />
//                                     </IconButton>
//                                   </Tooltip>
//                                 </>
//                               )}
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <IconButton
//                               size="small"
//                               onClick={() => toggleExpandRequest(request.id)}
//                             >
//                               {expandedRequest === request.id ? <ExpandLess /> : <ExpandMore />}
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                         <TableRow>
//                           <TableCell colSpan={10} style={{ paddingBottom: 0, paddingTop: 0 }}>
//                             <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
//                               <Box sx={{ margin: 1, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
//                                 <Grid container spacing={2}>
//                                   <Grid item xs={12} md={4}>
//                                     <Typography variant="subtitle1"><strong>Father's Name:</strong> {request.fatherName || 'N/A'}</Typography>
//                                   </Grid>
//                                   <Grid item xs={12} md={4}>
//                                     <Typography variant="subtitle1"><strong>Mother's Name:</strong> {request.motherName || 'N/A'}</Typography>
//                                   </Grid>
//                                   <Grid item xs={12} md={4}>
//                                     <Typography variant="subtitle1"><strong>Date of Issue:</strong> {formatDate(request.dateOfIssue)}</Typography>
//                                   </Grid>
//                                   <Grid item xs={12} md={4}>
//                                     <Typography variant="subtitle1"><strong>Place of Birth:</strong> {request.placeOfBirth || 'N/A'}</Typography>
//                                   </Grid>
//                                   <Grid item xs={12} md={4}>
//                                     <Typography variant="subtitle1"><strong>Resident of Parents:</strong> {request.residentOfParents || 'N/A'}</Typography>
//                                   </Grid>
//                                   <Grid item xs={12} md={4}>
//                                     <Typography variant="subtitle1"><strong>Informant Name:</strong> {request.informantName || 'N/A'}</Typography>
//                                   </Grid>
//                                 </Grid>
//                               </Box>
//                             </Collapse>
//                           </TableCell>
//                         </TableRow>
//                       </React.Fragment>
//                     ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
//                       <Typography variant="subtitle1" color="textSecondary">
//                         No verification requests found
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           {filteredRequests.length > 0 && (
//             <TablePagination
//               rowsPerPageOptions={[5, 10, 25]}
//               component="div"
//               count={filteredRequests.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//               sx={{ mt: 2 }}
//             />
//           )}
//         </>
//       )}

//       {/* Action Confirmation Dialog */}
//       <Dialog open={actionDialogOpen} onClose={handleActionCancel} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           {actionType === 'VERIFIED' ? 'Verify Request' : 'Reject Request'}
//         </DialogTitle>
//         <DialogContent dividers>
//           <DialogContentText sx={{ mb: 2 }}>
//             You are about to mark this request as <strong>{actionType}</strong>:
//           </DialogContentText>
          
//           <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
//             <Typography><strong>Certificate #:</strong> {currentRequest?.certificateNumber || 'N/A'}</Typography>
//             <Typography><strong>Child Name:</strong> {currentRequest?.childName || 'N/A'}</Typography>
//             <Typography><strong>Date of Birth:</strong> {formatDate(currentRequest?.dateOfBirth)}</Typography>
//             <Typography><strong>Gender:</strong> {currentRequest?.gender || 'N/A'}</Typography>
//             <Typography><strong>Father:</strong> {currentRequest?.fatherName || 'N/A'}</Typography>
//             <Typography><strong>Mother:</strong> {currentRequest?.motherName || 'N/A'}</Typography>
//             <Typography><strong>Match Status:</strong> {currentRequest?.matchResult || 'PENDING'}</Typography>
//           </Box>

//           <FormControl fullWidth sx={{ mt: 2 }}>
//             <InputLabel>Notification Method</InputLabel>
//             <Select
//               value={notificationMethod}
//               onChange={(e) => setNotificationMethod(e.target.value)}
//               label="Notification Method"
//             >
//               <MenuItem value="EMAIL">
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <Mail fontSize="small" /> Email
//                 </Box>
//               </MenuItem>
//               <MenuItem value="SMS">
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <Sms fontSize="small" /> SMS
//                 </Box>
//               </MenuItem>
//               <MenuItem value="BOTH">
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <Mail fontSize="small" /> <Sms fontSize="small" /> Both
//                 </Box>
//               </MenuItem>
//               <MenuItem value="NONE">None</MenuItem>
//             </Select>
//           </FormControl>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleActionCancel}>Cancel</Button>
//           <Button 
//             onClick={handleActionConfirm} 
//             variant="contained" 
//             color={actionType === 'VERIFIED' ? 'success' : 'error'}
//             startIcon={actionType === 'VERIFIED' ? <CheckCircle /> : <Cancel />}
//           >
//             Confirm {actionType}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={handleCloseSnackbar} 
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//           iconMapping={{
//             success: <CheckCircle fontSize="inherit" />,
//             error: <Cancel fontSize="inherit" />
//           }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default VerificationManagement;









import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Typography, Box, Grid, CircularProgress, TablePagination,
  DialogContentText, Snackbar, Alert, Avatar, Badge, Tooltip,
  Collapse
} from '@mui/material';
import {
  Search, FilterList, CheckCircle, Cancel, Refresh,
  Verified, Dangerous, Mail, Sms, ArrowUpward, ArrowDownward,
  Person, Description, Visibility, ExpandMore, ExpandLess
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api/verification-requests';

const statusColors = {
  PENDING: 'default',
  VERIFIED: 'success',
  REJECTED: 'error'
};

const matchColors = {
  MATCHED: 'success',
  NOT_MATCHED: 'error',
  PENDING: 'warning'
};

const VerificationManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [matchFilter, setMatchFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [notificationMethod, setNotificationMethod] = useState('EMAIL');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [expandedRequest, setExpandedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, searchTerm, statusFilter, matchFilter, sortConfig]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + '/all');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showSnackbar('Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let result = [...requests];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(request => 
        (request.certificateNumber && request.certificateNumber.toLowerCase().includes(term)) ||
        (request.childName && request.childName.toLowerCase().includes(term)) ||
        (request.user && request.user.username && request.user.username.toLowerCase().includes(term)) ||
        (request.fatherName && request.fatherName.toLowerCase().includes(term)) ||
        (request.motherName && request.motherName.toLowerCase().includes(term)) ||
        (request.informantName && request.informantName.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(request => request.status === statusFilter);
    }

    // Apply match filter
    if (matchFilter !== 'ALL') {
      result = result.filter(request => request.matchResult === matchFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
        if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredRequests(result);
    setPage(0);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleMatchFilterChange = (e) => {
    setMatchFilter(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (request, type) => {
    setCurrentRequest(request);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!currentRequest) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${currentRequest.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          notifyVia: notificationMethod,
          notes: ''
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      fetchRequests();
      showSnackbar(`Request ${actionType.toLowerCase()} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating request:', error);
      showSnackbar(`Failed to ${actionType.toLowerCase()} request`, 'error');
    } finally {
      setActionDialogOpen(false);
    }
  };

  const handleActionCancel = () => {
    setActionDialogOpen(false);
    setCurrentRequest(null);
    setActionType(null);
  };

  const handleViewBirthRecord = (recordId) => {
    navigate(`/verifier/birth-records/${recordId}`);
  };

  const toggleExpandRequest = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 'bold', 
        mb: 3, 
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Verified fontSize="large" />
        Verification Requests Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by Certificate #, Child Name, Parent Names or User"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Match Result</InputLabel>
            <Select
              value={matchFilter}
              onChange={handleMatchFilterChange}
              label="Match Result"
            >
              <MenuItem value="ALL">All Results</MenuItem>
              <MenuItem value="MATCHED">Matched</MenuItem>
              <MenuItem value="NOT_MATCHED">Not Matched</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Description />}
            onClick={() => navigate('/verifier/birth-records')}
            fullWidth
            sx={{ height: '56px' }}
          >
            View Birth Records
          </Button>
        </Grid>
        <Grid item xs={6} md={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRequests}
            fullWidth
            sx={{ height: '56px' }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }} aria-label="verification requests table">
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate #</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Child Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date of Birth</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Gender</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Match Result</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Request Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} width="10px"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {request.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                              {request.user?.username || 'N/A'}
                            </Box>
                          </TableCell>
                          <TableCell>{request.certificateNumber || 'N/A'}</TableCell>
                          <TableCell>{request.childName || 'N/A'}</TableCell>
                          <TableCell>{formatDate(request.dateOfBirth)}</TableCell>
                          <TableCell>{request.gender || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={request.status || 'PENDING'}
                              color={statusColors[request.status] || 'default'}
                              icon={request.status === 'VERIFIED' ? <CheckCircle /> : request.status === 'REJECTED' ? <Cancel /> : null}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.matchResult || 'PENDING'}
                              color={matchColors[request.matchResult] || 'default'}
                            />
                          </TableCell>
                          <TableCell>{formatDate(request.createdAt)}</TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              {request.recordId && (
                                <Tooltip title="View Birth Record">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleViewBirthRecord(request.recordId)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {request.status === 'PENDING' && (
                                <>
                                  <Tooltip title="Verify">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleActionClick(request, 'VERIFIED')}
                                    >
                                      <CheckCircle />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleActionClick(request, 'REJECTED')}
                                    >
                                      <Cancel />
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
                            >
                              {expandedRequest === request.id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={10} style={{ paddingBottom: 0, paddingTop: 0 }}>
                            <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 1, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1"><strong>Father's Name:</strong> {request.fatherName || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1"><strong>Mother's Name:</strong> {request.motherName || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1"><strong>Date of Issue:</strong> {formatDate(request.dateOfIssue)}</Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1"><strong>Place of Birth:</strong> {request.placeOfBirth || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1"><strong>Resident of Parents:</strong> {request.residentOfParents || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1"><strong>Informant Name:</strong> {request.informantName || 'N/A'}</Typography>
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
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography variant="subtitle1" color="textSecondary">
                        No verification requests found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredRequests.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ mt: 2 }}
            />
          )}
        </>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={handleActionCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'VERIFIED' ? 'Verify Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to mark this request as <strong>{actionType}</strong>:
          </DialogContentText>
          
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography><strong>Certificate #:</strong> {currentRequest?.certificateNumber || 'N/A'}</Typography>
            <Typography><strong>Child Name:</strong> {currentRequest?.childName || 'N/A'}</Typography>
            <Typography><strong>Date of Birth:</strong> {formatDate(currentRequest?.dateOfBirth)}</Typography>
            <Typography><strong>Gender:</strong> {currentRequest?.gender || 'N/A'}</Typography>
            <Typography><strong>Father:</strong> {currentRequest?.fatherName || 'N/A'}</Typography>
            <Typography><strong>Mother:</strong> {currentRequest?.motherName || 'N/A'}</Typography>
            <Typography><strong>Match Status:</strong> {currentRequest?.matchResult || 'PENDING'}</Typography>
          </Box>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Notification Method</InputLabel>
            <Select
              value={notificationMethod}
              onChange={(e) => setNotificationMethod(e.target.value)}
              label="Notification Method"
            >
              <MenuItem value="EMAIL">
                <Box display="flex" alignItems="center" gap={1}>
                  <Mail fontSize="small" /> Email
                </Box>
              </MenuItem>
              <MenuItem value="SMS">
                <Box display="flex" alignItems="center" gap={1}>
                  <Sms fontSize="small" /> SMS
                </Box>
              </MenuItem>
              <MenuItem value="BOTH">
                <Box display="flex" alignItems="center" gap={1}>
                  <Mail fontSize="small" /> <Sms fontSize="small" /> Both
                </Box>
              </MenuItem>
              <MenuItem value="NONE">None</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionCancel}>Cancel</Button>
          <Button 
            onClick={handleActionConfirm} 
            variant="contained" 
            color={actionType === 'VERIFIED' ? 'success' : 'error'}
            startIcon={actionType === 'VERIFIED' ? <CheckCircle /> : <Cancel />}
          >
            Confirm {actionType}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
          iconMapping={{
            success: <CheckCircle fontSize="inherit" />,
            error: <Cancel fontSize="inherit" />
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationManagement;