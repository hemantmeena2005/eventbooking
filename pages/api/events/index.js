import dbConnect from '../../../lib/dbConnect';
import Event from '../../../models/Event';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await dbConnect();

    switch (method) {
      case 'GET':
        // Get all events
        const events = await Event.find({});
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
        const event = await Event.create({
          title,
          description,
          venue,
          date: new Date(date),
          price: parseFloat(price),
          ticketsAvailable: parseInt(ticketsAvailable),
          organizer: organizerId,
        });

        res.status(201).json(event);
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