import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getUser } from '../../lib/auth';

export default function CreateEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date: new Date(),
    price: '',
    ticketsAvailable: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser?._id || currentUser.role !== 'organizer') {
      router.push('/auth/login');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      date: newDate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentUser = getUser();
      if (!currentUser?._id || currentUser.role !== 'organizer') {
        throw new Error('You must be an organizer to create events');
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizerId: currentUser._id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      router.push('/organizer/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create New Event
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Event Date and Time"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tickets Available"
                name="ticketsAvailable"
                type="number"
                value={formData.ticketsAvailable}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.back()}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 