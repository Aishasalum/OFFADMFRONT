import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Assignment,
  Description,
  Payments,
  Brightness4,
  Brightness7,
  VerifiedUser,
  Refresh
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalCertificates: 0,
    totalPayments: 0,
    verifiedRequests: 0
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsRes, paymentsRes, certsRes, verifiedRes] = await Promise.all([
        fetch("http://localhost:8080/api/verification-requests/all"),
        fetch("http://localhost:8080/api/payments/active"),
        fetch("http://localhost:8080/api/certificates/all"),
        fetch("http://localhost:8080/api/verification-requests/all")
      ]);

      if (!requestsRes.ok || !paymentsRes.ok || !certsRes.ok || !verifiedRes.ok) {
        throw new Error('Failed to fetch data from one or more endpoints');
      }

      const [requestsData, paymentsData, certsData, verifiedData] = await Promise.all([
        requestsRes.json(),
        paymentsRes.json(),
        certsRes.json(),
        verifiedRes.json()
      ]);

      setStats({
        totalRequests: requestsData.length || 0,
        totalPayments: paymentsData.length || 0,
        totalCertificates: certsData.length || 0,
        verifiedRequests: verifiedData.length || 0
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardItems = [
    {
      value: stats.totalRequests,
      label: 'Verification Requests',
      Icon: Assignment,
      gradient: 'linear-gradient(135deg, #42a5f5, #1e88e5)'
    },
    // {
    //   value: stats.verifiedRequests,
    //   label: 'Verified Documents',
    //   Icon: VerifiedUser,
    //   gradient: 'linear-gradient(135deg, #4caf50, #2e7d32)'
    // },
    {
      value: stats.totalCertificates,
      label: 'Uploaded Certificates',
      Icon: Description,
      gradient: 'linear-gradient(135deg, #ffb74d, #f57c00)'
    },
    {
      value: stats.totalPayments,
      label: 'Processed Payments',
      Icon: Payments,
      gradient: 'linear-gradient(135deg, #ab47bc, #8e24aa)'
    }
  ];

  const handleRefresh = () => {
    fetchStats();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 4,
        backgroundColor: darkMode ? '#121212' : '#f5f7fa',
        minHeight: '100vh',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: darkMode
                ? 'linear-gradient(45deg, #90caf9, #bbdefb)'
                : 'linear-gradient(45deg, #1976d2, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Verification Dashboard
          </Typography>
          {loading && <CircularProgress size={24} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleRefresh} title="Refresh data">
            <Refresh sx={{ color: darkMode ? '#fff' : '#555' }} />
          </IconButton>
          <IconButton onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
            {darkMode ? <Brightness7 sx={{ color: '#ffeb3b' }} /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {cardItems.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                background: darkMode
                  ? 'rgba(30, 30, 30, 0.9)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                boxShadow: darkMode
                  ? '0 8px 20px rgba(0,0,0,0.3)'
                  : '0 8px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: darkMode 
                    ? '0 12px 25px rgba(0,0,0,0.25)' 
                    : '0 12px 25px rgba(0,0,0,0.12)'
                }
              }}
            >
              <CardContent sx={{ position: 'relative' }}>
                {/* Icon in Circle */}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: card.gradient,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    mb: 2,
                    position: 'absolute',
                    right: 20,
                    top: 20,
                    opacity: 0.2
                  }}
                >
                  <card.Icon sx={{ fontSize: 30, color: '#fff' }} />
                </Box>

                {/* Value */}
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: darkMode ? '#fff' : '#222',
                    mb: 0.5
                  }}
                >
                  {loading ? '--' : card.value}
                </Typography>

                {/* Label */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    mb: 2,
                    color: darkMode ? '#aaa' : '#666'
                  }}
                >
                  {card.label}
                </Typography>

                {/* Progress */}
                <LinearProgress
                  variant="determinate"
                  value={loading ? 0 : Math.min(card.value * 2, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: darkMode ? '#333' : '#eee',
                    '& .MuiLinearProgress-bar': {
                      background: card.gradient,
                      transition: 'width 1.2s ease-in-out'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats Summary */}
      <Box sx={{ mt: 4 }}>
        <Card
          sx={{
            borderRadius: 3,
            background: darkMode
              ? 'rgba(30, 30, 30, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: darkMode
              ? '0 8px 20px rgba(0,0,0,0.3)'
              : '0 8px 20px rgba(0,0,0,0.08)',
            p: 3
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: darkMode ? '#fff' : '#333' }}>
            Verification Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="body2" sx={{ color: darkMode ? '#bbb' : '#666', mb: 1 }}>
                Verification Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.totalRequests > 0 ? (stats.verifiedRequests / stats.totalRequests) * 100 : 0}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: darkMode ? '#333' : '#eee',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, color: darkMode ? '#aaa' : '#555' }}>
                {stats.verifiedRequests} of {stats.totalRequests} requests verified
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="body2" sx={{ color: darkMode ? '#bbb' : '#666', mb: 1 }}>
                Payment Completion
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.totalRequests > 0 ? (stats.totalPayments / stats.totalRequests) * 100 : 0}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: darkMode ? '#333' : '#eee',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #ab47bc, #8e24aa)',
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, color: darkMode ? '#aaa' : '#555' }}>
                {stats.totalPayments} of {stats.totalRequests} requests paid
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          Error fetching data: {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;