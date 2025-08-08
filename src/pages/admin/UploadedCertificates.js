import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Typography, Box, Grid, CircularProgress, TablePagination,
  Snackbar, Alert, Avatar, Tooltip, List, ListItem, ListItemText,
  Card, CardContent, Divider, Badge, Tabs, Tab
} from '@mui/material';
import {
  Search, CheckCircle, Cancel, Refresh,
  Download, Visibility, PictureAsPdf, Image as ImageIcon, Description,
  Mail, Comment, VerifiedUser, PendingActions, DoNotDisturbAlt,
  Delete, RestoreFromTrash, DeleteForever, DeleteOutline
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:8080/api/certificates';

const AdminCertificateDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [deletedCertificates, setDeletedCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    pdfCount: 0,
    imageCount: 0,
    deletedCount: 0
  });
  const [tabValue, setTabValue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [auditLogs, setAuditLogs] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: 'VERIFIED',
    notifyVia: 'EMAIL',
    message: 'Your certificate has been verified.'
  });

  // Fetch all certificates with enhanced error handling
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to load certificates (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('Fetch error:', error);
      showSnackbar(error.message || 'Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch deleted certificates with authorization
  const fetchDeletedCertificates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trash`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load deleted certificates');
      }
      const data = await response.json();
      setDeletedCertificates(data);
    } catch (error) {
      console.error('Fetch deleted error:', error);
      showSnackbar(error.message || 'Failed to load deleted certificates', 'error');
    }
  };

  // Fetch audit logs for a certificate
  const fetchAuditLogs = async (certificateId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${certificateId}/audit`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load audit logs');
      }
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Audit log error:', error);
      showSnackbar(error.message || 'Failed to load verification history', 'error');
    }
  };

  // Filter and calculate statistics with status awareness
  const filterAndCalculateStats = () => {
    let result = showRecycleBin ? [...deletedCertificates] : [...certificates];
    let statsData = {
      total: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      pdfCount: 0,
      imageCount: 0,
      deletedCount: deletedCertificates.length
    };

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cert =>
        (cert.certificateNumber?.toLowerCase().includes(term) ||
        cert.certificateName?.toLowerCase().includes(term) ||
        cert.user?.username?.toLowerCase().includes(term) ||
        cert.user?.email?.toLowerCase().includes(term))
      );
    }

    if (!showRecycleBin && tabValue !== 'all') {
      result = result.filter(cert => cert.verificationStatus === tabValue.toUpperCase());
    }

    result.forEach(cert => {
      statsData.total++;
      if (cert.verificationStatus === 'VERIFIED') statsData.verified++;
      if (cert.verificationStatus === 'PENDING') statsData.pending++;
      if (cert.verificationStatus === 'REJECTED') statsData.rejected++;
      
      if (cert.fileUrl?.toLowerCase().endsWith('.pdf')) {
        statsData.pdfCount++;
      } else if (cert.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i)) {
        statsData.imageCount++;
      }
    });

    setFilteredCertificates(result);
    setStats(statsData);
    if (page !== 0 && page * rowsPerPage >= result.length) {
      setPage(0);
    }
  };

  // Handle certificate preview with loading state
  const handlePreviewCertificate = async (certificate) => {
    setCurrentCertificate(certificate);
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      await fetchAuditLogs(certificate.id);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
    setPreviewLoading(false);
  };

  // Handle certificate download with authorization
  const handleDownloadCertificate = async (certificate) => {
    if (!certificate.fileUrl) {
      showSnackbar('No file available for download', 'error');
      return;
    }
    
    try {
      const filename = encodeURIComponent(certificate.fileUrl.split(/[\\/]/).pop());
      const response = await fetch(`${API_BASE_URL}/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      showSnackbar(error.message || 'Failed to download file', 'error');
    }
  };

  // Enhanced certificate deletion handler
  const handleDeleteCertificate = async (certificate, permanent = false) => {
    try {
      const endpoint = permanent 
        ? `${API_BASE_URL}/${certificate.id}`
        : `${API_BASE_URL}/soft-delete/${certificate.id}`;
      
      const response = await fetch(endpoint, {
        method: permanent ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete certificate');
      }

      if (permanent) {
        setDeletedCertificates(prev => prev.filter(c => c.id !== certificate.id));
        showSnackbar('Certificate permanently deleted', 'success');
      } else {
        setCertificates(prev => prev.filter(c => c.id !== certificate.id));
        setDeletedCertificates(prev => [...prev, {
          ...certificate, 
          deleted: true,
          deletedDate: new Date().toISOString()
        }]);
        showSnackbar('Certificate moved to recycle bin', 'success');
      }
      
      setDeleteDialogOpen(false);
      setPermanentDeleteDialogOpen(false);
      
      // Refresh data
      fetchCertificates();
      fetchDeletedCertificates();
    } catch (error) {
      console.error('Delete error:', {
        certificateId: certificate.id,
        status: certificate.verificationStatus,
        error: error.message
      });
      showSnackbar(error.message || 'Failed to delete certificate', 'error');
    }
  };

  // Handle certificate restoration
  const handleRestoreCertificate = async (certificate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restore/${certificate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to restore certificate');
      }

      setDeletedCertificates(prev => prev.filter(c => c.id !== certificate.id));
      setCertificates(prev => [...prev, {...certificate, deleted: false}]);
      showSnackbar('Certificate restored successfully', 'success');
    } catch (error) {
      console.error('Restore error:', error);
      showSnackbar(error.message || 'Failed to restore certificate', 'error');
    }
  };

  // Handle status update with notification options
  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${currentCertificate.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(statusUpdateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update status');
      }

      const updatedCert = await response.json();
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === updatedCert.id ? updatedCert : cert
        )
      );
      
      showSnackbar('Certificate status updated successfully', 'success');
      setStatusUpdateDialogOpen(false);
      setPreviewOpen(false);
    } catch (error) {
      console.error('Status update error:', error);
      showSnackbar(error.message || 'Failed to update status', 'error');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Get appropriate file icon
  const getFileIcon = (url) => {
    if (!url) return <Description />;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf')) return <PictureAsPdf color="error" />;
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif)$/)) return <ImageIcon color="primary" />;
    return <Description />;
  };

  // Get appropriate status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'VERIFIED': return <VerifiedUser color="success" />;
      case 'PENDING': return <PendingActions color="warning" />;
      case 'REJECTED': return <DoNotDisturbAlt color="error" />;
      default: return <Description />;
    }
  };

  // Load data on component mount
  useEffect(() => { 
    fetchCertificates(); 
    fetchDeletedCertificates();
  }, []);

  // Filter and calculate stats when dependencies change
  useEffect(() => { 
    filterAndCalculateStats(); 
  }, [certificates, deletedCertificates, searchTerm, tabValue, showRecycleBin]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Certificate Administration Dashboard
        {showRecycleBin && (
          <Chip 
            label="Recycle Bin" 
            color="error" 
            variant="outlined"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={3} sx={{ borderLeft: '4px solid #3f51b5' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                {showRecycleBin ? 'Deleted Items' : 'Total Certificates'}
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {!showRecycleBin && (
          <>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card elevation={3} sx={{ borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">Verified</Typography>
                  <Typography variant="h4">{stats.verified}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card elevation={3} sx={{ borderLeft: '4px solid #ff9800' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">Pending</Typography>
                  <Typography variant="h4">{stats.pending}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card elevation={3} sx={{ borderLeft: '4px solid #f44336' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">Rejected</Typography>
                  <Typography variant="h4">{stats.rejected}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card elevation={3} sx={{ borderLeft: '4px solid #e91e63' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">PDF Files</Typography>
                  <Typography variant="h4">{stats.pdfCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card elevation={3} sx={{ borderLeft: '4px solid #2196f3' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">Image Files</Typography>
                  <Typography variant="h4">{stats.imageCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        {showRecycleBin && (
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card elevation={3} sx={{ borderLeft: '4px solid #4caf50' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Space Used</Typography>
                <Typography variant="h4">
                  {(stats.total * 0.5).toFixed(1)} MB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Search and Filter Section */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={showRecycleBin ? "Search deleted certificates..." : "Search certificates..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {!showRecycleBin && (
                  <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="All" value="all" />
                    <Tab label="Verified" value="verified" icon={<VerifiedUser fontSize="small" />} />
                    <Tab label="Pending" value="pending" icon={<PendingActions fontSize="small" />} />
                    <Tab label="Rejected" value="rejected" icon={<DoNotDisturbAlt fontSize="small" />} />
                  </Tabs>
                )}
                
                <Button
                  variant="outlined"
                  color={showRecycleBin ? "primary" : "error"}
                  startIcon={showRecycleBin ? <DeleteOutline /> : <Delete />}
                  onClick={() => {
                    setShowRecycleBin(!showRecycleBin);
                    setPage(0);
                    setSearchTerm('');
                    setTabValue('all');
                  }}
                  sx={{ ml: 2 }}
                >
                  {showRecycleBin ? 'Back to Certificates' : `Recycle Bin (${stats.deletedCount})`}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
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
                  <TableCell>Certificate Details</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>File</TableCell>
                  {!showRecycleBin && <TableCell>Status</TableCell>}
                  <TableCell>Dates</TableCell>
                  {showRecycleBin && <TableCell>Deleted Date</TableCell>}
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
                          <Typography fontWeight="medium">{cert.certificateName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            #{cert.certificateNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar>
                              {cert.user?.username?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography>{cert.user?.username}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cert.user?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={cert.fileUrl?.split(/[\\/]/).pop()}>
                            <IconButton>
                              {getFileIcon(cert.fileUrl)}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        {!showRecycleBin && (
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getStatusIcon(cert.verificationStatus)}
                              <Chip
                                label={cert.verificationStatus}
                                color={
                                  cert.verificationStatus === 'VERIFIED' ? 'success' :
                                  cert.verificationStatus === 'PENDING' ? 'warning' : 'error'
                                }
                                size="small"
                              />
                            </Box>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2">
                            Upload: {formatDate(cert.uploadDate)}
                          </Typography>
                          {cert.verificationDate && (
                            <Typography variant="body2">
                              {cert.verificationStatus === 'VERIFIED' ? 'Verified' : 'Rejected'}: {formatDate(cert.verificationDate)}
                            </Typography>
                          )}
                        </TableCell>
                        {showRecycleBin && (
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(cert.deletedDate)}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Tooltip title="View Details">
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
                          
                          {showRecycleBin ? (
                            <>
                              <Tooltip title="Restore">
                                <IconButton
                                  onClick={() => handleRestoreCertificate(cert)}
                                  color="success"
                                >
                                  <RestoreFromTrash />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Permanently">
                                <IconButton
                                  onClick={() => {
                                    setCertToDelete(cert);
                                    setPermanentDeleteDialogOpen(true);
                                  }}
                                  color="error"
                                >
                                  <DeleteForever />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip title="Move to Recycle Bin">
                              <IconButton
                                onClick={() => {
                                  setCertToDelete(cert);
                                  setDeleteDialogOpen(true);
                                }}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={showRecycleBin ? 7 : 6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {showRecycleBin ? 'Recycle bin is empty' : 'No certificates found matching your criteria'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredCertificates.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* Certificate Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          Certificate Details: {currentCertificate?.certificateName}
          {currentCertificate?.deleted && (
            <Chip 
              label="Deleted" 
              color="error" 
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Document Preview</Typography>
                {currentCertificate?.fileUrl ? (
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
                        height="500px"
                        style={{ border: 'none' }}
                        title={`PDF Preview - ${currentCertificate.certificateName}`}
                      />
                    ) : (
                      <Box display="flex" justifyContent="center">
                        <img
                          src={previewUrl}
                          alt={`Preview - ${currentCertificate.certificateName}`}
                          style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                        />
                      </Box>
                    );
                  })()
                ) : (
                  <Typography color="text.secondary">No file available</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Certificate Information</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Certificate Name" 
                      secondary={currentCertificate?.certificateName || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Certificate Number" 
                      secondary={currentCertificate?.certificateNumber || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={currentCertificate?.verificationStatus || 'N/A'}
                            color={
                              currentCertificate?.verificationStatus === 'VERIFIED' ? 'success' :
                              currentCertificate?.verificationStatus === 'PENDING' ? 'warning' : 'error'
                            }
                          />
                          {currentCertificate?.deleted && (
                            <Chip 
                              label="DELETED"
                              color="error"
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Upload Date" 
                      secondary={formatDate(currentCertificate?.uploadDate)}
                    />
                  </ListItem>
                  {currentCertificate?.verificationDate && (
                    <ListItem>
                      <ListItemText 
                        primary={`${currentCertificate?.verificationStatus === 'VERIFIED' ? 'Verified' : 'Rejected'} Date`}
                        secondary={formatDate(currentCertificate?.verificationDate)}
                      />
                    </ListItem>
                  )}
                  {currentCertificate?.deletedDate && (
                    <ListItem>
                      <ListItemText 
                        primary="Deleted Date"
                        secondary={formatDate(currentCertificate?.deletedDate)}
                      />
                    </ListItem>
                  )}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>User Information</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Username" 
                      secondary={currentCertificate?.user?.username || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Email" 
                      secondary={currentCertificate?.user?.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Phone" 
                      secondary={currentCertificate?.user?.phone || currentCertificate?.user?.phoneNumber || 'N/A'}
                    />
                  </ListItem>
                </List>

                {auditLogs.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Verification Details</Typography>
                    <List dense>
                      {auditLogs.map((log, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${log.action} by ${log.adminName || 'System'}`}
                            secondary={
                              <>
                                <Typography component="span" variant="body2">
                                  {formatDate(log.timestamp)}
                                </Typography>
                                {log.comments && (
                                  <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Comment fontSize="small" color="action" />
                                      {log.comments}
                                    </Box>
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Grid>
            </Grid>
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
          {!currentCertificate?.deleted && currentCertificate?.verificationStatus === 'PENDING' && (
            <Button
              onClick={() => setStatusUpdateDialogOpen(true)}
              startIcon={<VerifiedUser />}
              color="primary"
            >
              Update Status
            </Button>
          )}
          {currentCertificate?.deleted ? (
            <>
              <Button
                onClick={() => handleRestoreCertificate(currentCertificate)}
                startIcon={<RestoreFromTrash />}
                color="success"
              >
                Restore
              </Button>
              <Button
                onClick={() => {
                  setPreviewOpen(false);
                  setCertToDelete(currentCertificate);
                  setPermanentDeleteDialogOpen(true);
                }}
                startIcon={<DeleteForever />}
                color="error"
              >
                Delete Permanently
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setPreviewOpen(false);
                setCertToDelete(currentCertificate);
                setDeleteDialogOpen(true);
              }}
              startIcon={<Delete />}
              color="error"
            >
              Move to Recycle Bin
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialogOpen}
        onClose={() => setStatusUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Certificate Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusUpdateData.status}
                onChange={(e) => setStatusUpdateData({...statusUpdateData, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Notification Method</InputLabel>
              <Select
                value={statusUpdateData.notifyVia}
                onChange={(e) => setStatusUpdateData({...statusUpdateData, notifyVia: e.target.value})}
                label="Notification Method"
              >
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="NONE">None</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={statusUpdateData.message}
              onChange={(e) => setStatusUpdateData({...statusUpdateData, message: e.target.value})}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            color="primary"
            variant="contained"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Move to Recycle Bin</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to move this certificate to the recycle bin?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Certificate: <strong>{certToDelete?.certificateName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Certificate Number: <strong>#{certToDelete?.certificateNumber}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDeleteCertificate(certToDelete);
              setDeleteDialogOpen(false);
            }}
            color="error"
            startIcon={<Delete />}
          >
            Move to Bin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={() => setPermanentDeleteDialogOpen(false)}
      >
        <DialogTitle>Permanently Delete Certificate</DialogTitle>
        <DialogContent>
          <Typography color="error" fontWeight="bold">
            Warning: This action cannot be undone!
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to permanently delete this certificate?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Certificate: <strong>{certToDelete?.certificateName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Certificate Number: <strong>#{certToDelete?.certificateNumber}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermanentDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDeleteCertificate(certToDelete, true);
              setPermanentDeleteDialogOpen(false);
            }}
            color="error"
            startIcon={<DeleteForever />}
          >
            Delete Permanently
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

export default AdminCertificateDashboard;