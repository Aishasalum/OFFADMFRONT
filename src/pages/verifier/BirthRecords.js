import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Box, Grid, CircularProgress, IconButton,
  Typography, Chip, Avatar, Tooltip, TablePagination
} from '@mui/material';
import {
  Search, Refresh, Upload, Visibility,
  Verified, Dangerous, Warning
} from '@mui/icons-material';

const BirthRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/birth-records');
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const term = searchTerm.toLowerCase();
    return (
      record.certificateNumber?.toLowerCase().includes(term) ||
      record.childName?.toLowerCase().includes(term) ||
      record.fatherName?.toLowerCase().includes(term) ||
      record.motherName?.toLowerCase().includes(term)
    );
  });

  const handleViewDetails = (id) => {
    navigate(`/verifier/birth-record/${id}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        Birth Records Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by Certificate #, Child Name, Parent Names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Upload />}
            onClick={() => navigate('/verifier/uploaded-certificates')}
            fullWidth
            sx={{ height: '56px' }}
          >
            Uploaded Certs
          </Button>
        </Grid>
        <Grid item xs={6} md={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRecords}
            fullWidth
            sx={{ height: '56px' }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading birth records...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ 
          p: 3, 
          backgroundColor: '#ffeeee', 
          borderRadius: 2,
          textAlign: 'center',
          borderLeft: '4px solid #ff5252'
        }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            <Dangerous sx={{ verticalAlign: 'middle', mr: 1 }} />
            Error Loading Records
          </Typography>
          <Typography sx={{ mb: 2 }}>{error}</Typography>
          <Button 
            variant="contained" 
            color="error" 
            onClick={fetchRecords}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
           <TableContainer component={Paper} sx={{ mb: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Certificate #</TableCell>
                            <TableCell>Child Name</TableCell>
                            <TableCell>Date of Birth</TableCell>
                            <TableCell>Father's Name</TableCell>
                            <TableCell>Mother's Name</TableCell>
                            <TableCell>Place of Birth</TableCell>
                            <TableCell>Date of Issue</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record) => (
                      <TableRow hover key={record.id}>
                        <TableCell>
                          <Chip
                            label={record.certificateNumber || 'N/A'}
                            color={record.certificateNumber ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{record.childName || 'N/A'}</TableCell>
                        <TableCell>{formatDate(record.dateOfBirth)}</TableCell>
                        <TableCell>{record.fatherName || 'N/A'}</TableCell>
                        <TableCell>{record.motherName || 'N/A'}</TableCell>
                        <TableCell>{record.placeOfBirth || 'N/A'}</TableCell>
                        <TableCell>{formatDate(record.dateOfIssue)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewDetails(record.id)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="subtitle1" color="textSecondary">
                        {records.length > 0 
                          ? 'No records match your search criteria' 
                          : 'No birth records found in the system'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRecords.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '.MuiTablePagination-displayedRows': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                },
                '.MuiTablePagination-selectLabel': {
                  fontSize: '0.875rem'
                }
              }}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => (
                `${from}-${to} of ${count}`
              )}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default BirthRecords;