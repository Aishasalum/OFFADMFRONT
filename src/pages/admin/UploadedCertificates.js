import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Typography, Box, Grid, CircularProgress, TablePagination,
  Snackbar, Alert, Avatar, Tooltip, DialogContentText
} from '@mui/material';
import {
  Search, CheckCircle, Cancel, Refresh,
  Download, Visibility, PictureAsPdf, Image as ImageIcon,
  ArrowUpward, ArrowDownward, Description, Edit, Delete, Add,
  RestoreFromTrash, DeleteForever
} from '@mui/icons-material';

const API_URL = 'http://localhost:8080/api/certificates';

const AdminCertificatesPage = () => {
  // State for certificates data
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    userId: '',
    certificateNumber: '',
    certificateName: '',
    file: null
  });
  
  // Snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch certificates from backend
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = statusFilter === 'deleted' 
        ? `${API_URL}/trash` 
        : `${API_URL}/all`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch certificates');
      }
      
      const data = await response.json();
      setCertificates(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sorting handler
  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Filter and sort certificates
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.certificateName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cert.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.userId?.toString().includes(searchTerm);
    return matchesSearch;
  });

  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    const isAsc = sortDirection === 'asc';
    if (a[sortField] < b[sortField]) return isAsc ? -1 : 1;
    if (a[sortField] > b[sortField]) return isAsc ? 1 : -1;
    return 0;
  });

  // Paginated certificates
  const paginatedCertificates = sortedCertificates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // View certificate details
  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setViewDialogOpen(true);
  };

  // File download handler
  const handleDownload = async (fileUrl) => {
    try {
      if (!fileUrl) {
        throw new Error('No file available for download');
      }
      
      const response = await fetch(`${API_URL}/files/download/${encodeURIComponent(fileUrl)}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileUrl.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      showSnackbar('Download started', 'success');
    } catch (err) {
      console.error('Download error:', err);
      showSnackbar(err.message || 'Failed to download file', 'error');
    }
  };

  // File preview handler
  const handlePreview = (fileUrl) => {
    if (!fileUrl) {
      showSnackbar('No file available for preview', 'error');
      return;
    }
    
    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    
    if (isImage || fileExtension === 'pdf') {
      window.open(`${API_URL}/files/preview/${encodeURIComponent(fileUrl)}`, '_blank');
    } else {
      showSnackbar('Preview not available for this file type', 'warning');
    }
  };

  // Edit certificate
  const handleEditCertificate = (certificate) => {
    setFormData({
      userId: certificate.userId,
      certificateNumber: certificate.certificateNumber,
      certificateName: certificate.certificateName,
      file: null
    });
    setSelectedCertificate(certificate);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', formData.userId);
      formDataToSend.append('certificateNumber', formData.certificateNumber);
      formDataToSend.append('certificateName', formData.certificateName);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await fetch(`${API_URL}/${selectedCertificate.id}`, {
        method: 'PUT',
        body: formDataToSend
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update certificate');
      }
      
      fetchCertificates();
      setEditDialogOpen(false);
      showSnackbar('Certificate updated successfully', 'success');
    } catch (err) {
      console.error('Update error:', err);
      showSnackbar(err.message || 'Failed to update certificate', 'error');
    }
  };

  // Soft delete certificate
  const handleSoftDelete = (certificate) => {
    setSelectedCertificate(certificate);
    setDeleteDialogOpen(true);
  };

  const confirmSoftDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/soft-delete/${selectedCertificate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete certificate');
      }
      
      const result = await response.json();
      fetchCertificates();
      setDeleteDialogOpen(false);
      showSnackbar(result.message || 'Certificate moved to trash', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      showSnackbar(err.message || 'Failed to delete certificate', 'error');
    }
  };

  // Restore certificate
  const handleRestoreCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    try {
      const response = await fetch(`${API_URL}/restore/${selectedCertificate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore certificate');
      }
      
      const result = await response.json();
      fetchCertificates();
      setRestoreDialogOpen(false);
      showSnackbar(result.message || 'Certificate restored successfully', 'success');
    } catch (err) {
      console.error('Restore error:', err);
      showSnackbar(err.message || 'Failed to restore certificate', 'error');
    }
  };

  // Permanent delete
  const handlePermanentDelete = (certificate) => {
    setSelectedCertificate(certificate);
    setPermanentDeleteDialogOpen(true);
  };

  const confirmPermanentDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/permanent/${selectedCertificate.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to permanently delete certificate');
      }
      
      const result = await response.json();
      fetchCertificates();
      setPermanentDeleteDialogOpen(false);
      showSnackbar(result.message || 'Certificate permanently deleted', 'success');
    } catch (err) {
      console.error('Permanent delete error:', err);
      showSnackbar(err.message || 'Failed to delete certificate', 'error');
    }
  };

  // Add new certificate
  const handleAddCertificate = () => {
    setFormData({
      userId: '',
      certificateNumber: '',
      certificateName: '',
      file: null
    });
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', formData.userId);
      formDataToSend.append('certificateNumber', formData.certificateNumber);
      formDataToSend.append('certificateName', formData.certificateName);
      formDataToSend.append('file', formData.file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formDataToSend
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add certificate');
      }
      
      fetchCertificates();
      setAddDialogOpen(false);
      showSnackbar('Certificate added successfully', 'success');
    } catch (err) {
      console.error('Add error:', err);
      showSnackbar(err.message || 'Failed to add certificate', 'error');
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  // Snackbar functions
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // File type icon
  const getFileIcon = (filename) => {
    if (!filename) return <Description />;
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return <PictureAsPdf color="error" />;
      case 'jpg': case 'jpeg': case 'png': return <ImageIcon color="primary" />;
      default: return <Description />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Certificates Management
      </Typography>
      
      {/* Filters and Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, number or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">Active Certificates</MenuItem>
              <MenuItem value="deleted">Trash</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddCertificate}
            sx={{ mr: 2 }}
            disabled={statusFilter === 'deleted'}
          >
            Add Certificate
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCertificates}
            disabled={loading}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>
      
      {/* Certificates Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchCertificates} color="inherit" size="small" sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Button onClick={() => handleSort('certificateNumber')}>
                      Certificate #
                      {sortField === 'certificateNumber' && (
                        sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleSort('certificateName')}>
                      Name
                      {sortField === 'certificateName' && (
                        sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>
                    <Button onClick={() => handleSort('createdAt')}>
                      Upload Date
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCertificates.length > 0 ? (
                  paginatedCertificates.map((cert) => (
                    <TableRow key={cert.id} hover>
                      <TableCell>{cert.certificateNumber || 'N/A'}</TableCell>
                      <TableCell>{cert.certificateName || 'N/A'}</TableCell>
                      <TableCell>{cert.userId || 'N/A'}</TableCell>
                      <TableCell>
                        {formatDate(cert.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton onClick={() => handleViewCertificate(cert)}>
                            <Visibility color="info" />
                          </IconButton>
                        </Tooltip>
                        
                        {statusFilter === 'all' ? (
                          <>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEditCertificate(cert)}>
                                <Edit color="primary" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Move to Trash">
                              <IconButton onClick={() => handleSoftDelete(cert)}>
                                <Delete color="error" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Restore">
                              <IconButton onClick={() => handleRestoreCertificate(cert)}>
                                <RestoreFromTrash color="success" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Permanently Delete">
                              <IconButton onClick={() => handlePermanentDelete(cert)}>
                                <DeleteForever color="error" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No certificates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {paginatedCertificates.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCertificates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </>
      )}
      
      {/* View Certificate Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Certificate Details</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Certificate Information</Typography>
                <Typography><strong>Number:</strong> {selectedCertificate.certificateNumber || 'N/A'}</Typography>
                <Typography><strong>Name:</strong> {selectedCertificate.certificateName || 'N/A'}</Typography>
                <Typography><strong>User ID:</strong> {selectedCertificate.userId || 'N/A'}</Typography>
                <Typography><strong>Upload Date:</strong> {formatDate(selectedCertificate.createdAt)}</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip
                    label={selectedCertificate.deleted ? 'Deleted' : 'Active'}
                    color={selectedCertificate.deleted ? 'error' : 'success'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Certificate File</Typography>
                <Box sx={{ 
                  border: '1px dashed grey', 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px'
                }}>
                  {selectedCertificate.fileUrl ? (
                    <>
                      {getFileIcon(selectedCertificate.fileUrl)}
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {selectedCertificate.fileUrl.split('/').pop()}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                          onClick={() => handlePreview(selectedCertificate.fileUrl)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={() => handleDownload(selectedCertificate.fileUrl)}
                        >
                          Download
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Typography>No file available</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Certificate Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Certificate</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User ID"
                name="userId"
                value={formData.userId}
                onChange={handleFormChange}
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Number"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Name"
                name="certificateName"
                value={formData.certificateName}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                Upload New File (Optional)
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {formData.file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {formData.file.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            color="primary" 
            variant="contained"
            disabled={!formData.userId || !formData.certificateNumber || !formData.certificateName}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Certificate Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Certificate</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User ID"
                name="userId"
                value={formData.userId}
                onChange={handleFormChange}
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Number"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Name"
                name="certificateName"
                value={formData.certificateName}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                Upload Certificate File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  required
                />
              </Button>
              {formData.file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {formData.file.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddSubmit} 
            color="primary" 
            variant="contained"
            disabled={!formData.userId || !formData.certificateNumber || !formData.certificateName || !formData.file}
          >
            Add Certificate
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Soft Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Move to Trash</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to move this certificate to trash? You can restore it later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmSoftDelete} color="error" variant="contained">
            Move to Trash
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restore Certificate</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore this certificate?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRestore} color="success" variant="contained">
            Restore
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={permanentDeleteDialogOpen} onClose={() => setPermanentDeleteDialogOpen(false)}>
        <DialogTitle>Permanently Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this certificate? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermanentDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmPermanentDelete} color="error" variant="contained">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCertificatesPage;