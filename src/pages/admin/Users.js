

//new



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Typography, Box, Grid, CircularProgress, TablePagination,
  DialogContentText, Snackbar, Alert, Avatar, Tooltip, styled,
  Card, CardContent, Divider, Badge, CardHeader
} from '@mui/material';
import {
  Search, FilterList, Edit, Delete, CheckCircle, Cancel,
  Refresh, Add, ArrowUpward, ArrowDownward, RestoreFromTrash, 
  DeleteForever, Person, AdminPanelSettings, Visibility, 
  VisibilityOff, Lock, LockOpen, PersonAdd
} from '@mui/icons-material';
import { pink, teal, indigo, orange, deepPurple, green, red, blue, amber } from '@mui/material/colors';

const API_BASE_URL = 'http://localhost:8080/api/users';

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

const UserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
   
    deletedUsers: 0,
    
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'USER',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Fetch users based on status filter
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        if (statusFilter === 'active') {
          endpoint = `${API_BASE_URL}/active`;
        } else if (statusFilter === 'deleted') {
          endpoint = `${API_BASE_URL}/deleted`;
        } else {
          endpoint = `${API_BASE_URL}`;
        }
        
        const response = await axios.get(endpoint);
        setUsers(response.data);
        calculateStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        showSnackbar('Failed to fetch users', 'error');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [statusFilter]);

  // Calculate statistics
  const calculateStats = (usersData) => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(u => !u.deleted).length;
    const deletedUsers = usersData.filter(u => u.deleted).length;
    const adminUsers = usersData.filter(u => u.role === 'ADMIN').length;

    setStats({
      totalUsers,
      
      deletedUsers,
    
    });
  };

  // Filter and sort users
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.phoneNumber && user.phoneNumber.includes(term))
      );
    }

    // Apply role filter
    if (roleFilter !== 'ALL') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
    setPage(0);
  }, [users, searchTerm, roleFilter, sortConfig]);

  // Modal handlers
  const handleOpenAddDialog = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'USER',
      password: ''
    });
    setCurrentUser(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'USER',
      password: ''
    });
    setCurrentUser(user);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (userId) => {
    setCurrentUser(users.find(u => u.id === userId));
    setOpenDeleteDialog(true);
  };

  const handleOpenRestoreDialog = (userId) => {
    setCurrentUser(users.find(u => u.id === userId));
    setOpenRestoreDialog(true);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentUser) {
        // Update user
        const response = await axios.put(`${API_BASE_URL}/${currentUser.id}`, formData);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? response.data : u));
        showSnackbar('User updated successfully', 'success');
      } else {
        // Create user
        const response = await axios.post(`${API_BASE_URL}/register`, formData);
        setUsers(prev => [...prev, response.data]);
        showSnackbar('User created successfully', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      showSnackbar(error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${currentUser.id}`);
      setUsers(prev => prev.filter(u => u.id !== currentUser.id));
      showSnackbar('User moved to trash', 'success');
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error(error);
      showSnackbar(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const handleRestore = async () => {
    try {
      await axios.put(`${API_BASE_URL}/restore/${currentUser.id}`);
      setUsers(prev => prev.filter(u => u.id !== currentUser.id));
      showSnackbar('User restored successfully', 'success');
      setOpenRestoreDialog(false);
    } catch (error) {
      console.error(error);
      showSnackbar(error.response?.data?.message || 'Failed to restore user', 'error');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/permanent-delete/${currentUser.id}`);
      setUsers(prev => prev.filter(u => u.id !== currentUser.id));
      showSnackbar('User permanently deleted', 'success');
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error(error);
      showSnackbar(error.response?.data?.message || 'Failed to permanently delete user', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getRoleColor = (role) => {
    return role === 'ADMIN' ? deepPurple[500] : teal[500];
  };

  const getStatusColor = (status) => {
    return status === 'active' ? green[500] : red[500];
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
        <Person fontSize="large" /> User Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            borderLeft: `4px solid ${blue[500]}`,
            '&:hover': { boxShadow: 6 }
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <Typography variant="h6" color="textSecondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalUsers}
                  </Typography>
                </div>
                <Person sx={{ 
                  fontSize: 48,
                  color: blue[500],
                  opacity: 0.3
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            borderLeft: `4px solid ${red[500]}`,
            '&:hover': { boxShadow: 6 }
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <Typography variant="h6" color="textSecondary">
                    Deleted Users
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.deletedUsers}
                  </Typography>
                </div>
                <Lock sx={{ 
                  fontSize: 48,
                  color: red[500],
                  opacity: 0.3
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="OFFICER">Verifier Officer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant={statusFilter === 'active' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('active')}
                sx={{ borderRadius: 2 }}
              >
                Active
              </Button>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant={statusFilter === 'deleted' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('deleted')}
                color="secondary"
                sx={{ borderRadius: 2 }}
              >
                Trash
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleOpenAddDialog}
              sx={{ borderRadius: 2 }}
            >
              New User
            </Button>
            <Tooltip title="Refresh data">
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ borderRadius: 2, minWidth: 40 }}
              >
                <Refresh />
              </Button>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card elevation={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StatusBadge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              variant="dot"
                              status={user.deleted ? 'deleted' : 'active'}
                            >
                              <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
                                {user.fullName?.charAt(0).toUpperCase() || 'U'}
                              </Avatar>
                            </StatusBadge>
                            {user.fullName || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role || 'N/A'}
                            color={user.role === 'ADMIN' ? 'secondary' : 'primary'}
                            variant="outlined"
                            size="small"
                            icon={user.role === 'ADMIN' ? <AdminPanelSettings /> : <Person />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.deleted ? 'Deleted' : 'Active'}
                            color={user.deleted ? 'error' : 'success'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {!user.deleted ? (
                            <>
                              <Tooltip title="Edit">
                                <IconButton 
                                  onClick={() => handleOpenEditDialog(user)}
                                  color="primary"
                                  sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' } }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  onClick={() => handleOpenDeleteDialog(user.id)}
                                  color="secondary"
                                  sx={{ '&:hover': { backgroundColor: 'secondary.light', color: 'secondary.contrastText' } }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Restore">
                                <IconButton 
                                  onClick={() => handleOpenRestoreDialog(user.id)}
                                  color="primary"
                                  sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' } }}
                                >
                                  <RestoreFromTrash />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Permanently Delete">
                                <IconButton 
                                  onClick={() => {
                                    setCurrentUser(user);
                                    setOpenDeleteDialog(true);
                                  }}
                                  color="error"
                                  sx={{ '&:hover': { backgroundColor: 'error.light', color: 'error.contrastText' } }}
                                >
                                  <DeleteForever />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="subtitle1" color="textSecondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
            />
          </Card>
        </>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {currentUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="OFFICER">Verifier Officer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={currentUser ? "New Password (leave blank to keep current)" : "Password"}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required={!currentUser}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1 }}
            type="submit"
          >
            {currentUser ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Confirm Action
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText>
            {statusFilter === 'deleted' 
              ? 'Are you sure you want to permanently delete this user? This action cannot be undone.' 
              : 'Are you sure you want to move this user to trash?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={statusFilter === 'deleted' ? handlePermanentDelete : handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 1 }}
          >
            {statusFilter === 'deleted' ? 'Permanently Delete' : 'Move to Trash'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Confirm Restore
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText>
            Are you sure you want to restore this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenRestoreDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRestore}
            variant="contained"
            color="success"
            sx={{ borderRadius: 1 }}
          >
            Restore
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
          sx={{ width: '100%', boxShadow: 3 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
