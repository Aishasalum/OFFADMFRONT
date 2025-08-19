
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Typography, Box, Grid, CircularProgress, TablePagination,
  DialogContentText, Snackbar, Alert, Avatar, Tooltip, styled,
  Card, CardContent, Divider, Badge
} from '@mui/material';
import {
  Search, FilterList, Edit, Delete, CheckCircle, Cancel,
  Refresh, Add, ArrowUpward, ArrowDownward, RestoreFromTrash, 
  DeleteForever, Payment, Receipt, AttachMoney, CreditCard,
  MonetizationOn, MoneyOff, AccountBalanceWallet, ReceiptLong
} from '@mui/icons-material';
import { pink, teal, indigo, orange, deepPurple, green, red, blue, amber } from '@mui/material/colors';

const API_BASE_URL = 'http://localhost:8080/api/payments';

const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'PAID' ? theme.palette.success.main : theme.palette.error.main,
    color: status === 'PAID' ? theme.palette.success.contrastText : theme.palette.error.contrastText,
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

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    paidTransactions: 0,
    notPaidTransactions: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('active');
  const [sortConfig, setSortConfig] = useState({ key: 'paymentDate', direction: 'desc' });
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form states
  const [generateForm, setGenerateForm] = useState({
    username: '',
    certificateNumber: ''
  });

  const [confirmForm, setConfirmForm] = useState({
    controlNumber: '',
    amount: '',
    paymentMethod: 'TigoPesa'
  });

  const [editForm, setEditForm] = useState({
    username: '',
    certificateNumber: '',
    amount: '',
    paymentMethod: 'TigoPesa',
    status: 'NOT_PAID'
  });

  useEffect(() => {
    fetchPayments();
  }, [viewMode]);

  useEffect(() => {
    filterAndSortPayments();
    calculateStats();
  }, [payments, searchTerm, statusFilter, sortConfig]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const endpoint = viewMode === 'active' ? `${API_BASE_URL}/active` : `${API_BASE_URL}/deleted`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showSnackbar('Failed to fetch payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    let totalRevenue = 0;
    let totalTransactions = 0;
    let paidTransactions = 0;
    let notPaidTransactions = 0;

    payments.forEach(payment => {
      if (payment.status === 'PAID') {
        paidTransactions++;
        totalRevenue += payment.amount || 0;
      } else {
        notPaidTransactions++;
      }
      totalTransactions++;
    });

    setStats({
      totalRevenue,
      totalTransactions,
      paidTransactions,
      notPaidTransactions
    });
  };

  const filterAndSortPayments = () => {
    let result = [...payments];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => 
        (payment.certificateNumber && payment.certificateNumber.toLowerCase().includes(term)) ||
        (payment.controlNumber && payment.controlNumber.toLowerCase().includes(term)) ||
        (payment.username && payment.username.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(payment => payment.status === statusFilter);
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

    setFilteredPayments(result);
    setPage(0);
  };

  const handleGenerateControlNumber = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-control-number`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(generateForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate control number');
      }

      const data = await response.json();
      setConfirmForm(prev => ({
        ...prev,
        controlNumber: data.controlNumber,
        amount: data.amount
      }));
      setCurrentPayment(data);
      showSnackbar('Control number generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating control number:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/make-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          controlNumber: confirmForm.controlNumber,
          paymentMethod: confirmForm.paymentMethod
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm payment');
      }

      const data = await response.json();
      fetchPayments();
      setOpenDialog(false);
      setCurrentPayment(null);
      showSnackbar('Payment confirmed successfully!', 'success');
    } catch (error) {
      console.error('Error confirming payment:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    }
  };

  const handleSoftDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete payment');
      }

      fetchPayments();
      showSnackbar('Payment moved to trash', 'success');
    } catch (error) {
      console.error('Error deleting payment:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    }
  };

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restore/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore payment');
      }

      fetchPayments();
      showSnackbar('Payment restored successfully', 'success');
    } catch (error) {
      console.error('Error restoring payment:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/permanent-delete/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to permanently delete payment');
      }

      fetchPayments();
      showSnackbar('Payment permanently deleted', 'success');
    } catch (error) {
      console.error('Error deleting payment:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setEditForm({
      username: payment.username || '',
      certificateNumber: payment.certificateNumber || '',
      amount: payment.amount || 0,
      paymentMethod: payment.paymentMethod || 'TigoPesa',
      status: payment.status || 'NOT_PAID'
    });
    setOpenEditDialog(true);
  };

  const handleUpdatePayment = async () => {
    if (!editForm.username || !editForm.certificateNumber || !editForm.amount) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${editingPayment.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment');
      }

      const updatedPayment = await response.json();
      
      setPayments(payments.map(p => 
        p.id === updatedPayment.id ? updatedPayment : p
      ));
      
      setOpenEditDialog(false);
      showSnackbar('Payment updated successfully', 'success');
    } catch (error) {
      console.error('Error updating payment:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    }
  };

  const showConfirmation = (title, message, action) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action
    });
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

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'TigoPesa': return <Payment sx={{ color: pink[500] }} />;
      case 'HaloPesa': return <AttachMoney sx={{ color: teal[500] }} />;
      case 'AirtelMoney': return <CreditCard sx={{ color: indigo[500] }} />;
      case 'CRDB': return <Receipt sx={{ color: orange[500] }} />;
      case 'NMB': return <Receipt sx={{ color: deepPurple[500] }} />;
      default: return <Payment />;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch(method) {
      case 'TigoPesa': return pink[500];
      case 'HaloPesa': return teal[500];
      case 'AirtelMoney': return indigo[500];
      case 'CRDB': return orange[500];
      case 'NMB': return deepPurple[500];
      default: return 'primary';
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
        <Payment fontSize="large" /> Payment Management
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
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Tsh {stats.totalRevenue.toLocaleString()}
                  </Typography>
                </div>
                <MonetizationOn sx={{ 
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
            borderLeft: `4px solid ${green[500]}`,
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
                    Paid
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.paidTransactions}
                  </Typography>
                </div>
                <CheckCircle sx={{ 
                  fontSize: 48,
                  color: green[500],
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
                    Not Paid
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.notPaidTransactions}
                  </Typography>
                </div>
                <MoneyOff sx={{ 
                  fontSize: 48,
                  color: red[500],
                  opacity: 0.3
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            borderLeft: `4px solid ${amber[500]}`,
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
                    Total Transactions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalTransactions}
                  </Typography>
                </div>
                <ReceiptLong sx={{ 
                  fontSize: 48,
                  color: amber[500],
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
                placeholder="Search payments..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="NOT_PAID">Not Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant={viewMode === 'active' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('active')}
                sx={{ borderRadius: 2 }}
              >
                Active
              </Button>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant={viewMode === 'deleted' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('deleted')}
                color="secondary"
                sx={{ borderRadius: 2 }}
              >
                Recycle Bin
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              New Payment
            </Button>
            <Tooltip title="Refresh data">
              <Button
                variant="outlined"
                onClick={fetchPayments}
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
                    <TableCell>Certificate #</TableCell>
                    <TableCell>Control #</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StatusBadge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              variant="dot"
                              status={payment.status}
                            >
                              <Avatar sx={{ bgcolor: getPaymentMethodColor(payment.paymentMethod) }}>
                                {payment.username?.charAt(0).toUpperCase() || 'U'}
                              </Avatar>
                            </StatusBadge>
                            {payment.username || 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell>{payment.certificateNumber || 'N/A'}</TableCell>
                        <TableCell>{payment.controlNumber || 'N/A'}</TableCell>
                        <TableCell>Tsh {payment.amount?.toLocaleString() || '0'}</TableCell>
                        <TableCell>
                          <Tooltip title={payment.paymentMethod || 'Unknown'}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              {payment.paymentMethod || 'N/A'}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status || 'N/A'}
                            color={payment.status === 'PAID' ? 'success' : 'error'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>
                          {viewMode === 'active' ? (
                            <>
                              <Tooltip title="Edit">
                                <IconButton 
                                  onClick={() => handleEditPayment(payment)}
                                  color="primary"
                                  sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' } }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Move to Recycle Bin">
                                <IconButton 
                                  onClick={() => showConfirmation(
                                    'Move to Recycle Bin',
                                    `Move payment ${payment.controlNumber} to recycle bin?`,
                                    () => handleSoftDelete(payment.id)
                                  )}
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
                                  onClick={() => showConfirmation(
                                    'Restore Payment',
                                    `Restore payment ${payment.controlNumber}?`,
                                    () => handleRestore(payment.id)
                                  )}
                                  color="primary"
                                  sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' } }}
                                >
                                  <RestoreFromTrash />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Permanently Delete">
                                <IconButton 
                                  onClick={() => showConfirmation(
                                    'Permanently Delete',
                                    `Permanently delete payment ${payment.controlNumber}?`,
                                    () => handlePermanentDelete(payment.id)
                                  )}
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
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="subtitle1" color="textSecondary">
                          No payments found
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
              count={filteredPayments.length}
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

      {/* New Payment Dialog */}
      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setCurrentPayment(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {currentPayment ? 'Confirm Payment' : 'Generate Control Number'}
        </DialogTitle>
        <DialogContent>
          {!currentPayment ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={generateForm.username}
                  onChange={(e) => setGenerateForm({...generateForm, username: e.target.value})}
                  margin="normal"
                  variant="outlined"
                  sx={{ mt: 2 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Certificate Number"
                  value={generateForm.certificateNumber}
                  onChange={(e) => setGenerateForm({...generateForm, certificateNumber: e.target.value})}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Control Number"
                  value={confirmForm.controlNumber}
                  margin="normal"
                  variant="outlined"
                  disabled
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={confirmForm.amount}
                  margin="normal"
                  variant="outlined"
                  disabled
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>Tsh</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={confirmForm.paymentMethod}
                    onChange={(e) => setConfirmForm({...confirmForm, paymentMethod: e.target.value})}
                    label="Payment Method"
                  >
                    <MenuItem value="TigoPesa">TigoPesa</MenuItem>
                    <MenuItem value="HaloPesa">HaloPesa</MenuItem>
                    <MenuItem value="AirtelMoney">Airtel Money</MenuItem>
                    <MenuItem value="CRDB">CRDB</MenuItem>
                    <MenuItem value="NMB">NMB</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setCurrentPayment(null);
            }}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={currentPayment ? handleConfirmPayment : handleGenerateControlNumber}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1 }}
            disabled={!generateForm.username || !generateForm.certificateNumber}
          >
            {currentPayment ? 'Confirm Payment' : 'Generate Control Number'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Edit Payment {editingPayment?.controlNumber ? `#${editingPayment.controlNumber}` : ''}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                margin="normal"
                variant="outlined"
                sx={{ mt: 2 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Number"
                value={editForm.certificateNumber}
                onChange={(e) => setEditForm({...editForm, certificateNumber: e.target.value})}
                margin="normal"
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                value={editForm.amount}
                onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                margin="normal"
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>Tsh</Typography>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                  label="Payment Method"
                >
                  <MenuItem value="TigoPesa">TigoPesa</MenuItem>
                  <MenuItem value="HaloPesa">HaloPesa</MenuItem>
                  <MenuItem value="AirtelMoney">Airtel Money</MenuItem>
                  <MenuItem value="CRDB">CRDB</MenuItem>
                  <MenuItem value="NMB">NMB</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  label="Status"
                >
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="NOT_PAID">Not Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenEditDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePayment}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1 }}
            disabled={!editForm.username || !editForm.certificateNumber || !editForm.amount}
          >
            Update Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseConfirmDialog}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.action();
              handleCloseConfirmDialog();
            }}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1 }}
          >
            Confirm
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

export default PaymentManagement;