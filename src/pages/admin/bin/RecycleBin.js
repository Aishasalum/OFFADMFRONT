import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  RestoreFromTrash as RestoreIcon, 
  DeleteForever as DeleteIcon,
  Person as UserIcon,
  Description as CertificateIcon,
  MarkEmailRead as RequestIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const RecycleBin = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [deletedCertificates, setDeletedCertificates] = useState([]);
  const [deletedRequests, setDeletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchDeletedUsers(),
          fetchDeletedCertificates(),
          fetchDeletedRequests()
        ]);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchDeletedUsers = async () => {
    const res = await fetch('http://localhost:8080/api/users/deleted');
    const data = await res.json();
    setDeletedUsers(Array.isArray(data) ? data : []);
  };

  const fetchDeletedCertificates = async () => {
    const res = await fetch('http://localhost:8080/api/certificates/deleted');
    const data = await res.json();
    setDeletedCertificates(Array.isArray(data) ? data : []);
  };

  const fetchDeletedRequests = async () => {
    const res = await fetch('http://localhost:8080/api/verification-requests/deleted');
    const data = await res.json();
    setDeletedRequests(Array.isArray(data) ? data : []);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteClick = (type, id) => {
    setItemToDelete({ type, id });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      let endpoint = '';
      switch (itemToDelete.type) {
        case 'user':
          endpoint = `http://localhost:8080/api/users/permanent/${itemToDelete.id}`;
          break;
        case 'certificate':
          endpoint = `http://localhost:8080/api/certificates/permanent/${itemToDelete.id}`;
          break;
        case 'request':
          endpoint = `http://localhost:8080/api/verification-requests/permanent/${itemToDelete.id}`;
          break;
        default:
          break;
      }

      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Item permanently deleted',
          severity: 'success'
        });
        
        // Refresh the appropriate data
        switch (itemToDelete.type) {
          case 'user':
            await fetchDeletedUsers();
            break;
          case 'certificate':
            await fetchDeletedCertificates();
            break;
          case 'request':
            await fetchDeletedRequests();
            break;
          default:
            break;
        }
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete item',
        severity: 'error'
      });
    } finally {
      handleCloseDialog();
    }
  };

  const restoreItem = async (type, id) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'user':
          endpoint = `http://localhost:8080/api/users/restore/${id}`;
          break;
        case 'certificate':
          endpoint = `http://localhost:8080/api/certificates/restore/${id}`;
          break;
        case 'request':
          endpoint = `http://localhost:8080/api/verification-requests/restore/${id}`;
          break;
        default:
          break;
      }

      const response = await fetch(endpoint, { method: 'PUT' });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Item restored successfully',
          severity: 'success'
        });
        
        // Refresh the appropriate data
        switch (type) {
          case 'user':
            await fetchDeletedUsers();
            break;
          case 'certificate':
            await fetchDeletedCertificates();
            break;
          case 'request':
            await fetchDeletedRequests();
            break;
          default:
            break;
        }
      } else {
        throw new Error('Failed to restore');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to restore item',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <RestoreIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" component="h1">
          Recycle Bin
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<UserIcon />} iconPosition="start" label="Users" />
        <Tab icon={<CertificateIcon />} iconPosition="start" label="Certificates" />
        <Tab icon={<RequestIcon />} iconPosition="start" label="Requests" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Users Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Deleted Users
              </Typography>
              {deletedUsers.length > 0 ? (
                <StyledTableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Name</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Email</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deletedUsers.map(user => (
                        <StyledTableRow key={user.id}>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<RestoreIcon />}
                              onClick={() => restoreItem('user', user.id)}
                              sx={{ mr: 1 }}
                            >
                              Restore
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick('user', user.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No deleted users found
                </Typography>
              )}
            </Box>
          )}

          {/* Certificates Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Deleted Certificates
              </Typography>
              {deletedCertificates.length > 0 ? (
                <StyledTableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Number</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Name</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deletedCertificates.map(cert => (
                        <StyledTableRow key={cert.id}>
                          <TableCell>{cert.certificateNumber}</TableCell>
                          <TableCell>{cert.certificateName}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<RestoreIcon />}
                              onClick={() => restoreItem('certificate', cert.id)}
                              sx={{ mr: 1 }}
                            >
                              Restore
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick('certificate', cert.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No deleted certificates found
                </Typography>
              )}
            </Box>
          )}

          {/* Requests Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Deleted Verification Requests
              </Typography>
              {deletedRequests.length > 0 ? (
                <StyledTableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Request ID</TableCell>
                        <TableCell sx={{ color: 'primary.contrastText' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deletedRequests.map(req => (
                        <StyledTableRow key={req.id}>
                          <TableCell>{req.id}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<RestoreIcon />}
                              onClick={() => restoreItem('request', req.id)}
                              sx={{ mr: 1 }}
                            >
                              Restore
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick('request', req.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No deleted requests found
                </Typography>
              )}
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Permanent Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default RecycleBin;