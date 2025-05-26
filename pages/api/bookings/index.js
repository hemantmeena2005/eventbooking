import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'POST':
        // Create a new booking
        const { eventId, userId, ticketCount, attendees, totalAmount } = req.body;

        if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
        }

        // Start a session for transaction
        const session = await db.client.startSession();
        try {
          await session.withTransaction(async () => {
            // Get the event
            const event = await db.collection('events').findOne(
              { _id: new ObjectId(eventId) },
              { session }
            );

            if (!event) {
              throw new Error('Event not found');
            }

            if (event.ticketsAvailable < ticketCount) {
              throw new Error('Not enough tickets available');
            }

            // Create the booking
            const booking = {
              eventId: new ObjectId(eventId),
              userId: new ObjectId(userId),
              ticketCount,
              attendees,
              totalAmount,
              status: 'confirmed',
              createdAt: new Date(),
            };

            await db.collection('bookings').insertOne(booking, { session });

            // Update event's available tickets
            await db.collection('events').updateOne(
              { _id: new ObjectId(eventId) },
              { $inc: { ticketsAvailable: -ticketCount } },
              { session }
            );
          });
        } finally {
          await session.endSession();
        }

        res.status(201).json({ message: 'Booking created successfully' });
        break;

      case 'GET':
        // Get bookings for a user
        const { userId: queryUserId } = req.query;

        if (!queryUserId) {
          return res.status(400).json({ message: 'User ID is required' });
        }

        const bookings = await db.collection('bookings')
          .aggregate([
            { 
              $match: { 
                userId: new ObjectId(queryUserId)
              }
            },
            {
              $lookup: {
                from: 'events',
                localField: 'eventId',
                foreignField: '_id',
                as: 'event'
              }
            },
            {
              $unwind: '$event'
            },
            {
              $project: {
                _id: 1,
                ticketCount: 1,
                attendees: 1,
                totalAmount: 1,
                status: 1,
                createdAt: 1,
                'event._id': 1,
                'event.title': 1,
                'event.venue': 1,
                'event.date': 1,
                'event.price': 1
              }
            }
          ])
          .toArray();

        res.status(200).json(bookings);
        break;

      default:
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Booking API error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 