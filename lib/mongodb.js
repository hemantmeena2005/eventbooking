import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://imt2022049:imt2022049@cluster0.miinw.mongodb.net/events';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
} 