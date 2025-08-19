

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