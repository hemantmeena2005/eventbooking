import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

export default function BookingForm({ open, onClose, event, onBook }) {
  const [ticketCount, setTicketCount] = useState(1);
  const [attendees, setAttendees] = useState([{ name: '', age: '', email: '' }]);
  const [error, setError] = useState('');

  const handleTicketCountChange = (newCount) => {
    if (newCount < 1 || newCount > event.ticketsAvailable) return;
    setTicketCount(newCount);
    // Adjust attendees array
    if (newCount > attendees.length) {
      setAttendees([...attendees, ...Array(newCount - attendees.length).fill({ name: '', age: '', email: '' })]);
    } else {
      setAttendees(attendees.slice(0, newCount));
    }
  };

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const handleSubmit = () => {
    // Validate all fields are filled
    const isValid = attendees.every(attendee => 
      attendee.name.trim() && 
      attendee.age.trim() && 
      attendee.email.trim()
    );

    if (!isValid) {
      setError('Please fill in all attendee details');
      return;
    }

    // Validate age is a number and reasonable
    const hasValidAge = attendees.every(attendee => {
      const age = parseInt(attendee.age);
      return !isNaN(age) && age > 0 && age < 120;
    });

    if (!hasValidAge) {
      setError('Please enter valid ages for all attendees');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasValidEmails = attendees.every(attendee => emailRegex.test(attendee.email));

    if (!hasValidEmails) {
      setError('Please enter valid email addresses for all attendees');
      return;
    }

    onBook({
      eventId: event._id,
      ticketCount,
      attendees,
      totalAmount: ticketCount * event.price
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Book Tickets for {event.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Number of Tickets
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => handleTicketCountChange(ticketCount - 1)}
              disabled={ticketCount <= 1}
            >
              <RemoveIcon />
            </IconButton>
            <Typography>{ticketCount}</Typography>
            <IconButton 
              onClick={() => handleTicketCountChange(ticketCount + 1)}
              disabled={ticketCount >= event.ticketsAvailable}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Available tickets: {event.ticketsAvailable}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price per ticket: ${event.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total amount: ${ticketCount * event.price}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" gutterBottom>
          Attendee Details
        </Typography>
        <Grid container spacing={2}>
          {attendees.map((attendee, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attendee {index + 1}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={attendee.name}
                      onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={attendee.age}
                      onChange={(e) => handleAttendeeChange(index, 'age', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={attendee.email}
                      onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Book Tickets
        </Button>
      </DialogActions>
    </Dialog>
  );
} 