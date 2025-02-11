import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  try {
    // Get MongoDB URI from .env.local
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    // Connect to the database
    await client.connect();
    const db = client.db(); // Automatically selects the database from your URI

    // Fetch collections (to confirm connection)
    const collections = await db.listCollections().toArray();

    res.status(200).json({
      message: "Connected to MongoDB! ✅",
      collections: collections.map(col => col.name), // Show collection names
    });

    client.close();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed!" });
  }
}
