import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { format } from 'date-fns';

function EventCard({ event }) {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'EEE, MMM d, yyyy h:mm a');
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {event.title}
        </Typography>
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          color="text.secondary"
          paragraph
        >
          {event.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Venue:</strong> {event.venue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Date:</strong> {formatDate(event.date)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="primary">
              ${event.price}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.ticketsAvailable} tickets left
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Link href={`/event/${event._id}`} passHref style={{ width: '100%' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            View Details
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}

export default EventCard; 