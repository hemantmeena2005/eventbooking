import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { getUser } from '../../lib/auth';

export default function OrganizerBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        const currentUser = getUser();
        if (!currentUser?._id || currentUser.role !== 'organizer') {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);

        // Fetch bookings
        const response = await fetch(`/api/bookings/organizer?organizerId=${currentUser._id}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch bookings');
        }
        const data = await response.json();
        console.log('Fetched bookings:', data); // Debug log
        setBookings(data);
      } catch (err) {
        console.error('Error:', err); // Debug log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBookings();
  }, []);

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
        Event Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Alert severity="info">No bookings found for your events.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Attendee</TableCell>
                <TableCell>Tickets</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Booked On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.event.title}</TableCell>
                  <TableCell>
                    {format(new Date(booking.event.date), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    {booking.attendees.map((attendee, index) => (
                      <Box key={index}>
                        {attendee.name} ({attendee.email})
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>{booking.ticketCount}</TableCell>
                  <TableCell>${booking.totalAmount}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={booking.status === 'confirmed' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
} 