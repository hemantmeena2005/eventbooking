import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AccountCircle } from '@mui/icons-material';
import { getUser, logout } from '../../lib/auth';

export default function OrganizerDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'organizer') {
      router.push('/auth/login');
      return;
    }
    setUser(user);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Refresh events list
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Event Booking
          </Typography>
          <Button color="inherit" onClick={() => router.push('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => router.push('/organizer/create-event')}>
            Create Event
          </Button>
          <Button color="inherit" onClick={() => router.push('/organizer/bookings')}>
            View Bookings
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              Hi, {user?.name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => {
                handleClose();
                router.push('/profile');
              }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Organizer Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/organizer/create-event')}
          >
            Create New Event
          </Button>
        </Box>

        <Typography variant="h5" sx={{ mb: 3 }}>
          Your Events
        </Typography>

        {events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" variant="h6">
              You haven&apos;t created any events yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push('/organizer/create-event')}
              sx={{ mt: 2 }}
            >
              Create Your First Event
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item key={event._id} xs={12} md={6} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {event.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Venue:</strong> {event.venue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {new Date(event.date).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Price:</strong> ${event.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tickets Available:</strong> {event.ticketsAvailable}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => router.push(`/organizer/edit-event/${event._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
} 