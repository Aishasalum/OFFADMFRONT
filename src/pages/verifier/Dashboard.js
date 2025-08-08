import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PendingActions,
  Verified,
  Dangerous,
  Payments,
  NotificationsActive,
  Brightness4,
  Brightness7,
  PieChart
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(false);

  const stats = [
    { 
      value: 12, 
      label: 'Pending', 
      Icon: PendingActions,
      color: theme.palette.warning.main,
      trend: '↑ 2%'
    },
    { 
      value: 35, 
      label: 'Verified', 
      Icon: Verified,
      color: theme.palette.success.main,
      trend: '↑ 12%'
    },
    { 
      value: 7, 
      label: 'Rejected', 
      Icon: Dangerous,
      color: theme.palette.error.main,
      trend: '↓ 3%'
    },
    { 
      value: 18, 
      label: 'Payments', 
      Icon: Payments,
      color: theme.palette.info.main,
      trend: '↑ 8%'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Verified #CERT-2023-0456', time: '2 mins ago', icon: <Verified color="success" /> },
    { id: 2, action: 'Rejected #CERT-2023-0455', time: '1 hour ago', icon: <Dangerous color="error" /> },
    { id: 3, action: 'New submission from Alice', time: '3 hours ago', icon: <NotificationsActive color="info" /> },
    { id: 4, action: 'Payment received ($150)', time: '5 hours ago', icon: <Payments color="success" /> }
  ];

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 4,
      backgroundColor: darkMode ? '#121212' : '#f5f7fa',
      minHeight: '100vh'
    }}>
      {/* Header with Dark Mode Toggle */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            background: darkMode 
              ? 'linear-gradient(45deg, #90caf9, #bbdefb)' 
              : 'linear-gradient(45deg, #1976d2, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Verifier Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: darkMode ? 'text.secondary' : 'text.primary',
            mt: 0.5
          }}>
            Welcome back, Officer 👋
          </Typography>
        </Box>
        
        <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 4,
              boxShadow: darkMode 
                ? '0 8px 16px rgba(0,0,0,0.3)' 
                : '0 8px 16px rgba(0,0,0,0.1)',
              background: darkMode ? '#1e1e1e' : '#ffffff',
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: stat.color
              }} />
              <CardContent sx={{ pt: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <stat.Icon sx={{ 
                    fontSize: 40,
                    color: stat.color,
                    opacity: 0.8
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: stat.color,
                    fontWeight: 600
                  }}>
                    {stat.trend}
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  mt: 1,
                  color: darkMode ? '#fff' : 'text.primary'
                }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: darkMode ? 'text.secondary' : 'text.primary',
                  mb: 2
                }}>
                  {stat.label}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(stat.value * 3, 100)} 
                  sx={{ 
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: darkMode ? '#333' : '#eee',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: stat.color,
                      borderRadius: 3
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Activities Row */}
      <Grid container spacing={3}>
        {/* Chart Placeholder */}
        <Grid item xs={12} md={7}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: darkMode 
              ? '0 8px 16px rgba(0,0,0,0.3)' 
              : '0 8px 16px rgba(0,0,0,0.1)',
            background: darkMode ? '#1e1e1e' : '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                mb: 2,
                color: darkMode ? '#fff' : 'text.primary'
              }}>
                Verification Analytics
              </Typography>
              <Box sx={{ 
                height: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: darkMode ? 'text.secondary' : 'text.disabled'
              }}>
                <PieChart sx={{ fontSize: 80, opacity: 0.3 }} />
                <Typography>Chart visualization</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={5}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: darkMode 
              ? '0 8px 16px rgba(0,0,0,0.3)' 
              : '0 8px 16px rgba(0,0,0,0.1)',
            background: darkMode ? '#1e1e1e' : '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  mb: 2,
                  color: darkMode ? '#fff' : 'text.primary'
                }}>
                  Recent Activities
                </Typography>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                {recentActivities.map((activity) => (
                  <Box 
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: darkMode ? '#252525' : '#f5f7fa',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}>
                    <Box sx={{ 
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: darkMode ? '#333' : '#e0e0e0'
                    }}>
                      {activity.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ 
                        fontWeight: 500,
                        color: darkMode ? '#fff' : 'text.primary'
                      }}>
                        {activity.action}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: darkMode ? 'text.secondary' : 'text.secondary'
                      }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;