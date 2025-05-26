import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'used'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema); 