import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { organizerId } = req.query;

    if (!organizerId) {
      return res.status(400).json({ message: 'Organizer ID is required' });
    }

    const { db } = await connectToDatabase();

    // Get all bookings and match with events to find organizer's bookings
    const bookings = await db.collection('bookings')
      .aggregate([
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
          $match: {
            'event.organizerId': new ObjectId(organizerId)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
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
            'event.date': 1,
            'event.venue': 1,
            'user.name': 1,
            'user.email': 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching organizer bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 