import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { getUser } from '../../lib/auth';
import dynamic from 'next/dynamic';

// Dynamically import QRCode with no SSR
const QRCode = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          width: 100,
          height: 100,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={20} />
      </Box>
    ),
  }
);

export default function UserTickets() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser?._id) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?userId=${user._id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    try {
      const response = await fetch(`/api/bookings/${selectedTicket._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }

      setCancelDialogOpen(false);
      setSelectedTicket(null);
      fetchBookings(); // Refresh bookings
    } catch (err) {
      setError(err.message);
    }
  };

  const generateTicketQR = (booking) => {
    const ticketData = {
      bookingId: booking._id,
      eventId: booking.event._id,
      eventTitle: booking.event.title,
      attendeeName: booking.attendees[0].name,
      ticketCount: booking.ticketCount,
      date: booking.event.date,
    };
    return JSON.stringify(ticketData);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Tickets
      </Typography>

      {bookings.length === 0 ? (
        <Alert severity="info">You haven&apos;t booked any tickets yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {booking.event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(booking.event.date), 'EEEE, MMMM d, yyyy h:mm a')}
                      </Typography>
                    </Box>
                    <Chip
                      label={booking.status}
                      color={booking.status === 'confirmed' ? 'success' : 'default'}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Venue: {booking.event.venue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tickets: {booking.ticketCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: ${booking.totalAmount}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <QRCode
                        value={generateTicketQR(booking)}
                        size={100}
                        level="H"
                        includeMargin={true}
                      />
                      <Typography variant="caption" display="block">
                        Scan for entry
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attendees:
                    </Typography>
                    {booking.attendees.map((attendee, index) => (
                      <Typography key={index} variant="body2">
                        {attendee.name} ({attendee.age} years) - {attendee.email}
                      </Typography>
                    ))}
                  </Box>

                  {booking.status === 'confirmed' && (
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setSelectedTicket(booking);
                        setCancelDialogOpen(true);
                      }}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your booking for {selectedTicket?.event.title}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Booking</Button>
          <Button onClick={handleCancelTicket} color="error" variant="contained">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 