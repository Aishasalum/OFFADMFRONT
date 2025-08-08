import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, IconButton, Chip, Typography, Box, Grid, 
  CircularProgress, Avatar, Tooltip, Snackbar, Alert
} from '@mui/material';
import {
  Search, Download, Visibility, PictureAsPdf, 
  Image as ImageIcon, Description, VerifiedUser, Refresh
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:8080/api/certificates';

const VerifiedCertificatesPage = () => {
  const [allCertificates, setAllCertificates] = useState([]);
  const [verifiedCertificates, setVerifiedCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch all certificates then filter verified ones
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/all`);
        if (!response.ok) throw new Error('Failed to fetch certificates');
        const data = await response.json();
        
        setAllCertificates(data);
        // Filter only verified certificates
        const verified = data.filter(cert => cert.verificationStatus === 'VERIFIED');
        setVerifiedCertificates(verified);
      } catch (error) {
        showSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, []);

  // Filter certificates by search term
  const filteredCertificates = verifiedCertificates.filter(cert => {
    const term = searchTerm.toLowerCase();
    return (
      cert.certificateNumber?.toLowerCase().includes(term) ||
      cert.certificateName?.toLowerCase().includes(term) ||
      cert.user?.username?.toLowerCase().includes(term)
    );
  });

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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

  const getFileIcon = (url) => {
    if (!url) return <Description />;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf')) return <PictureAsPdf color="error" />;
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif)$/)) return <ImageIcon color="primary" />;
    return <Description />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) throw new Error('Failed to fetch certificates');
      const data = await response.json();
      
      setAllCertificates(data);
      const verified = data.filter(cert => cert.verificationStatus === 'VERIFIED');
      setVerifiedCertificates(verified);
      showSnackbar('Verified certificates refreshed', 'success');
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Verified Certificates 
          <Chip 
            label={`${verifiedCertificates.length} verified`} 
            color="success" 
            variant="outlined"
            sx={{ ml: 2 }}
          />
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search verified certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Certificate #</TableCell>
                <TableCell>Certificate Name</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Verified Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => (
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
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{cert.certificateNumber}</TableCell>
                    <TableCell>{cert.certificateName}</TableCell>
                    <TableCell>
                      <Tooltip title={cert.fileUrl?.split(/[\\/]/).pop()}>
                        <IconButton>
                          {getFileIcon(cert.fileUrl)}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {formatDate(cert.verificationDate)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Download">
                        <IconButton
                          onClick={() => handleDownloadCertificate(cert)}
                          color="primary"
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      {searchTerm ? 'No matching verified certificates found' : 'No verified certificates available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerifiedCertificatesPage;