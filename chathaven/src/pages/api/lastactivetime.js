import connectToDatabase from "../../lib/mongodb";
import LastActiveTime from "../../models/LastActiveTime"; // Assuming you have the LastActiveTime model
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectToDatabase();

  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Decode the token to get the logged-in user's ID
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  // Handle GET request to fetch last active times of users
  if (req.method === "GET") {
    try {
      // Fetch all users' last active times
      const usersLastActiveTimes = await LastActiveTime.find();

      // Send back the users' last active times
      return res.status(200).json(usersLastActiveTimes);
    } catch (error) {
      console.error("Error fetching last active times:", error);
      return res
        .status(500)
        .json({ error: "Failed to retrieve last active times." });
    }
  }

  // Handle POST request to update the last active time
  if (req.method === "POST") {
    try {
      const { lastActiveTime } = req.body; // Extract the last active time from the request body
      if (!lastActiveTime) {
        return res.status(400).json({ error: "Last active time is required" });
      }

      // Find the user's record in the database, or create one if it doesn't exist
      const userLastActiveTime = await LastActiveTime.findOneAndUpdate(
        { userId },
        { lastActiveTime }, // Update the last active time
        { new: true, upsert: true } // Create the record if it doesn't exist
      );

      // Respond with the updated or newly created record
      return res.status(200).json(userLastActiveTime);
    } catch (error) {
      console.error("Error updating last active time:", error);
      return res
        .status(500)
        .json({ error: "Failed to update last active time" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
