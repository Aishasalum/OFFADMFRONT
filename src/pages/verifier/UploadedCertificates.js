// import React, { useState, useEffect } from 'react';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
//   TextField, Button, Select, MenuItem, FormControl, InputLabel,
//   Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
//   Chip, Typography, Box, Grid, CircularProgress, TablePagination,
//   DialogContentText, Snackbar, Alert, Avatar, Badge, Tooltip,
//   Collapse, TextareaAutosize
// } from '@mui/material';
// import {
//   Search, FilterList, CheckCircle, Cancel, Refresh,
//   Verified, Dangerous, Mail, Sms, ArrowUpward, ArrowDownward,
//   Person, Description, Visibility, Download, PictureAsPdf, Image as ImageIcon
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// const API_BASE_URL = 'http://localhost:8080/api/certificates';

// const statusColors = {
//   PENDING: 'default',
//   VERIFIED: 'success',
//   REJECTED: 'error'
// };

// const CertificateManagement = () => {
//   const [certificates, setCertificates] = useState([]);
//   const [filteredCertificates, setFilteredCertificates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'desc' });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [actionDialogOpen, setActionDialogOpen] = useState(false);
//   const [currentCertificate, setCurrentCertificate] = useState(null);
//   const [actionType, setActionType] = useState(null);
//   const [notificationMethod, setNotificationMethod] = useState('EMAIL');
//   const [message, setMessage] = useState('');
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });
//   const [previewOpen, setPreviewOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCertificates();
//   }, []);

//   useEffect(() => {
//     filterAndSortCertificates();
//   }, [certificates, searchTerm, statusFilter, sortConfig]);

//   const fetchCertificates = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(API_BASE_URL + '/all');
//       if (!response.ok) throw new Error('Failed to fetch certificates');
//       const data = await response.json();
//       setCertificates(data);
//     } catch (error) {
//       console.error('Error fetching certificates:', error);
//       showSnackbar('Failed to fetch certificates', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterAndSortCertificates = () => {
//     let result = [...certificates];

//     // Apply search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(cert => 
//         (cert.certificateNumber && cert.certificateNumber.toLowerCase().includes(term)) ||
//         (cert.certificateName && cert.certificateName.toLowerCase().includes(term)) ||
//         (cert.user && cert.user.username && cert.user.username.toLowerCase().includes(term)) ||
//         (cert.user && cert.user.email && cert.user.email.toLowerCase().includes(term)) ||
//         (cert.user && cert.user.phone && cert.user.phone.toLowerCase().includes(term))
//       );
//     }

//     // Apply status filter
//     if (statusFilter !== 'ALL') {
//       result = result.filter(cert => cert.verificationStatus === statusFilter);
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

//     setFilteredCertificates(result);
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

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleActionClick = (certificate, type) => {
//     setCurrentCertificate(certificate);
//     setActionType(type);
//     setActionDialogOpen(true);
//     setMessage('');
//   };

//   const handleActionConfirm = async () => {
//     if (!currentCertificate) return;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/${currentCertificate.id}/status`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status: actionType,
//           notifyVia: notificationMethod,
//           message: message
//         }),
//       });

//       if (!response.ok) throw new Error(await response.text());

//       fetchCertificates();
//       showSnackbar(`Certificate ${actionType.toLowerCase()} successfully!`, 'success');
//     } catch (error) {
//       console.error('Error updating certificate:', error);
//       showSnackbar(`Failed to ${actionType.toLowerCase()} certificate`, 'error');
//     } finally {
//       setActionDialogOpen(false);
//     }
//   };

//   const handleActionCancel = () => {
//     setActionDialogOpen(false);
//     setCurrentCertificate(null);
//     setActionType(null);
//   };

//   const handlePreviewCertificate = (certificate) => {
//     setCurrentCertificate(certificate);
//     setPreviewOpen(true);
//   };

//   const handleClosePreview = () => {
//     setPreviewOpen(false);
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

//   const getFileIcon = (fileUrl) => {
//     if (fileUrl?.endsWith('.pdf')) {
//       return <PictureAsPdf color="error" />;
//     } else if (fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i)) {
//       return <ImageIcon color="primary" />;
//     }
//     return <Description color="action" />;
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
//         <Description fontSize="large" />
//         Uploaded Certificates Management
//       </Typography>

//       <Grid container spacing={2} sx={{ mb: 3 }}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search by Certificate #, Name, User, Email or Phone"
//             value={searchTerm}
//             onChange={handleSearch}
//             InputProps={{
//               startAdornment: <Search sx={{ mr: 1 }} />,
//             }}
//           />
//         </Grid>
//         <Grid item xs={6} md={3}>
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
//         <Grid item xs={6} md={3}>
//           <Button
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={fetchCertificates}
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
//             <Table sx={{ minWidth: 650 }} aria-label="certificates table">
//               <TableHead sx={{ backgroundColor: 'primary.main' }}>
//                 <TableRow>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate #</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate Name</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File Type</TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
//                     <Box display="flex" alignItems="center">
//                       Status
//                       <IconButton size="small" onClick={() => handleSort('verificationStatus')}>
//                         {sortConfig.key === 'verificationStatus' && sortConfig.direction === 'asc' ? (
//                           <ArrowUpward sx={{ color: 'white' }} />
//                         ) : (
//                           <ArrowDownward sx={{ color: 'white' }} />
//                         )}
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
//                     <Box display="flex" alignItems="center">
//                       Upload Date
//                       <IconButton size="small" onClick={() => handleSort('uploadDate')}>
//                         {sortConfig.key === 'uploadDate' && sortConfig.direction === 'asc' ? (
//                           <ArrowUpward sx={{ color: 'white' }} />
//                         ) : (
//                           <ArrowDownward sx={{ color: 'white' }} />
//                         )}
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                   <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredCertificates.length > 0 ? (
//                   filteredCertificates
//                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((certificate) => (
//                       <TableRow
//                         key={certificate.id}
//                         hover
//                         sx={{
//                           '&:nth-of-type(odd)': {
//                             backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                           },
//                         }}
//                       >
//                         <TableCell>
//                           <Box display="flex" alignItems="center" gap={2}>
//                             <Avatar sx={{ bgcolor: 'primary.main' }}>
//                               {certificate.user?.username?.charAt(0)?.toUpperCase() || 'U'}
//                             </Avatar>
//                             <Box>
//                               <Typography>{certificate.user?.username || 'N/A'}</Typography>
//                               <Typography variant="body2" color="textSecondary">
//                                 {certificate.user?.email || 'No email'}
//                               </Typography>
//                               <Typography variant="body2" color="textSecondary">
//                                 {certificate.user?.phone || 'No phone'}
//                               </Typography>
//                             </Box>
//                           </Box>
//                         </TableCell>
//                         <TableCell>{certificate.certificateNumber || 'N/A'}</TableCell>
//                         <TableCell>{certificate.certificateName || 'N/A'}</TableCell>
//                         <TableCell>
//                           {getFileIcon(certificate.fileUrl)}
//                         </TableCell>
//                         <TableCell>
//                           <Chip
//                             label={certificate.verificationStatus || 'PENDING'}
//                             color={statusColors[certificate.verificationStatus] || 'default'}
//                             icon={certificate.verificationStatus === 'VERIFIED' ? <CheckCircle /> : 
//                                   certificate.verificationStatus === 'REJECTED' ? <Cancel /> : null}
//                           />
//                         </TableCell>
//                         <TableCell>{formatDate(certificate.uploadDate)}</TableCell>
//                         <TableCell align="center">
//                           <Box display="flex" gap={1} justifyContent="center">
//                             <Tooltip title="Preview Certificate">
//                               <IconButton
//                                 color="primary"
//                                 onClick={() => handlePreviewCertificate(certificate)}
//                               >
//                                 <Visibility />
//                               </IconButton>
//                             </Tooltip>
//                             <Tooltip title="Download Certificate">
//                               <IconButton
//                                 color="secondary"
//                                 onClick={() => window.open(certificate.fileUrl, '_blank')}
//                               >
//                                 <Download />
//                               </IconButton>
//                             </Tooltip>
//                             {certificate.verificationStatus === 'PENDING' && (
//                               <>
//                                 <Tooltip title="Verify">
//                                   <IconButton
//                                     color="success"
//                                     onClick={() => handleActionClick(certificate, 'VERIFIED')}
//                                   >
//                                     <CheckCircle />
//                                   </IconButton>
//                                 </Tooltip>
//                                 <Tooltip title="Reject">
//                                   <IconButton
//                                     color="error"
//                                     onClick={() => handleActionClick(certificate, 'REJECTED')}
//                                   >
//                                     <Cancel />
//                                   </IconButton>
//                                 </Tooltip>
//                               </>
//                             )}
//                           </Box>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
//                       <Typography variant="subtitle1" color="textSecondary">
//                         No certificates found
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           {filteredCertificates.length > 0 && (
//             <TablePagination
//               rowsPerPageOptions={[5, 10, 25]}
//               component="div"
//               count={filteredCertificates.length}
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
//           {actionType === 'VERIFIED' ? 'Verify Certificate' : 'Reject Certificate'}
//         </DialogTitle>
//         <DialogContent dividers>
//           <DialogContentText sx={{ mb: 2 }}>
//             You are about to mark this certificate as <strong>{actionType}</strong>:
//           </DialogContentText>
          
//           <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
//             <Typography><strong>Certificate #:</strong> {currentCertificate?.certificateNumber || 'N/A'}</Typography>
//             <Typography><strong>Certificate Name:</strong> {currentCertificate?.certificateName || 'N/A'}</Typography>
//             <Typography><strong>User:</strong> {currentCertificate?.user?.username || 'N/A'}</Typography>
//             <Typography><strong>Email:</strong> {currentCertificate?.user?.email || 'N/A'}</Typography>
//             <Typography><strong>Phone:</strong> {currentCertificate?.user?.phone || 'N/A'}</Typography>
//           </Box>

//           <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
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

//           <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Message to User:</Typography>
//           <TextareaAutosize
//             minRows={3}
//             placeholder={`Enter your message to the user about why this certificate is being ${actionType?.toLowerCase()}...`}
//             style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
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

//       {/* Certificate Preview Dialog */}
//       <Dialog 
//         open={previewOpen} 
//         onClose={handleClosePreview} 
//         maxWidth="lg"
//         fullWidth
//         sx={{
//           '& .MuiDialog-paper': {
//             height: '90vh'
//           }
//         }}
//       >
//         <DialogTitle>
//           Certificate Preview: {currentCertificate?.certificateName || 'Untitled'}
//         </DialogTitle>
//         <DialogContent dividers>
//           {currentCertificate?.fileUrl?.endsWith('.pdf') ? (
//             <iframe 
//               src={currentCertificate.fileUrl} 
//               width="100%" 
//               height="100%"
//               style={{ border: 'none', minHeight: '70vh' }}
//               title="Certificate PDF Preview"
//             />
//           ) : (
//             <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
//               <img 
//                 src={currentCertificate?.fileUrl} 
//                 alt="Certificate" 
//                 style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
//               />
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClosePreview}>Close</Button>
//           <Button 
//             onClick={() => window.open(currentCertificate?.fileUrl, '_blank')}
//             variant="contained"
//             color="primary"
//             startIcon={<Download />}
//           >
//             Download
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
// // };
// import React, { useState, useEffect } from 'react';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
//   TextField, Button, Select, MenuItem, FormControl, InputLabel,
//   Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
//   Chip, Typography, Box, Grid, CircularProgress, TablePagination,
//   Snackbar, Alert, Avatar, Tooltip
// } from '@mui/material';
// import {
//   Search, CheckCircle, Cancel, Refresh,
//   Download, Visibility, PictureAsPdf, Image as ImageIcon,
//   ArrowUpward, ArrowDownward, Description
// } from '@mui/icons-material';

// const API_BASE_URL = 'http://localhost:8080/api/certificates';

// const statusColors = {
//   PENDING: 'default',
//   VERIFIED: 'success',
//   REJECTED: 'error'
// };

// const CertificateManagement = () => {
//   const [certificates, setCertificates] = useState([]);
//   const [filteredCertificates, setFilteredCertificates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'desc' });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [actionDialogOpen, setActionDialogOpen] = useState(false);
//   const [currentCertificate, setCurrentCertificate] = useState(null);
//   const [actionType, setActionType] = useState(null);
//   const [notificationMethod, setNotificationMethod] = useState('EMAIL');
//   const [message, setMessage] = useState('');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [previewOpen, setPreviewOpen] = useState(false);

//   useEffect(() => { fetchCertificates(); }, []);
//   useEffect(() => { filterAndSortCertificates(); }, [certificates, searchTerm, statusFilter, sortConfig]);

//   const fetchCertificates = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/all`);
//       if (!response.ok) throw new Error('Failed to fetch');
//       const data = await response.json();
//       setCertificates(data);
//     } catch (error) {
//       showSnackbar('Error fetching certificates', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterAndSortCertificates = () => {
//     let result = [...certificates];
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(cert =>
//         cert.certificateNumber?.toLowerCase().includes(term) ||
//         cert.certificateName?.toLowerCase().includes(term) ||
//         cert.user?.username?.toLowerCase().includes(term) ||
//         cert.user?.email?.toLowerCase().includes(term) ||
//         cert.user?.phone?.toLowerCase().includes(term) ||
//         cert.user?.phoneNumber?.toLowerCase().includes(term)
//       );
//     }
//     if (statusFilter !== 'ALL') {
//       result = result.filter(cert => cert.verificationStatus === statusFilter);
//     }
//     if (sortConfig.key) {
//       result.sort((a, b) => {
//         const aValue = getNestedValue(a, sortConfig.key);
//         const bValue = getNestedValue(b, sortConfig.key);
//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }
//     setFilteredCertificates(result);
//     setPage(0);
//   };

//   const getNestedValue = (obj, path) => {
//     return path.split('.').reduce((o, p) => o?.[p], obj) || '';
//   };

//   const handleSort = (key) => {
//     const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
//     setSortConfig({ key, direction });
//   };

//   const handleActionClick = (certificate, type) => {
//     setCurrentCertificate(certificate);
//     setActionType(type);
//     setNotificationMethod('EMAIL');
//     setMessage('');
//     setActionDialogOpen(true);
//   };

//   const handleActionConfirm = async () => {
//     if (!currentCertificate) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/${currentCertificate.id}/status`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status: actionType,
//           notifyVia: notificationMethod,
//           message: message
//         }),
//       });
//       if (!response.ok) throw new Error('Failed to update status');
//       fetchCertificates();
//       showSnackbar(`Certificate ${actionType.toLowerCase()} successfully!`, 'success');
//     } catch (error) {
//       showSnackbar(`Failed to ${actionType.toLowerCase()} certificate`, 'error');
//     } finally {
//       setActionDialogOpen(false);
//     }
//   };

//   const handlePreviewCertificate = (certificate) => {
//     if (!certificate.fileUrl) {
//       showSnackbar('No file available for preview', 'error');
//       return;
//     }
//     setCurrentCertificate(certificate);
//     setPreviewOpen(true);
//   };

//   const handleDownloadCertificate = (certificate) => {
//     if (!certificate.fileUrl) {
//       showSnackbar('No file available for download', 'error');
//       return;
//     }
//     const filename = certificate.fileUrl.split(/[\\/]/).pop();
//     window.open(`${API_BASE_URL}/download/${filename}`, '_blank');
//   };

//   const formatDate = (date) => {
//     return date ? new Date(date).toLocaleDateString() : 'N/A';
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   const getFileIcon = (url) => {
//     if (!url) return <Description />;
//     if (url.toLowerCase().endsWith('.pdf')) return <PictureAsPdf color="error" />;
//     if (url.match(/\.(jpg|jpeg|png)$/i)) return <ImageIcon color="primary" />;
//     return <Description />;
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>Certificate Management</Typography>

//       <Grid container spacing={2} sx={{ mb: 2 }}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth placeholder="Search..."
//             value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
//           />
//         </Grid>
//         <Grid item xs={6} md={3}>
//           <FormControl fullWidth>
//             <InputLabel>Status</InputLabel>
//             <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
//               <MenuItem value="ALL">All</MenuItem>
//               <MenuItem value="PENDING">Pending</MenuItem>
//               <MenuItem value="VERIFIED">Verified</MenuItem>
//               <MenuItem value="REJECTED">Rejected</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={6} md={3}>
//           <Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={fetchCertificates}>
//             Refresh
//           </Button>
//         </Grid>
//       </Grid>

//       {loading ? (
//         <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
//       ) : (
//         <>
//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>User</TableCell>
//                   <TableCell>Certificate #</TableCell>
//                   <TableCell>Certificate Name</TableCell>
//                   <TableCell>File</TableCell>
//                   <TableCell>
//                     <Box display="flex" alignItems="center">
//                       Status
//                       <IconButton size="small" onClick={() => handleSort('verificationStatus')}>
//                         {sortConfig.key === 'verificationStatus' && sortConfig.direction === 'asc'
//                           ? <ArrowUpward /> : <ArrowDownward />}
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                   <TableCell>Upload Date</TableCell>
//                   <TableCell align="center">Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredCertificates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(cert => (
//                   <TableRow key={cert.id}>
//                     <TableCell>
//                       <Box display="flex" alignItems="center" gap={2}>
//                         <Avatar>{cert.user?.username?.charAt(0)}</Avatar>
//                         <Box>
//                           <Typography>{cert.user?.username}</Typography>
//                           <Typography variant="body2">{cert.user?.email}</Typography>
//                           <Typography variant="body2">{cert.user?.phone || cert.user?.phoneNumber}</Typography>
//                         </Box>
//                       </Box>
//                     </TableCell>
//                     <TableCell>{cert.certificateNumber}</TableCell>
//                     <TableCell>{cert.certificateName}</TableCell>
//                     <TableCell>{getFileIcon(cert.fileUrl)}</TableCell>
//                     <TableCell>
//                       <Chip label={cert.verificationStatus} color={statusColors[cert.verificationStatus]} />
//                     </TableCell>
//                     <TableCell>{formatDate(cert.uploadDate)}</TableCell>
//                     <TableCell align="center">
//                       <Tooltip title="Preview">
//                         <IconButton onClick={() => handlePreviewCertificate(cert)}><Visibility /></IconButton>
//                       </Tooltip>
//                       <Tooltip title="Download">
//                         <IconButton onClick={() => handleDownloadCertificate(cert)}><Download /></IconButton>
//                       </Tooltip>
//                       {cert.verificationStatus === 'PENDING' && (
//                         <>
//                           <Tooltip title="Verify">
//                             <IconButton color="success" onClick={() => handleActionClick(cert, 'VERIFIED')}>
//                               <CheckCircle />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Reject">
//                             <IconButton color="error" onClick={() => handleActionClick(cert, 'REJECTED')}>
//                               <Cancel />
//                             </IconButton>
//                           </Tooltip>
//                         </>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25]}
//             count={filteredCertificates.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={(e, newPage) => setPage(newPage)}
//             onRowsPerPageChange={(e) => {
//               setRowsPerPage(parseInt(e.target.value, 10));
//               setPage(0);
//             }}
//           />
//         </>
//       )}

//       {/* Action Dialog */}
//       <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
//         <DialogTitle>{actionType === 'VERIFIED' ? 'Verify' : 'Reject'} Certificate</DialogTitle>
//         <DialogContent dividers>
//           {currentCertificate && (
//             <>
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Notification Method</InputLabel>
//                 <Select
//                   value={notificationMethod}
//                   label="Notification Method"
//                   onChange={(e) => setNotificationMethod(e.target.value)}
//                 >
//                   <MenuItem value="EMAIL">Email</MenuItem>
//                   <MenuItem value="SMS">SMS</MenuItem>
//                 </Select>
//               </FormControl>

//               <TextField
//                 fullWidth
//                 label={notificationMethod === 'EMAIL' ? 'Recipient Email' : 'Phone Number'}
//                 value={
//                   notificationMethod === 'EMAIL'
//                     ? currentCertificate.user?.email || ''
//                     : currentCertificate.user?.phone || currentCertificate.user?.phoneNumber || ''
//                 }
//                 disabled
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 fullWidth
//                 multiline
//                 rows={4}
//                 label="Message / Comment"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//               />
//             </>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
//           <Button
//             variant="contained"
//             color={actionType === 'VERIFIED' ? 'success' : 'error'}
//             onClick={handleActionConfirm}
//           >
//             {actionType === 'VERIFIED' ? 'Verify' : 'Reject'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Preview Dialog */}
//       <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
//         <DialogTitle>Preview Certificate</DialogTitle>
//         <DialogContent>
//           {currentCertificate?.fileUrl ? (() => {
//             const filename = currentCertificate.fileUrl.split(/[\\/]/).pop();
//             return currentCertificate.fileUrl.toLowerCase().endsWith('.pdf') ? (
//               <iframe
//                 src={`${API_BASE_URL}/preview/${filename}`}
//                 width="100%" height="600px" style={{ border: 'none' }}
//                 title="Certificate Preview"
//               />
//             ) : (
//               <img
//                 src={`${API_BASE_URL}/preview/${filename}`}
//                 alt="Certificate"
//                 style={{ maxWidth: '100%', maxHeight: '80vh' }}
//               />
//             );
//           })() : (
//             <Typography>No file available</Typography>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setPreviewOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar}>
//         <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>{snackbar.message}</Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default CertificateManagement;



// import React, { useState, useEffect } from 'react';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
//   TextField, Button, Select, MenuItem, FormControl, InputLabel,
//   Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
//   Chip, Typography, Box, Grid, CircularProgress, TablePagination,
//   Snackbar, Alert, Avatar, Tooltip
// } from '@mui/material';
// import {
//   Search, CheckCircle, Cancel, Refresh,
//   Download, Visibility, PictureAsPdf, Image as ImageIcon,
//   ArrowUpward, ArrowDownward, Description
// } from '@mui/icons-material';

// const API_BASE_URL = 'http://localhost:8080/api/certificates';

// const statusColors = {
//   PENDING: 'default',
//   VERIFIED: 'success',
//   REJECTED: 'error'
// };

// const CertificateManagement = () => {
//   const [certificates, setCertificates] = useState([]);
//   const [filteredCertificates, setFilteredCertificates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'desc' });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [actionDialogOpen, setActionDialogOpen] = useState(false);
//   const [currentCertificate, setCurrentCertificate] = useState(null);
//   const [actionType, setActionType] = useState(null);
//   const [notificationMethod, setNotificationMethod] = useState('EMAIL');
//   const [message, setMessage] = useState('');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [previewOpen, setPreviewOpen] = useState(false);

//   useEffect(() => { fetchCertificates(); }, []);
//   useEffect(() => { filterAndSortCertificates(); }, [certificates, searchTerm, statusFilter, sortConfig]);

//   const fetchCertificates = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/all`);
//       if (!response.ok) throw new Error('Failed to fetch');
//       const data = await response.json();
//       setCertificates(data);
//     } catch (error) {
//       showSnackbar('Error fetching certificates', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterAndSortCertificates = () => {
//     let result = [...certificates];
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(cert =>
//         cert.certificateNumber?.toLowerCase().includes(term) ||
//         cert.certificateName?.toLowerCase().includes(term) ||
//         cert.user?.username?.toLowerCase().includes(term) ||
//         cert.user?.email?.toLowerCase().includes(term) ||
//         cert.user?.phone?.toLowerCase().includes(term) ||
//         cert.user?.phoneNumber?.toLowerCase().includes(term)
//       );
//     }
//     if (statusFilter !== 'ALL') {
//       result = result.filter(cert => cert.verificationStatus === statusFilter);
//     }
//     if (sortConfig.key) {
//       result.sort((a, b) => {
//         const aValue = getNestedValue(a, sortConfig.key);
//         const bValue = getNestedValue(b, sortConfig.key);
//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }
//     setFilteredCertificates(result);
//     setPage(0);
//   };

//   const getNestedValue = (obj, path) => {
//     return path.split('.').reduce((o, p) => o?.[p], obj) || '';
//   };

//   const handleSort = (key) => {
//     const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
//     setSortConfig({ key, direction });
//   };

//   const handleActionClick = (certificate, type) => {
//     setCurrentCertificate(certificate);
//     setActionType(type);
//     setNotificationMethod('EMAIL');
//     setMessage('');
//     setActionDialogOpen(true);
//   };

//   const handleActionConfirm = async () => {
//     if (!currentCertificate) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/${currentCertificate.id}/status`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status: actionType,
//           notifyVia: notificationMethod,
//           message: message
//         }),
//       });
//       if (!response.ok) throw new Error('Failed to update status');
//       fetchCertificates();
//       showSnackbar(`Certificate ${actionType.toLowerCase()} successfully!`, 'success');
//     } catch (error) {
//       showSnackbar(`Failed to ${actionType.toLowerCase()} certificate`, 'error');
//     } finally {
//       setActionDialogOpen(false);
//     }
//   };

//   const handlePreviewCertificate = (certificate) => {
//     if (!certificate.fileUrl) {
//       showSnackbar('No file available for preview', 'error');
//       return;
//     }
//     setCurrentCertificate(certificate);
//     setPreviewOpen(true);
//   };

//   const handleDownloadCertificate = (certificate) => {
//     if (!certificate.fileUrl) {
//       showSnackbar('No file available for download', 'error');
//       return;
//     }
//     const filename = encodeURIComponent(certificate.fileUrl.split(/[\\/]/).pop());
//     window.open(`${API_BASE_URL}/download/${filename}`, '_blank');
//   };

//   const formatDate = (date) => {
//     return date ? new Date(date).toLocaleDateString() : 'N/A';
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   const getFileIcon = (url) => {
//     if (!url) return <Description />;
//     if (url.toLowerCase().endsWith('.pdf')) return <PictureAsPdf color="error" />;
//     if (url.match(/\.(jpg|jpeg|png)$/i)) return <ImageIcon color="primary" />;
//     return <Description />;
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>Certificate Management</Typography>

//       <Grid container spacing={2} sx={{ mb: 2 }}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth placeholder="Search..."
//             value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
//           />
//         </Grid>
//         <Grid item xs={6} md={3}>
//           <FormControl fullWidth>
//             <InputLabel>Status</InputLabel>
//             <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
//               <MenuItem value="ALL">All</MenuItem>
//               <MenuItem value="PENDING">Pending</MenuItem>
//               <MenuItem value="VERIFIED">Verified</MenuItem>
//               <MenuItem value="REJECTED">Rejected</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={6} md={3}>
//           <Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={fetchCertificates}>
//             Refresh
//           </Button>
//         </Grid>
//       </Grid>

//       {loading ? (
//         <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
//       ) : (
//         <>
//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>User</TableCell>
//                   <TableCell>Certificate #</TableCell>
//                   <TableCell>Certificate Name</TableCell>
//                   <TableCell>File</TableCell>
//                   <TableCell>Status</TableCell>
//                   <TableCell>Upload Date</TableCell>
//                   <TableCell align="center">Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredCertificates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(cert => (
//                   <TableRow key={cert.id}>
//                     <TableCell>
//                       <Box display="flex" alignItems="center" gap={2}>
//                         <Avatar>{cert.user?.username?.charAt(0)}</Avatar>
//                         <Box>
//                           <Typography>{cert.user?.username}</Typography>
//                           <Typography variant="body2">{cert.user?.email}</Typography>
//                           <Typography variant="body2">{cert.user?.phone || cert.user?.phoneNumber}</Typography>
//                         </Box>
//                       </Box>
//                     </TableCell>
//                     <TableCell>{cert.certificateNumber}</TableCell>
//                     <TableCell>{cert.certificateName}</TableCell>
//                     <TableCell>{getFileIcon(cert.fileUrl)}</TableCell>
//                     <TableCell>
//                       <Chip label={cert.verificationStatus} color={statusColors[cert.verificationStatus]} />
//                     </TableCell>
//                     <TableCell>{formatDate(cert.uploadDate)}</TableCell>
//                     <TableCell align="center">
//                       <Tooltip title="Preview">
//                         <IconButton onClick={() => handlePreviewCertificate(cert)}><Visibility /></IconButton>
//                       </Tooltip>
//                       <Tooltip title="Download">
//                         <IconButton onClick={() => handleDownloadCertificate(cert)}><Download /></IconButton>
//                       </Tooltip>
//                       {cert.verificationStatus === 'PENDING' && (
//                         <>
//                           <Tooltip title="Verify">
//                             <IconButton color="success" onClick={() => handleActionClick(cert, 'VERIFIED')}>
//                               <CheckCircle />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Reject">
//                             <IconButton color="error" onClick={() => handleActionClick(cert, 'REJECTED')}>
//                               <Cancel />
//                             </IconButton>
//                           </Tooltip>
//                         </>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25]}
//             count={filteredCertificates.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={(e, newPage) => setPage(newPage)}
//             onRowsPerPageChange={(e) => {
//               setRowsPerPage(parseInt(e.target.value, 10));
//               setPage(0);
//             }}
//           />
//         </>
//       )}

//       <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
//         <DialogTitle>Preview Certificate</DialogTitle>
//         <DialogContent>
//           {currentCertificate?.fileUrl ? (() => {
//             const filename = encodeURIComponent(currentCertificate.fileUrl.split(/[\\/]/).pop());
//             return currentCertificate.fileUrl.toLowerCase().endsWith('.pdf') ? (
//               <iframe
//                 src={`${API_BASE_URL}/preview/${filename}`}
//                 width="100%" height="600px" style={{ border: 'none' }}
//                 title="Certificate Preview"
//               />
//             ) : (
//               <img
//                 src={`${API_BASE_URL}/preview/${filename}`}
//                 alt="Certificate"
//                 style={{ maxWidth: '100%', maxHeight: '80vh' }}
//               />
//             );
//           })() : (
//             <Typography>No file available</Typography>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setPreviewOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
//         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default CertificateManagement;






//sasa mpya//

// import React, { useState, useEffect } from 'react';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
//   TextField, Button, Select, MenuItem, FormControl, InputLabel,
//   Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
//   Chip, Typography, Box, Grid, CircularProgress, TablePagination,
//   Snackbar, Alert, Avatar, Tooltip, List, ListItem,ListItemText
// } from '@mui/material';
// import {
//   Search, CheckCircle, Cancel, Refresh,
//   Download, Visibility, PictureAsPdf, Image as ImageIcon,Description,
//   Mail, Phone, Sms
// } from '@mui/icons-material';

// const API_BASE_URL = 'http://localhost:8080/api/certificates';

// const statusColors = {
//   PENDING: 'default',
//   VERIFIED: 'success',
//   REJECTED: 'error'
// };

// const CertificateManagement = () => {
//   const [certificates, setCertificates] = useState([]);
//   const [filteredCertificates, setFilteredCertificates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'desc' });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [actionDialogOpen, setActionDialogOpen] = useState(false);
//   const [currentCertificate, setCurrentCertificate] = useState(null);
//   const [actionType, setActionType] = useState(null);
//   const [notificationMethod, setNotificationMethod] = useState('EMAIL');
//   const [message, setMessage] = useState('');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [previewOpen, setPreviewOpen] = useState(false);
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [previewError, setPreviewError] = useState(null);

//   useEffect(() => { fetchCertificates(); }, []);
//   useEffect(() => { filterAndSortCertificates(); }, [certificates, searchTerm, statusFilter, sortConfig]);

//   const fetchCertificates = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/all`);
//       if (!response.ok) throw new Error('Failed to fetch certificates');
//       const data = await response.json();
//       setCertificates(data);
//     } catch (error) {
//       showSnackbar(error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterAndSortCertificates = () => {
//     let result = [...certificates];
    
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(cert =>
//         (cert.certificateNumber?.toLowerCase().includes(term) ||
//         cert.certificateName?.toLowerCase().includes(term) ||
//         cert.user?.username?.toLowerCase().includes(term) ||
//         cert.user?.email?.toLowerCase().includes(term) ||
//         cert.user?.phone?.toLowerCase().includes(term) ||
//         cert.user?.phoneNumber?.toLowerCase().includes(term))
//       );
//     }

//     if (statusFilter !== 'ALL') {
//       result = result.filter(cert => cert.verificationStatus === statusFilter);
//     }

//     if (sortConfig.key) {
//       result.sort((a, b) => {
//         const aValue = getNestedValue(a, sortConfig.key);
//         const bValue = getNestedValue(b, sortConfig.key);
//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     setFilteredCertificates(result);
//     if (page !== 0 && page * rowsPerPage >= result.length) {
//       setPage(0);
//     }
//   };

//   const getNestedValue = (obj, path) => {
//     return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj);
//   };

//   const handleActionClick = (certificate, type) => {
//     setCurrentCertificate(certificate);
//     setActionType(type);
//     setNotificationMethod('EMAIL');
//     setMessage('');
//     setActionDialogOpen(true);
//   };

//   const handleActionConfirm = async () => {
//     if (!currentCertificate) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/${currentCertificate.id}/status`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status: actionType,
//           notifyVia: notificationMethod,
//           message: message
//         }),
//       });
//       if (!response.ok) throw new Error('Failed to update status');
//       fetchCertificates();
//       showSnackbar(`Certificate ${actionType.toLowerCase()} successfully!`, 'success');
//     } catch (error) {
//       showSnackbar(error.message, 'error');
//     } finally {
//       setActionDialogOpen(false);
//     }
//   };

//   const handlePreviewCertificate = async (certificate) => {
//     if (!certificate.fileUrl) {
//       showSnackbar('No file available for preview', 'error');
//       return;
//     }
    
//     setPreviewLoading(true);
//     setPreviewError(null);
//     setCurrentCertificate(certificate);
//     setPreviewOpen(true);
//     setPreviewLoading(false);
//   };

//   const handleDownloadCertificate = (certificate) => {
//     if (!certificate.fileUrl) {
//       showSnackbar('No file available for download', 'error');
//       return;
//     }
    
//     try {
//       const filename = encodeURIComponent(certificate.fileUrl.split(/[\\/]/).pop());
//       const downloadUrl = `${API_BASE_URL}/download/${filename}`;
      
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.setAttribute('download', filename);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       showSnackbar('Failed to download file', 'error');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }));
//   };

//   const getFileIcon = (url) => {
//     if (!url) return <Description />;
//     const lowerUrl = url.toLowerCase();
//     if (lowerUrl.endsWith('.pdf')) return <PictureAsPdf color="error" />;
//     if (lowerUrl.match(/\.(jpg|jpeg|png|gif)$/)) return <ImageIcon color="primary" />;
//     return <Description />;
//   };

//   const extractFilename = (url) => {
//     if (!url) return '';
//     return url.split(/[\\/]/).pop();
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>Certificate Management</Typography>

//       <Grid container spacing={2} sx={{ mb: 2 }}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             placeholder="Search certificates..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
//             }}
//           />
//         </Grid>
//         <Grid item xs={6} md={3}>
//           <FormControl fullWidth>
//             <InputLabel>Status</InputLabel>
//             <Select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               label="Status"
//             >
//               <MenuItem value="ALL">All</MenuItem>
//               <MenuItem value="PENDING">Pending</MenuItem>
//               <MenuItem value="VERIFIED">Verified</MenuItem>
//               <MenuItem value="REJECTED">Rejected</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={6} md={3}>
//           <Button
//             fullWidth
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={fetchCertificates}
//             sx={{ height: '56px' }}
//           >
//             Refresh
//           </Button>
//         </Grid>
//       </Grid>

//       {loading ? (
//         <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//           <CircularProgress />
//         </Box>
//       ) : (
//         <>
//           <TableContainer component={Paper} sx={{ mb: 2 }}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>User</TableCell>
//                   <TableCell>Certificate #</TableCell>
//                   <TableCell>Certificate Name</TableCell>
//                   <TableCell>File</TableCell>
//                   <TableCell>Status</TableCell>
//                   <TableCell>Upload Date</TableCell>
//                   <TableCell align="center">Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredCertificates.length > 0 ? (
//                   filteredCertificates
//                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((cert) => (
//                       <TableRow key={cert.id} hover>
//                         <TableCell>
//                           <Box display="flex" alignItems="center" gap={2}>
//                             <Avatar>
//                               {cert.user?.username?.charAt(0)?.toUpperCase()}
//                             </Avatar>
//                             <Box>
//                               <Typography fontWeight="medium">
//                                 {cert.user?.username}
//                               </Typography>
//                               <Typography variant="body2" color="text.secondary">
//                                 {cert.user?.email}
//                               </Typography>
//                               <Typography variant="body2" color="text.secondary">
//                                 {cert.user?.phone || cert.user?.phoneNumber || 'No phone'}
//                               </Typography>
//                             </Box>
//                           </Box>
//                         </TableCell>
//                         <TableCell>{cert.certificateNumber}</TableCell>
//                         <TableCell>{cert.certificateName}</TableCell>
//                         <TableCell>
//                           <Tooltip title={extractFilename(cert.fileUrl)}>
//                             <IconButton>
//                               {getFileIcon(cert.fileUrl)}
//                             </IconButton>
//                           </Tooltip>
//                         </TableCell>
//                         <TableCell>
//                           <Chip
//                             label={cert.verificationStatus}
//                             color={statusColors[cert.verificationStatus]}
//                             size="small"
//                           />
//                         </TableCell>
//                         <TableCell>{formatDate(cert.uploadDate)}</TableCell>
//                         <TableCell align="center">
//                           <Tooltip title="Preview">
//                             <IconButton
//                               onClick={() => handlePreviewCertificate(cert)}
//                               color="primary"
//                             >
//                               <Visibility />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Download">
//                             <IconButton
//                               onClick={() => handleDownloadCertificate(cert)}
//                               color="secondary"
//                             >
//                               <Download />
//                             </IconButton>
//                           </Tooltip>
//                           {cert.verificationStatus === 'PENDING' && (
//                             <>
//                               <Tooltip title="Verify">
//                                 <IconButton
//                                   color="success"
//                                   onClick={() => handleActionClick(cert, 'VERIFIED')}
//                                 >
//                                   <CheckCircle />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title="Reject">
//                                 <IconButton
//                                   color="error"
//                                   onClick={() => handleActionClick(cert, 'REJECTED')}
//                                 >
//                                   <Cancel />
//                                 </IconButton>
//                               </Tooltip>
//                             </>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center">
//                       <Typography color="text.secondary">
//                         No certificates found
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
          
//           {filteredCertificates.length > 0 && (
//             <TablePagination
//               rowsPerPageOptions={[5, 10, 25]}
//               component="div"
//               count={filteredCertificates.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={(_, newPage) => setPage(newPage)}
//               onRowsPerPageChange={(e) => {
//                 setRowsPerPage(parseInt(e.target.value, 10));
//                 setPage(0);
//               }}
//             />
//           )}
//         </>
//       )}

//       {/* Preview Dialog */}
//       <Dialog
//         open={previewOpen}
//         onClose={() => setPreviewOpen(false)}
//         maxWidth="lg"
//         fullWidth
//         PaperProps={{ sx: { height: '80vh' } }}
//       >
//         <DialogTitle>
//           Preview Certificate: {currentCertificate?.certificateName}
//         </DialogTitle>
//         <DialogContent dividers>
//           {previewLoading ? (
//             <Box
//               display="flex"
//               justifyContent="center"
//               alignItems="center"
//               height="100%"
//             >
//               <CircularProgress />
//             </Box>
//           ) : previewError ? (
//             <Box
//               display="flex"
//               justifyContent="center"
//               alignItems="center"
//               height="100%"
//               flexDirection="column"
//             >
//               <Typography color="error" gutterBottom>
//                 {previewError}
//               </Typography>
//               <Button
//                 variant="outlined"
//                 onClick={() => currentCertificate && handlePreviewCertificate(currentCertificate)}
//               >
//                 Retry
//               </Button>
//             </Box>
//           ) : currentCertificate?.fileUrl ? (
//             (() => {
//               const filename = encodeURIComponent(
//                 currentCertificate.fileUrl.split(/[\\/]/).pop()
//               );
//               const previewUrl = `${API_BASE_URL}/preview/${filename}`;
//               const isPDF = currentCertificate.fileUrl.toLowerCase().endsWith('.pdf');

//               return isPDF ? (
//                 <iframe
//                   src={previewUrl}
//                   width="100%"
//                   height="100%"
//                   style={{ border: 'none', minHeight: '60vh' }}
//                   title={`PDF Preview - ${currentCertificate.certificateName}`}
//                 />
//               ) : (
//                 <Box
//                   display="flex"
//                   justifyContent="center"
//                   alignItems="center"
//                   height="100%"
//                 >
//                   <img
//                     src={previewUrl}
//                     alt={`Preview - ${currentCertificate.certificateName}`}
//                     style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
//                   />
//                 </Box>
//               );
//             })()
//           ) : (
//             <Typography>No file available for preview</Typography>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setPreviewOpen(false)}>Close</Button>
//           {currentCertificate?.fileUrl && (
//             <Button
//               onClick={() => handleDownloadCertificate(currentCertificate)}
//               startIcon={<Download />}
//               color="primary"
//             >
//               Download
//             </Button>
//           )}
//         </DialogActions>
//       </Dialog>

//       {/* Action Confirmation Dialog */}
//       <Dialog
//         open={actionDialogOpen}
//         onClose={() => setActionDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>
//           {actionType === 'VERIFIED' ? 'Verify Certificate' : 'Reject Certificate'}
//         </DialogTitle>
//         <DialogContent dividers>
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
//               User Contact Information
//             </Typography>
//             <List dense>
//               <ListItem>
//                 <ListItemText 
//                   primary="Email"
//                   secondary={currentCertificate?.user?.email || 'Not available'}
//                   secondaryTypographyProps={{ color: currentCertificate?.user?.email ? 'text.primary' : 'error' }}
//                 />
//                 <Mail color={currentCertificate?.user?.email ? 'primary' : 'disabled'} />
//               </ListItem>
//               <ListItem>
//                 <ListItemText 
//                   primary="Phone Number"
//                   secondary={currentCertificate?.user?.phone || currentCertificate?.user?.phoneNumber || 'Not available'}
//                   secondaryTypographyProps={{ color: (currentCertificate?.user?.phone || currentCertificate?.user?.phoneNumber) ? 'text.primary' : 'error' }}
//                 />
//                 <Phone color={(currentCertificate?.user?.phone || currentCertificate?.user?.phoneNumber) ? 'primary' : 'disabled'} />
//               </ListItem>
//             </List>
//           </Box>

//           <FormControl fullWidth sx={{ mb: 3 }}>
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
//               <MenuItem value="SMS" disabled={!currentCertificate?.user?.phone && !currentCertificate?.user?.phoneNumber}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <Sms fontSize="small" /> SMS
//                 </Box>
//               </MenuItem>
//               <MenuItem value="BOTH" disabled={!currentCertificate?.user?.email || (!currentCertificate?.user?.phone && !currentCertificate?.user?.phoneNumber)}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <Mail fontSize="small" /> <Sms fontSize="small" /> Both
//                 </Box>
//               </MenuItem>
//             </Select>
//           </FormControl>

//           <TextField
//             fullWidth
//             label="Message to User"
//             multiline
//             rows={4}
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder={`Enter your message to ${currentCertificate?.user?.username || 'the user'}`}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
//           <Button
//             onClick={handleActionConfirm}
//             color={actionType === 'VERIFIED' ? 'success' : 'error'}
//             variant="contained"
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
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

// export default CertificateManagement;




//email nitification   mpyaaaaa




import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Typography, Box, Grid, CircularProgress, TablePagination,
  Snackbar, Alert, Avatar, Tooltip, List, ListItem, ListItemText
} from '@mui/material';
import {
  Search, CheckCircle, Cancel, Refresh,
  Download, Visibility, PictureAsPdf, Image as ImageIcon, Description,
  Mail, Phone, Sms
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:8080/api/certificates';
const EMAIL_API_URL = 'http://localhost:8080/api/email/send';

const statusColors = {
  PENDING: 'default',
  VERIFIED: 'success',
  REJECTED: 'error'
};

const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [notificationMethod, setNotificationMethod] = useState('EMAIL');
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => { fetchCertificates(); }, []);
  useEffect(() => { filterAndSortCertificates(); }, [certificates, searchTerm, statusFilter, sortConfig]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) throw new Error('Failed to fetch certificates');
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCertificates = () => {
    let result = [...certificates];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cert =>
        (cert.certificateNumber?.toLowerCase().includes(term) ||
        cert.certificateName?.toLowerCase().includes(term) ||
        cert.user?.username?.toLowerCase().includes(term) ||
        cert.user?.email?.toLowerCase().includes(term) ||
        cert.user?.phone?.toLowerCase().includes(term) ||
        cert.user?.phoneNumber?.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(cert => cert.verificationStatus === statusFilter);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredCertificates(result);
    if (page !== 0 && page * rowsPerPage >= result.length) {
      setPage(0);
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj);
  };

  const handleActionClick = (certificate, type) => {
    setCurrentCertificate(certificate);
    setActionType(type);
    setNotificationMethod('EMAIL');
    setMessage('');
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!currentCertificate) return;
    
    setEmailSending(true);
    try {
      // Update certificate status first
      const statusResponse = await fetch(`${API_BASE_URL}/${currentCertificate.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          notifyVia: notificationMethod,
          message: message
        }),
      });
      
      if (!statusResponse.ok) throw new Error('Failed to update certificate status');
      
      // Send email notification if selected
      if (notificationMethod === 'EMAIL' || notificationMethod === 'BOTH') {
        if (!currentCertificate.user?.email) {
          throw new Error('User email not available');
        }

        const emailSubject = `Certificate ${actionType === 'VERIFIED' ? 'Verification' : 'Rejection'}`;
        const emailBody = message || getDefaultEmailMessage(currentCertificate, actionType);
        
        const emailResponse = await fetch(EMAIL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            toEmail: currentCertificate.user.email,
            subject: emailSubject,
            body: emailBody
          })
        });
        
        if (!emailResponse.ok) {
          throw new Error('Failed to send email notification');
        }
      }
      
      fetchCertificates();
      showSnackbar(
        `Certificate ${actionType.toLowerCase()} and notification sent successfully!`, 
        'success'
      );
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setEmailSending(false);
      setActionDialogOpen(false);
    }
  };

  const getDefaultEmailMessage = (certificate, actionType) => {
    const statusMessage = actionType === 'VERIFIED' 
      ? 'has been verified successfully' 
      : 'has been rejected';
      
    return `Dear ${certificate.user?.username || 'User'},\n\n` +
           `Your certificate "${certificate.certificateName}" (${certificate.certificateNumber}) ` +
           `${statusMessage}.\n\n` +
           `Thank you for using our services.\n\n` +
           `Best regards,\n` +
           `Certificate Management Team`;
  };

  const handlePreviewCertificate = async (certificate) => {
    if (!certificate.fileUrl) {
      showSnackbar('No file available for preview', 'error');
      return;
    }
    
    setPreviewLoading(true);
    setPreviewError(null);
    setCurrentCertificate(certificate);
    setPreviewOpen(true);
    setPreviewLoading(false);
  };

  const handleDownloadCertificate = (certificate) => {
    if (!certificate.fileUrl) {
      showSnackbar('No file available for download', 'error');
      return;
    }
    
    try {
      const filename = encodeURIComponent(certificate.fileUrl.split(/[\\/]/).pop());
      const downloadUrl = `${API_BASE_URL}/download/${filename}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      showSnackbar('Failed to download file', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getFileIcon = (url) => {
    if (!url) return <Description />;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf')) return <PictureAsPdf color="error" />;
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif)$/)) return <ImageIcon color="primary" />;
    return <Description />;
  };

  const extractFilename = (url) => {
    if (!url) return '';
    return url.split(/[\\/]/).pop();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Certificate Management</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCertificates}
            sx={{ height: '56px' }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Certificate #</TableCell>
                  <TableCell>Certificate Name</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertificates.length > 0 ? (
                  filteredCertificates
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((cert) => (
                      <TableRow key={cert.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar>
                              {cert.user?.username?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="medium">
                                {cert.user?.username}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cert.user?.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cert.user?.phone || cert.user?.phoneNumber || 'No phone'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{cert.certificateNumber}</TableCell>
                        <TableCell>{cert.certificateName}</TableCell>
                        <TableCell>
                          <Tooltip title={extractFilename(cert.fileUrl)}>
                            <IconButton>
                              {getFileIcon(cert.fileUrl)}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cert.verificationStatus}
                            color={statusColors[cert.verificationStatus]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(cert.uploadDate)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Preview">
                            <IconButton
                              onClick={() => handlePreviewCertificate(cert)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                              onClick={() => handleDownloadCertificate(cert)}
                              color="secondary"
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                          {cert.verificationStatus === 'PENDING' && (
                            <>
                              <Tooltip title="Verify">
                                <IconButton
                                  color="success"
                                  onClick={() => handleActionClick(cert, 'VERIFIED')}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  color="error"
                                  onClick={() => handleActionClick(cert, 'REJECTED')}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        No certificates found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredCertificates.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCertificates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          )}
        </>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          Preview Certificate: {currentCertificate?.certificateName}
        </DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : previewError ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
            >
              <Typography color="error" gutterBottom>
                {previewError}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => currentCertificate && handlePreviewCertificate(currentCertificate)}
              >
                Retry
              </Button>
            </Box>
          ) : currentCertificate?.fileUrl ? (
            (() => {
              const filename = encodeURIComponent(
                currentCertificate.fileUrl.split(/[\\/]/).pop()
              );
              const previewUrl = `${API_BASE_URL}/preview/${filename}`;
              const isPDF = currentCertificate.fileUrl.toLowerCase().endsWith('.pdf');

              return isPDF ? (
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', minHeight: '60vh' }}
                  title={`PDF Preview - ${currentCertificate.certificateName}`}
                />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <img
                    src={previewUrl}
                    alt={`Preview - ${currentCertificate.certificateName}`}
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  />
                </Box>
              );
            })()
          ) : (
            <Typography>No file available for preview</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {currentCertificate?.fileUrl && (
            <Button
              onClick={() => handleDownloadCertificate(currentCertificate)}
              startIcon={<Download />}
              color="primary"
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'VERIFIED' ? 'Verify Certificate' : 'Reject Certificate'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              User Contact Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Email"
                  secondary={currentCertificate?.user?.email || 'Not available'}
                  secondaryTypographyProps={{ color: currentCertificate?.user?.email ? 'text.primary' : 'error' }}
                />
                <Mail color={currentCertificate?.user?.email ? 'primary' : 'disabled'} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Phone Number"
                  secondary={currentCertificate?.user?.phone || currentCertificate?.user?.phoneNumber || 'Not available'}
                  secondaryTypographyProps={{ color: (currentCertificate?.user?.phone || currentCertificate?.user?.phoneNumber) ? 'text.primary' : 'error' }}
                />
                <Phone color={(currentCertificate?.user?.phone || currentCertificate?.user?.phoneNumber) ? 'primary' : 'disabled'} />
              </ListItem>
            </List>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
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
              <MenuItem value="SMS" disabled={!currentCertificate?.user?.phone && !currentCertificate?.user?.phoneNumber}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Sms fontSize="small" /> SMS
                </Box>
              </MenuItem>
              <MenuItem value="BOTH" disabled={!currentCertificate?.user?.email || (!currentCertificate?.user?.phone && !currentCertificate?.user?.phoneNumber)}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Mail fontSize="small" /> <Sms fontSize="small" /> Both
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Message to User"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Enter your message to ${currentCertificate?.user?.username || 'the user'}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleActionConfirm}
            color={actionType === 'VERIFIED' ? 'success' : 'error'}
            variant="contained"
            disabled={emailSending}
          >
            {emailSending ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Sending...
              </>
            ) : (
              `Confirm ${actionType}`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default CertificateManagement;