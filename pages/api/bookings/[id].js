import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'DELETE':
        // Start a session for transaction
        const session = await db.client.startSession();
        try {
          await session.withTransaction(async () => {
            // Get the booking
            const booking = await db.collection('bookings').findOne(
              { _id: new ObjectId(id) },
              { session }
            );

            if (!booking) {
              throw new Error('Booking not found');
            }

            if (booking.status !== 'confirmed') {
              throw new Error('Cannot cancel a non-confirmed booking');
            }

            // Update booking status
            await db.collection('bookings').updateOne(
              { _id: new ObjectId(id) },
              { $set: { status: 'cancelled' } },
              { session }
            );

            // Return tickets to event
            await db.collection('events').updateOne(
              { _id: booking.eventId },
              { $inc: { ticketsAvailable: booking.ticketCount } },
              { session }
            );
          });
        } finally {
          await session.endSession();
        }

        res.status(200).json({ message: 'Booking cancelled successfully' });
        break;

      default:
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Booking API error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 