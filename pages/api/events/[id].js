import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'GET':
        // Get single event
        const event = await db.collection('events').findOne({ _id: new ObjectId(id) });
        
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(event);
        break;

      case 'DELETE':
        // Delete event
        const result = await db.collection('events').deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Event API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 