import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardMedia,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AttachMoney,
  ConfirmationNumber,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getUser } from '../../lib/auth';
import BookingForm from '../../components/BookingForm';

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const user = getUser();
    setUser(user);
  }, []);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (bookingData) => {
    try {
      if (!user?._id) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to book tickets');
      }

      setBookingSuccess(true);
      setBookingOpen(false);
      fetchEvent(); // Refresh event data to update available tickets
    } catch (err) {
      setError(err.message);
    }
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

  if (!event) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">Event not found</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {bookingSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Tickets booked successfully! You can view your bookings in your profile.
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Event Image */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image="https://source.unsplash.com/random/800x600/?concert"
                alt={event.title}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          {/* Event Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom>
              {event.title}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                {event.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Venue:</strong> {event.venue}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Date:</strong> {format(new Date(event.date), 'EEEE, MMMM d, yyyy h:mm a')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Price:</strong> ${event.price}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ConfirmationNumber sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Tickets Available:</strong> {event.ticketsAvailable}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Organizer:</strong> {event.organizer}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 4 }}>
              {user ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={() => setBookingOpen(true)}
                  disabled={event.ticketsAvailable === 0}
                >
                  {event.ticketsAvailable > 0 ? 'Book Tickets' : 'Sold Out'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => router.push('/auth/login')}
                >
                  Login to Book Tickets
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <BookingForm
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        event={event}
        onBook={handleBook}
      />
    </Container>
  );
} 