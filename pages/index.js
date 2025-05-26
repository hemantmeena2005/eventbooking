import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Box,
  CircularProgress,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventCard from '../components/EventCard';
import { isAuthenticated, isOrganizer, getUser, logout } from '../lib/auth';

function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
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

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    setUser(null);
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
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
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
          {user ? (
            <>
              {user.role === 'organizer' && (
                <Button color="inherit" onClick={() => router.push('/organizer/dashboard')}>
                  Dashboard
                </Button>
              )}
              <Button color="inherit" onClick={() => router.push('/profile/tickets')}>
                My Tickets
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => router.push('/auth/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => router.push('/auth/signup')}>
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Upcoming Events
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
            sx={{ mb: 4 }}
          />
        </Box>

        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item key={event._id} xs={12} sm={6} md={4}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>

        {filteredEvents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" variant="h6">
              {searchTerm ? 'No events found matching your search.' : 'No events found. Check back later!'}
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}

export default HomePage; 