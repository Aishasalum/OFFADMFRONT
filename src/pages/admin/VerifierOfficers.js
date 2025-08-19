

//new     




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Typography, Box, Grid, CircularProgress, TablePagination,
  DialogContentText, Snackbar, Alert, Avatar, Tooltip, styled,
  Card, CardContent, Divider, Badge, CardHeader, Switch, FormControlLabel
} from '@mui/material';
import {
  Search, Edit, Delete, Check, Close, Person, Email, 
  Phone, Lock, PersonAdd, Refresh, AdminPanelSettings,
  Male, Female, Transgender, Visibility, VisibilityOff
} from '@mui/icons-material';
import { teal, deepPurple, green, red, blue, orange, pink } from '@mui/material/colors';

const API_BASE_URL = 'http://localhost:8080/api/verifier-officer';

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

const VerifierOfficerPage = () => {
  // State management
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOfficers: 0,
    activeOfficers: 0,
    adminOfficers: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentOfficer, setCurrentOfficer] = useState(null);
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
    username: '',
    password: '',
    phone: '',
    gender: 'male',
    role: 'verifier_officer',
    active: true
  });
  const [showPassword, setShowPassword] = useState(false);

  // Fetch officers
  useEffect(() => {
    const fetchOfficers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/all`);
        setOfficers(response.data || []);
        calculateStats(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        showSnackbar('Failed to fetch officers', 'error');
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  // Calculate statistics
  const calculateStats = (officersData) => {
    const totalOfficers = officersData.length;
    const activeOfficers = officersData.filter(o => o.active).length;
    const adminOfficers = officersData.filter(o => o.role === 'admin').length;

    setStats({
      totalOfficers,
      activeOfficers,
      adminOfficers
    });
  };

  // Filter and sort officers
  useEffect(() => {
    let result = [...officers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(officer => 
        (officer.fullName && officer.fullName.toLowerCase().includes(term)) ||
        (officer.email && officer.email.toLowerCase().includes(term)) ||
        (officer.username && officer.username.toLowerCase().includes(term)) ||
        (officer.phone && officer.phone.includes(term))
      );
    }

    // Apply role filter
    if (roleFilter !== 'ALL') {
      result = result.filter(officer => officer.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      result = result.filter(officer => officer.active);
    } else if (statusFilter === 'inactive') {
      result = result.filter(officer => !officer.active);
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

    setFilteredOfficers(result);
    setPage(0);
  }, [officers, searchTerm, roleFilter, statusFilter, sortConfig]);

  // Modal handlers
  const handleOpenAddDialog = () => {
    setFormData({
      fullName: '',
      email: '',
      username: '',
      password: '',
      phone: '',
      gender: 'male',
      role: 'verifier_officer',
      active: true
    });
    setCurrentOfficer(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (officer) => {
    setFormData({
      fullName: officer.fullName || '',
      email: officer.email || '',
      username: officer.username || '',
      password: '',
      phone: officer.phone || '',
      gender: officer.gender || 'male',
      role: officer.role || 'verifier_officer',
      active: officer.active !== undefined ? officer.active : true
    });
    setCurrentOfficer(officer);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (officerId) => {
    setCurrentOfficer(officers.find(o => o.id === officerId));
    setOpenDeleteDialog(true);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentOfficer) {
        // Update officer
        const response = await axios.put(`${API_BASE_URL}/update/${currentOfficer.id}`, formData);
        setOfficers(prev => prev.map(o => o.id === currentOfficer.id ? response.data : o));
        showSnackbar('Officer updated successfully', 'success');
      } else {
        // Create officer
        const response = await axios.post(`${API_BASE_URL}/add`, formData);
        setOfficers(prev => [...prev, response.data]);
        showSnackbar('Officer created successfully', 'success');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      showSnackbar(error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${currentOfficer.id}`);
      setOfficers(prev => prev.filter(o => o.id !== currentOfficer.id));
      showSnackbar('Officer deleted successfully', 'success');
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error(error);
      showSnackbar(error.response?.data?.message || 'Failed to delete officer', 'error');
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
    return role === 'admin' ? deepPurple[500] : teal[500];
  };

  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'male': return <Male fontSize="small" />;
      case 'female': return <Female fontSize="small" />;
      default: return <Transgender fontSize="small" />;
    }
  };

  const getGenderColor = (gender) => {
    switch(gender) {
      case 'male': return blue[500];
      case 'female': return pink[500];
      default: return orange[500];
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
        <AdminPanelSettings fontSize="large" /> Verifier Officer Management
      </Typography>


      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search officers..."
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
                  <MenuItem value="verifier_officer">Verifier</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
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
                variant={statusFilter === 'inactive' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('inactive')}
                color="secondary"
                sx={{ borderRadius: 2 }}
              >
                Inactive
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
              New Officer
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
                    <TableCell>Officer</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOfficers.length > 0 ? (
                    filteredOfficers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((officer) => (
                      <TableRow key={officer.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StatusBadge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              variant="dot"
                              status={officer.active ? 'active' : 'inactive'}
                            >
                              <Avatar sx={{ bgcolor: getRoleColor(officer.role) }}>
                                {officer.fullName?.charAt(0).toUpperCase() || 'O'}
                              </Avatar>
                            </StatusBadge>
                            {officer.fullName || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Email fontSize="small" color="action" />
                              <Typography variant="body2">{officer.email || 'N/A'}</Typography>
                            </Box>
                            {officer.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Phone fontSize="small" color="action" />
                                <Typography variant="body2">{officer.phone}</Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{officer.username || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={officer.gender || 'N/A'}
                            icon={getGenderIcon(officer.gender)}
                            sx={{ 
                              backgroundColor: getGenderColor(officer.gender),
                              color: 'white'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={officer.role === 'admin' ? 'Admin' : 'Verifier'}
                            color={officer.role === 'admin' ? 'secondary' : 'primary'}
                            variant="outlined"
                            size="small"
                            icon={officer.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={officer.active ? 'Active' : 'Inactive'}
                            color={officer.active ? 'success' : 'error'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleOpenEditDialog(officer)}
                              color="primary"
                              sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' } }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleOpenDeleteDialog(officer.id)}
                              color="secondary"
                              sx={{ '&:hover': { backgroundColor: 'secondary.light', color: 'secondary.contrastText' } }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="subtitle1" color="textSecondary">
                          No officers found
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
              count={filteredOfficers.length}
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

      {/* Add/Edit Officer Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {currentOfficer ? 'Edit Officer' : 'Add New Officer'}
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
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                  }}
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
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={currentOfficer ? "New Password (leave blank to keep current)" : "Password"}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  required={!currentOfficer}
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="verifier_officer">Verifier Officer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={handleInputChange}
                      name="active"
                      color="primary"
                    />
                  }
                  label="Active Status"
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
            {currentOfficer ? 'Save Changes' : 'Add Officer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText>
            Are you sure you want to delete this officer? This action cannot be undone.
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
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 1 }}
          >
            Delete
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

export default VerifierOfficerPage;