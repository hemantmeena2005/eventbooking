import { connectToDatabase } from '../../../lib/mongodb';
import { getSession } from 'next-auth/react';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'GET':
        // Get all events
        const events = await db.collection('events').find({}).toArray();
        res.status(200).json(events);
        break;

      case 'POST':
        // Create new event
        const { title, description, venue, date, price, ticketsAvailable, organizerId } = req.body;

        // Validate required fields
        if (!title || !description || !venue || !date || !price || !ticketsAvailable || !organizerId) {
          return res.status(400).json({ message: 'All fields are required' });
        }

        // Create event
        const result = await db.collection('events').insertOne({
          title,
          description,
          venue,
          date: new Date(date),
          price: parseFloat(price),
          ticketsAvailable: parseInt(ticketsAvailable),
          organizerId: new ObjectId(organizerId),
          createdAt: new Date(),
        });

        res.status(201).json({
          message: 'Event created successfully',
          event: {
            _id: result.insertedId,
            title,
            description,
            venue,
            date,
            price,
            ticketsAvailable,
            organizerId,
          },
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 