import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this event.'],
    maxlength: [60, 'Title cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for this event.'],
  },
  venue: {
    type: String,
    required: [true, 'Please provide a venue for this event.'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date for this event.'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price for this event.'],
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketsAvailable: {
    type: Number,
    required: [true, 'Please provide the number of tickets available.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema); 