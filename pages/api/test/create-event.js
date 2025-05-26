import dbConnect from '../../lib/dbConnect';
import Event from '../../models/Event';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();
      const event = await Event.create({
        title: 'Sample Concert',
        description: 'A fantastic evening of live music',
        venue: 'City Hall',
        date: new Date('2024-06-15'),
        price: 50,
        ticketsAvailable: 100,
        organizer: '65f1a2b3c4d5e6f7g8h9i0j1' // You'll need to replace this with a real user ID
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 