// import React, { useState, useEffect } from 'react';
// import {
//   Box, Typography, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
//   DialogContent, DialogActions, TextField, Select, MenuItem,
//   Grid, Card, CardContent, CircularProgress, Snackbar, Alert,
//   IconButton, Tooltip, FormControl, InputLabel
// } from '@mui/material';
// import {
//   Delete as DeleteIcon, Edit as EditIcon, FilterAlt as FilterIcon,
//   CheckCircle as VerifiedIcon, Cancel as RejectedIcon,
//   PendingActions as PendingIcon, Refresh as RefreshIcon
// } from '@mui/icons-material';
// import axios from 'axios';

// const UserRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [currentRequest, setCurrentRequest] = useState(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [filters, setFilters] = useState({
//     status: 'all',
//     matchStatus: 'all',
//     search: ''
//   });

//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     verified: 0,
//     rejected: 0,
//     matched: 0,
//     notMatched: 0
//   });

//   // Fetch all requests
//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:8080/api/verification-requests/all');
//       setRequests(response.data);
//       applyFilters(response.data);
//       calculateStats(response.data);
//     } catch (err) {
//       setError('Failed to fetch requests');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate statistics
//   const calculateStats = (data) => {
//     const total = data.length;
//     const pending = data.filter(r => r.status === 'pending').length;
//     const verified = data.filter(r => r.status === 'verified').length;
//     const rejected = data.filter(r => r.status === 'rejected').length;
//     const matched = data.filter(r => r.matchStatus === 'matched').length;
//     const notMatched = data.filter(r => r.matchStatus === 'notMatched').length;

//     setStats({
//       total,
//       pending,
//       verified,
//       rejected,
//       matched,
//       notMatched
//     });
//   };

//   // Apply filters
//   const applyFilters = (data) => {
//     let result = [...data];

//     if (filters.status !== 'all') {
//       result = result.filter(r => r.status === filters.status);
//     }

//     if (filters.matchStatus !== 'all') {
//       result = result.filter(r => r.matchStatus === filters.matchStatus);
//     }

//     if (filters.search) {
//       const searchTerm = filters.search.toLowerCase();
//       result = result.filter(r =>
//         r.childName.toLowerCase().includes(searchTerm) ||
//         r.certificateNumber.toLowerCase().includes(searchTerm) ||
//         r.fatherName.toLowerCase().includes(searchTerm) ||
//         r.motherName.toLowerCase().includes(searchTerm)
//       );
//     }

//     setFilteredRequests(result);
//   };

//   // Handle filter change
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle edit request
//   const handleEdit = (request) => {
//     setCurrentRequest(request);
//     setOpenDialog(true);
//   };

//   // Handle delete request
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:8080/api/verification-requests/${id}`);
//       setSnackbar({ open: true, message: 'Request deleted successfully', severity: 'success' });
//       fetchRequests();
//     } catch (err) {
//       setSnackbar({ open: true, message: 'Failed to delete request', severity: 'error' });
//       console.error(err);
//     }
//   };

//   // Handle status change
//   const handleStatusChange = async (id, newStatus) => {
//     try {
//       await axios.patch(`http://localhost:8080/api/verification-requests/${id}/status`, { status: newStatus });
//       setSnackbar({ open: true, message: `Request marked as ${newStatus}`, severity: 'success' });
//       fetchRequests();
//     } catch (err) {
//       setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
//       console.error(err);
//     }
//   };

//   // Handle match status change
//   const handleMatchStatusChange = async (id, newMatchStatus) => {
//     try {
//       await axios.patch(`http://localhost:8080/api/verification-requests/${id}/match-status`, { matchStatus: newMatchStatus });
//       setSnackbar({ open: true, message: `Match status updated to ${newMatchStatus}`, severity: 'success' });
//       fetchRequests();
//     } catch (err) {
//       setSnackbar({ open: true, message: 'Failed to update match status', severity: 'error' });
//       console.error(err);
//     }
//   };

//   // Handle form submit
//   const handleSubmit = async () => {
//     try {
//       await axios.put(`http://localhost:8080/api/verification-requests/${currentRequest.id}`, currentRequest);
//       setSnackbar({ open: true, message: 'Request updated successfully', severity: 'success' });
//       setOpenDialog(false);
//       fetchRequests();
//     } catch (err) {
//       setSnackbar({ open: true, message: 'Failed to update request', severity: 'error' });
//       console.error(err);
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentRequest(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Close snackbar
//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   // Close dialog
//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   // Initial fetch
//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   // Apply filters when filters or requests change
//   useEffect(() => {
//     applyFilters(requests);
//   }, [filters, requests]);

//   if (loading && requests.length === 0) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <Alert severity="error">{error}</Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
//         User Request Management
//       </Typography>

//       {/* Stats Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
//             <CardContent>
//               <Typography variant="h6">Total Requests</Typography>
//               <Typography variant="h4">{stats.total}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
//             <CardContent>
//               <Typography variant="h6">Pending</Typography>
//               <Typography variant="h4">{stats.pending}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
//             <CardContent>
//               <Typography variant="h6">Verified</Typography>
//               <Typography variant="h4">{stats.verified}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
//             <CardContent>
//               <Typography variant="h6">Rejected</Typography>
//               <Typography variant="h4">{stats.rejected}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
//             <CardContent>
//               <Typography variant="h6">Matched</Typography>
//               <Typography variant="h4">{stats.matched}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
//             <CardContent>
//               <Typography variant="h6">Not Matched</Typography>
//               <Typography variant="h4">{stats.notMatched}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Filters */}
//       <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
//         <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
//           <FilterIcon sx={{ mr: 1 }} /> Filters
//         </Typography>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6} md={3}>
//             <FormControl fullWidth>
//               <InputLabel>Status</InputLabel>
//               <Select
//                 name="status"
//                 value={filters.status}
//                 onChange={handleFilterChange}
//                 label="Status"
//               >
//                 <MenuItem value="all">All Statuses</MenuItem>
//                 <MenuItem value="pending">Pending</MenuItem>
//                 <MenuItem value="verified">Verified</MenuItem>
//                 <MenuItem value="rejected">Rejected</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <FormControl fullWidth>
//               <InputLabel>Match Status</InputLabel>
//               <Select
//                 name="matchStatus"
//                 value={filters.matchStatus}
//                 onChange={handleFilterChange}
//                 label="Match Status"
//               >
//                 <MenuItem value="all">All Match Statuses</MenuItem>
//                 <MenuItem value="matched">Matched</MenuItem>
//                 <MenuItem value="notMatched">Not Matched</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} sm={6} md={4}>
//             <TextField
//               fullWidth
//               label="Search"
//               variant="outlined"
//               name="search"
//               value={filters.search}
//               onChange={handleFilterChange}
//               placeholder="Search by name or certificate number..."
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={2}>
//             <Button
//               fullWidth
//               variant="outlined"
//               startIcon={<RefreshIcon />}
//               onClick={() => setFilters({ status: 'all', matchStatus: 'all', search: '' })}
//               sx={{ height: '56px' }}
//             >
//               Reset
//             </Button>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Requests Table */}
//       <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ bgcolor: 'primary.main' }}>
//                 <TableCell sx={{ color: 'white' }}>Certificate #</TableCell>
//                 <TableCell sx={{ color: 'white' }}>Child Name</TableCell>
//                 <TableCell sx={{ color: 'white' }}>Parents</TableCell>
//                 <TableCell sx={{ color: 'white' }}>Status</TableCell>
//                 <TableCell sx={{ color: 'white' }}>Match Status</TableCell>
//                 <TableCell sx={{ color: 'white' }}>Date</TableCell>
//                 <TableCell sx={{ color: 'white' }}>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredRequests.length > 0 ? (
//                 filteredRequests.map((request) => (
//                   <TableRow key={request.id} hover>
//                     <TableCell>{request.certificateNumber}</TableCell>
//                     <TableCell>{request.childName}</TableCell>
//                     <TableCell>
//                       {request.fatherName} & {request.motherName}
//                     </TableCell>
//                     <TableCell>
//                       <Box display="flex" alignItems="center">
//                         {request.status === 'verified' && (
//                           <VerifiedIcon color="success" sx={{ mr: 1 }} />
//                         )}
//                         {request.status === 'rejected' && (
//                           <RejectedIcon color="error" sx={{ mr: 1 }} />
//                         )}
//                         {request.status === 'pending' && (
//                           <PendingIcon color="warning" sx={{ mr: 1 }} />
//                         )}
//                         {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
//                       </Box>
//                     </TableCell>
//                     <TableCell>
//                       {request.matchStatus === 'matched' ? (
//                         <Box display="flex" alignItems="center" color="success.main">
//                           <VerifiedIcon sx={{ mr: 1 }} />
//                           Matched
//                         </Box>
//                       ) : (
//                         <Box display="flex" alignItems="center" color="error.main">
//                           <RejectedIcon sx={{ mr: 1 }} />
//                           Not Matched
//                         </Box>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       {new Date(request.createdAt).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>
//                       <Box display="flex" gap={1}>
//                         <Tooltip title="Edit">
//                           <IconButton color="primary" onClick={() => handleEdit(request)}>
//                             <EditIcon />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Delete">
//                           <IconButton color="error" onClick={() => handleDelete(request.id)}>
//                             <DeleteIcon />
//                           </IconButton>
//                         </Tooltip>
//                         {request.status !== 'verified' && (
//                           <Tooltip title="Mark as Verified">
//                             <IconButton
//                               color="success"
//                               onClick={() => handleStatusChange(request.id, 'verified')}
//                             >
//                               <VerifiedIcon />
//                             </IconButton>
//                           </Tooltip>
//                         )}
//                         {request.status !== 'rejected' && (
//                           <Tooltip title="Mark as Rejected">
//                             <IconButton
//                               color="error"
//                               onClick={() => handleStatusChange(request.id, 'rejected')}
//                             >
//                               <RejectedIcon />
//                             </IconButton>
//                           </Tooltip>
//                         )}
//                         {request.matchStatus !== 'matched' && (
//                           <Tooltip title="Mark as Matched">
//                             <IconButton
//                               color="success"
//                               onClick={() => handleMatchStatusChange(request.id, 'matched')}
//                             >
//                               <VerifiedIcon />
//                             </IconButton>
//                           </Tooltip>
//                         )}
//                         {request.matchStatus !== 'notMatched' && (
//                           <Tooltip title="Mark as Not Matched">
//                             <IconButton
//                               color="error"
//                               onClick={() => handleMatchStatusChange(request.id, 'notMatched')}
//                             >
//                               <RejectedIcon />
//                             </IconButton>
//                           </Tooltip>
//                         )}
//                       </Box>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center">
//                     No requests found matching your filters
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* Edit Dialog */}
//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
//         <DialogTitle>Edit Request</DialogTitle>
//         <DialogContent dividers>
//           {currentRequest && (
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Certificate Number"
//                   name="certificateNumber"
//                   value={currentRequest.certificateNumber}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Child Name"
//                   name="childName"
//                   value={currentRequest.childName}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Date of Birth"
//                   name="dateOfBirth"
//                   value={currentRequest.dateOfBirth}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Place of Birth"
//                   name="placeOfBirth"
//                   value={currentRequest.placeOfBirth}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Father's Name"
//                   name="fatherName"
//                   value={currentRequest.fatherName}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Mother's Name"
//                   name="motherName"
//                   value={currentRequest.motherName}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Resident of Parents"
//                   name="residentOfParents"
//                   value={currentRequest.residentOfParents}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Informant Name"
//                   name="informantName"
//                   value={currentRequest.informantName}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Date of Issue"
//                   name="dateOfIssue"
//                   value={currentRequest.dateOfIssue}
//                   onChange={handleInputChange}
//                   margin="normal"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Gender</InputLabel>
//                   <Select
//                     name="gender"
//                     value={currentRequest.gender}
//                     onChange={handleInputChange}
//                     label="Gender"
//                   >
//                     <MenuItem value="Male">Male</MenuItem>
//                     <MenuItem value="Female">Female</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSubmit} variant="contained" color="primary">
//             Save Changes
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
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
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default UserRequests;



// import React, { useState, useEffect } from 'react';
// import {
//   Box, Typography, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
//   DialogContent, DialogActions, TextField, Select, MenuItem,
//   Grid, Card, CardContent, CircularProgress, Snackbar, Alert,
//   IconButton, Tooltip, FormControl, InputLabel, Chip, Avatar,
//   Badge, Collapse, List, ListItem, ListItemText
// } from '@mui/material';
// import {
//   Delete as DeleteIcon, Edit as EditIcon, FilterAlt as FilterIcon,
//   Refresh as RefreshIcon, Search as SearchIcon, 
//   CheckCircle as VerifiedIcon, Cancel as RejectedIcon,
//   ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon
// } from '@mui/icons-material';
// import axios from 'axios';

// const UserRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [filteredRequests, setFilteredRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [currentRequest, setCurrentRequest] = useState(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [filters, setFilters] = useState({
//     status: 'all',
//     matchStatus: 'all',
//     search: ''
//   });
//   const [expandedRequest, setExpandedRequest] = useState(null);

//   // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     matched: 0,
//     notMatched: 0,
//     pending: 0
//   });

//   // Fetch all requests
//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:8080/api/verification-requests/all');
//       const processedData = response.data.map(request => ({
//         ...request,
//         matchStatus: request.matchResult === 'MATCHED' ? 'matched' : 
//                      request.matchResult === 'NOT_MATCHED' ? 'notMatched' : 
//                      request.matchResult === 'NOT_FOUND' ? 'notMatched' : 
//                      request.matchStatus || 'notMatched'
//       }));
//       setRequests(processedData);
//       applyFilters(processedData);
//       calculateStats(processedData);
//     } catch (err) {
//       setError('Failed to fetch requests');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate statistics
//   const calculateStats = (data) => {
//     const total = data.length;
//     const matched = data.filter(r => r.matchStatus === 'matched').length;
//     const notMatched = data.filter(r => r.matchStatus === 'notMatched').length;
//     const pending = data.filter(r => r.status === 'pending').length;

//     setStats({
//       total,
//       matched,
//       notMatched,
//       pending
//     });
//   };

//   // Apply filters
//   const applyFilters = (data) => {
//     let result = [...data];

//     if (filters.status !== 'all') {
//       result = result.filter(r => r.status === filters.status);
//     }

//     if (filters.matchStatus !== 'all') {
//       result = result.filter(r => r.matchStatus === filters.matchStatus);
//     }

//     if (filters.search) {
//       const searchTerm = filters.search.toLowerCase();
//       result = result.filter(r =>
//         (r.childName && r.childName.toLowerCase().includes(searchTerm)) ||
//         (r.certificateNumber && r.certificateNumber.toLowerCase().includes(searchTerm)) ||
//         (r.fatherName && r.fatherName.toLowerCase().includes(searchTerm)) ||
//         (r.motherName && r.motherName.toLowerCase().includes(searchTerm))
//       );
//     }

//     setFilteredRequests(result);
//   };

//   // Handle filter change
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle edit request
//   const handleEdit = (request) => {
//     setCurrentRequest(request);
//     setOpenDialog(true);
//   };

//   // Handle delete request
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:8080/api/verification-requests/${id}`);
//       setSnackbar({ open: true, message: 'Request deleted successfully', severity: 'success' });
//       fetchRequests();
//     } catch (err) {
//       setSnackbar({ open: true, message: 'Failed to delete request', severity: 'error' });
//       console.error(err);
//     }
//   };

//   // Handle form submit
//   const handleSubmit = async () => {
//     try {
//       await axios.put(`http://localhost:8080/api/verification-requests/${currentRequest.id}`, currentRequest);
//       setSnackbar({ open: true, message: 'Request updated successfully', severity: 'success' });
//       setOpenDialog(false);
//       fetchRequests();
//     } catch (err) {
//       setSnackbar({ open: true, message: 'Failed to update request', severity: 'error' });
//       console.error(err);
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentRequest(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Toggle expanded view for request details
//   const toggleExpandRequest = (requestId) => {
//     setExpandedRequest(expandedRequest === requestId ? null : requestId);
//   };

//   // Close snackbar
//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   // Close dialog
//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return dateString;
//     }
//   };

//   // Initial fetch
//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   // Apply filters when filters or requests change
//   useEffect(() => {
//     applyFilters(requests);
//   }, [filters, requests]);

//   if (loading && requests.length === 0) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <Alert severity="error">{error}</Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom sx={{ 
//         mb: 3, 
//         fontWeight: 'bold', 
//         color: 'primary.main',
//         display: 'flex',
//         alignItems: 'center',
//         gap: 2
//       }}>
//         <VerifiedIcon fontSize="large" />
//         User Request Management
//       </Typography>

//       {/* Stats Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ 
//             bgcolor: 'background.paper',
//             boxShadow: 3,
//             borderLeft: '4px solid',
//             borderColor: 'primary.main',
//             borderRadius: '8px'
//           }}>
//             <CardContent>
//               <Typography variant="subtitle1" color="text.secondary">Total Requests</Typography>
//               <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ 
//             bgcolor: 'background.paper',
//             boxShadow: 3,
//             borderLeft: '4px solid',
//             borderColor: 'success.main',
//             borderRadius: '8px'
//           }}>
//             <CardContent>
//               <Typography variant="subtitle1" color="text.secondary">Matched</Typography>
//               <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>{stats.matched}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ 
//             bgcolor: 'background.paper',
//             boxShadow: 3,
//             borderLeft: '4px solid',
//             borderColor: 'error.main',
//             borderRadius: '8px'
//           }}>
//             <CardContent>
//               <Typography variant="subtitle1" color="text.secondary">Not Matched</Typography>
//               <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>{stats.notMatched}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Card sx={{ 
//             bgcolor: 'background.paper',
//             boxShadow: 3,
//             borderLeft: '4px solid',
//             borderColor: 'warning.main',
//             borderRadius: '8px'
//           }}>
//             <CardContent>
//               <Typography variant="subtitle1" color="text.secondary">Pending</Typography>
//               <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>{stats.pending}</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Filters */}
//       <Box sx={{ 
//         mb: 3, 
//         p: 3, 
//         bgcolor: 'background.paper', 
//         borderRadius: '12px', 
//         boxShadow: 2 
//       }}>
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} md={4}>
//             <TextField
//               fullWidth
//               label="Search"
//               variant="outlined"
//               name="search"
//               value={filters.search}
//               onChange={handleFilterChange}
//               placeholder="Search requests..."
//               InputProps={{
//                 startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
//               }}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={4}>
//             <FormControl fullWidth>
//               <InputLabel>Status</InputLabel>
//               <Select
//                 name="status"
//                 value={filters.status}
//                 onChange={handleFilterChange}
//                 label="Status"
//               >
//                 <MenuItem value="all">All Statuses</MenuItem>
//                 <MenuItem value="pending">Pending</MenuItem>
//                 <MenuItem value="verified">Verified</MenuItem>
//                 <MenuItem value="rejected">Rejected</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} sm={6} md={4}>
//             <FormControl fullWidth>
//               <InputLabel>Match Status</InputLabel>
//               <Select
//                 name="matchStatus"
//                 value={filters.matchStatus}
//                 onChange={handleFilterChange}
//                 label="Match Status"
//               >
//                 <MenuItem value="all">All Match Statuses</MenuItem>
//                 <MenuItem value="matched">Matched</MenuItem>
//                 <MenuItem value="notMatched">Not Matched</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Requests Table */}
//       <Paper sx={{ 
//         p: 2, 
//         borderRadius: '12px', 
//         boxShadow: 3,
//         overflow: 'hidden'
//       }}>
//         <Box sx={{ 
//           display: 'flex', 
//           justifyContent: 'space-between', 
//           alignItems: 'center',
//           mb: 2
//         }}>
//           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//             User Requests
//           </Typography>
//           <Button
//             variant="outlined"
//             startIcon={<RefreshIcon />}
//             onClick={fetchRequests}
//           >
//             Refresh
//           </Button>
//         </Box>
        
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ 
//                 bgcolor: 'background.default',
//                 '& th': { 
//                   fontWeight: 'bold',
//                   color: 'text.primary'
//                 }
//               }}>
//                 <TableCell>Certificate #</TableCell>
//                 <TableCell>Child Details</TableCell>
//                 <TableCell>Parents</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell>Match Status</TableCell>
//                 <TableCell>Date</TableCell>
//                 <TableCell>Actions</TableCell>
//                 <TableCell width="50px" />
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredRequests.length > 0 ? (
//                 filteredRequests.map((request) => (
//                   <React.Fragment key={request.id}>
//                     <TableRow 
//                       hover
//                       sx={{ 
//                         '&:hover': { bgcolor: 'action.hover' }
//                       }}
//                     >
//                       <TableCell sx={{ fontWeight: 'medium' }}>
//                         {request.certificateNumber || 'N/A'}
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
//                           {request.childName || 'N/A'}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           DOB: {formatDate(request.dateOfBirth)}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {request.gender || 'N/A'}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           <strong>Father:</strong> {request.fatherName || 'N/A'}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Mother:</strong> {request.motherName || 'N/A'}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
//                           color={
//                             request.status === 'verified' ? 'success' : 
//                             request.status === 'rejected' ? 'error' : 'warning'
//                           }
//                           size="small"
//                           icon={
//                             request.status === 'verified' ? <VerifiedIcon fontSize="small" /> :
//                             request.status === 'rejected' ? <RejectedIcon fontSize="small" /> : null
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={request.matchStatus === 'matched' ? 'Matched' : 'Not Matched'}
//                           color={request.matchStatus === 'matched' ? 'success' : 'error'}
//                           size="small"
//                           icon={
//                             request.matchStatus === 'matched' ? <VerifiedIcon fontSize="small" /> :
//                             <RejectedIcon fontSize="small" />
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         {formatDate(request.createdAt)}
//                       </TableCell>
//                       <TableCell>
//                         <Box display="flex" gap={1}>
//                           <Tooltip title="Edit">
//                             <IconButton 
//                               color="primary" 
//                               onClick={() => handleEdit(request)}
//                               sx={{ 
//                                 '&:hover': { 
//                                   bgcolor: 'primary.light',
//                                   color: 'primary.main'
//                                 }
//                               }}
//                             >
//                               <EditIcon fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Delete">
//                             <IconButton 
//                               color="error" 
//                               onClick={() => handleDelete(request.id)}
//                               sx={{ 
//                                 '&:hover': { 
//                                   bgcolor: 'error.light',
//                                   color: 'error.main'
//                                 }
//                               }}
//                             >
//                               <DeleteIcon fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <IconButton
//                           size="small"
//                           onClick={() => toggleExpandRequest(request.id)}
//                         >
//                           {expandedRequest === request.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//                         </IconButton>
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell colSpan={8} style={{ paddingBottom: 0, paddingTop: 0 }}>
//                         <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
//                           <Box sx={{ margin: 1, p: 3, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
//                             <Grid container spacing={2}>
//                               <Grid item xs={12} md={6}>
//                                 <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
//                                   Certificate Details
//                                 </Typography>
//                                 <List dense>
//                                   <ListItem>
//                                     <ListItemText 
//                                       primary="Place of Birth" 
//                                       secondary={request.placeOfBirth || 'N/A'} 
//                                     />
//                                   </ListItem>
//                                   <ListItem>
//                                     <ListItemText 
//                                       primary="Date of Issue" 
//                                       secondary={formatDate(request.dateOfIssue)} 
//                                     />
//                                   </ListItem>
//                                   <ListItem>
//                                     <ListItemText 
//                                       primary="Resident of Parents" 
//                                       secondary={request.residentOfParents || 'N/A'} 
//                                     />
//                                   </ListItem>
//                                   <ListItem>
//                                     <ListItemText 
//                                       primary="Informant Name" 
//                                       secondary={request.informantName || 'N/A'} 
//                                     />
//                                   </ListItem>
//                                 </List>
//                               </Grid>
//                               <Grid item xs={12} md={6}>
//                                 <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
//                                   Verification Details
//                                 </Typography>
//                                 <List dense>
//                                   <ListItem>
//                                     <ListItemText 
//                                       primary="Requested By" 
//                                       secondary={request.user?.username || 'N/A'} 
//                                     />
//                                   </ListItem>
//                                   <ListItem>
//                                     <ListItemText 
//                                       primary="Request Date" 
//                                       secondary={formatDate(request.createdAt)} 
//                                     />
//                                   </ListItem>
//                                   {request.matchStatus === 'notMatched' && request.mismatchDetails && (
//                                     <ListItem>
//                                       <ListItemText 
//                                         primary="Mismatch Reasons" 
//                                         secondary={request.mismatchDetails} 
//                                         secondaryTypographyProps={{ color: 'error.main' }}
//                                       />
//                                     </ListItem>
//                                   )}
//                                 </List>
//                               </Grid>
//                             </Grid>
//                           </Box>
//                         </Collapse>
//                       </TableCell>
//                     </TableRow>
//                   </React.Fragment>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
//                     <Box sx={{ 
//                       display: 'flex', 
//                       flexDirection: 'column', 
//                       alignItems: 'center',
//                       color: 'text.secondary'
//                     }}>
//                       <SearchIcon sx={{ fontSize: 48, mb: 1 }} />
//                       <Typography variant="h6">
//                         No requests found
//                       </Typography>
//                       <Typography variant="body2">
//                         Try adjusting your search or filters
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* Edit Dialog */}
//       <Dialog 
//         open={openDialog} 
//         onClose={handleCloseDialog} 
//         maxWidth="md" 
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: '12px'
//           }
//         }}
//       >
//         <DialogTitle sx={{ 
//           bgcolor: 'primary.main', 
//           color: 'white',
//           fontWeight: 'bold'
//         }}>
//           Edit Request
//         </DialogTitle>
//         <DialogContent dividers sx={{ py: 3 }}>
//           {currentRequest && (
//             <Grid container spacing={3}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Certificate Number"
//                   name="certificateNumber"
//                   value={currentRequest.certificateNumber || ''}
//                   onChange={handleInputChange}
//                   margin="normal"
//                   variant="outlined"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Child Name"
//                   name="childName"
//                   value={currentRequest.childName || ''}
//                   onChange={handleInputChange}
//                   margin="normal"
//                   variant="outlined"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Date of Birth"
//                   name="dateOfBirth"
//                   type="date"
//                   value={currentRequest.dateOfBirth || ''}
//                   onChange={handleInputChange}
//                   margin="normal"
//                   variant="outlined"
//                   InputLabelProps={{ shrink: true }}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Place of Birth"
//                   name="placeOfBirth"
//                   value={currentRequest.placeOfBirth || ''}
//                   onChange={handleInputChange}
//                   margin="normal"
//                   variant="outlined"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Father's Name"
//                   name="fatherName"
//                   value={currentRequest.fatherName || ''}
//                   onChange={handleInputChange}
//                   margin="normal"
//                   variant="outlined"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Mother's Name"
//                   name="motherName"
//                   value={currentRequest.motherName || ''}
//                   onChange={handleInputChange}
//                   margin="normal"
//                   variant="outlined"
//                 />
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button 
//             onClick={handleCloseDialog}
//             variant="outlined"
//             sx={{ 
//               borderRadius: '8px',
//               px: 3
//             }}
//           >
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleSubmit} 
//             variant="contained" 
//             color="primary"
//             sx={{ 
//               borderRadius: '8px',
//               px: 3
//             }}
//           >
//             Save Changes
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           sx={{ 
//             width: '100%',
//             borderRadius: '8px',
//             boxShadow: 3
//           }}
//           iconMapping={{
//             success: <VerifiedIcon fontSize="inherit" />,
//             error: <RejectedIcon fontSize="inherit" />
//           }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default UserRequests;


import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  Grid, Card, CardContent, CircularProgress, Snackbar, Alert,
  IconButton, Tooltip, FormControl, InputLabel, Chip, Avatar,
  Badge, Collapse, List, ListItem, ListItemText, Switch, FormControlLabel
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
  RestoreFromTrash as RestoreIcon
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
      
      // Also fetch deleted count if showing active
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
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <VerifiedIcon fontSize="large" />
        User Request Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Total Requests</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderLeft: '4px solid',
            borderColor: 'success.main',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Matched</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>{stats.matched}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderLeft: '4px solid',
            borderColor: 'error.main',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Not Matched</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>{stats.notMatched}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderLeft: '4px solid',
            borderColor: 'warning.main',
            borderRadius: '8px'
          }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Deleted</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>{stats.deleted}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ 
        mb: 3, 
        p: 3, 
        bgcolor: 'background.paper', 
        borderRadius: '12px', 
        boxShadow: 2 
      }}>
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
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
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
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchRequests}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Requests Table */}
      <Paper sx={{ 
        p: 2, 
        borderRadius: '12px', 
        boxShadow: 3,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {filters.showDeleted ? 'Deleted Requests' : 'Active Requests'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredRequests.length} of {requests.length} requests
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                bgcolor: 'background.default',
                '& th': { 
                  fontWeight: 'bold',
                  color: 'text.primary'
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
                        opacity: request.deleted ? 0.7 : 1
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {request.certificateNumber || 'N/A'}
                        {request.deleted && (
                          <Chip 
                            label="Deleted" 
                            size="small" 
                            color="error" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {request.childName || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          DOB: {formatDate(request.dateOfBirth)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.gender || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          <strong>Father:</strong> {request.fatherName || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Mother:</strong> {request.motherName || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          color={
                            request.status === 'verified' ? 'success' : 
                            request.status === 'rejected' ? 'error' : 'warning'
                          }
                          size="small"
                          icon={
                            request.status === 'verified' ? <VerifiedIcon fontSize="small" /> :
                            request.status === 'rejected' ? <RejectedIcon fontSize="small" /> : null
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.matchStatus === 'matched' ? 'Matched' : 'Not Matched'}
                          color={request.matchStatus === 'matched' ? 'success' : 'error'}
                          size="small"
                          icon={
                            request.matchStatus === 'matched' ? <VerifiedIcon fontSize="small" /> :
                            <RejectedIcon fontSize="small" />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(request.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {!request.deleted ? (
                            <>
                              <Tooltip title="Edit">
                                <IconButton 
                                  color="primary" 
                                  onClick={() => handleEdit(request)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Move to Trash">
                                <IconButton 
                                  color="warning" 
                                  onClick={() => handleSoftDelete(request.id)}
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
                                >
                                  <RestoreIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Permanently Delete">
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleHardDelete(request.id)}
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
                        >
                          {expandedRequest === request.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1, p: 3, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Certificate Details
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Place of Birth" 
                                      secondary={request.placeOfBirth || 'N/A'} 
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Date of Issue" 
                                      secondary={formatDate(request.dateOfIssue)} 
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Resident of Parents" 
                                      secondary={request.residentOfParents || 'N/A'} 
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Informant Name" 
                                      secondary={request.informantName || 'N/A'} 
                                    />
                                  </ListItem>
                                </List>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Verification Details
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Requested By" 
                                      secondary={request.user?.username || 'N/A'} 
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemText 
                                      primary="Request Date" 
                                      secondary={formatDate(request.createdAt)} 
                                    />
                                  </ListItem>
                                  {request.matchStatus === 'notMatched' && request.mismatchDetails && (
                                    <ListItem>
                                      <ListItemText 
                                        primary="Mismatch Reasons" 
                                        secondary={request.mismatchDetails} 
                                        secondaryTypographyProps={{ color: 'error.main' }}
                                      />
                                    </ListItem>
                                  )}
                                  {request.deleted && (
                                    <ListItem>
                                      <ListItemText 
                                        primary="Deleted At" 
                                        secondary={formatDate(request.deletedAt)} 
                                        secondaryTypographyProps={{ color: 'error.main' }}
                                      />
                                    </ListItem>
                                  )}
                                </List>
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
                      color: 'text.secondary'
                    }}>
                      <SearchIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h6">
                        No requests found
                      </Typography>
                      <Typography variant="body2">
                        Try adjusting your search or filters
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Edit Request
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
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: '8px',
              px: 3
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
            borderRadius: '8px',
            boxShadow: 3
          }}
          iconMapping={{
            success: <VerifiedIcon fontSize="inherit" />,
            error: <RejectedIcon fontSize="inherit" />
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRequests;