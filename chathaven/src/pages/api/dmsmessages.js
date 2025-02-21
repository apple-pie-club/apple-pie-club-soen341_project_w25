import connectToDatabase from "../../lib/mongodb";
import DM from "../../models/DMs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectToDatabase();

  console.log("Incoming GET request query params:", req.query);

  // Extract token from cookies
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let loggedInUserId;
  try {
    // Decode JWT token to get the logged-in user's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    loggedInUserId = decoded.userId;
  } catch (err) {
    console.error("JWT Error:", err);
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }

  // Handle GET Requests (Fetching Messages)
  if (req.method === "GET") {
    try {
      const userId = req.query.userId; // Get userId from body instead of query
      console.log("Fetching messages for users:", loggedInUserId, userId);

      if (!userId) {
        return res
          .status(400)
          .json({ error: "User ID is required in the request body" });
      }

      // Find the DM that includes both users
      const dm = await DM.findOne({
        participants: { $all: [loggedInUserId, userId] },
      });

      if (!dm) {
        return res
          .status(404)
          .json({ error: "No messages found between these users" });
      }

      return res.status(200).json(dm.messages); // Return messages exchanged between both users
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Failed to retrieve messages." });
    }
  }

  // Handle POST Requests (Sending Messages)
  if (req.method === "POST") {
    try {
      const userId = req.body.userId;
      const text = req.body.text;
      console.log("Sending message to:", userId);

      if (!userId) {
        return res.status(400).json({ error: "Recipient user ID is required" });
      }

      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Message text is required" });
      }

      // Check if a DM already exists between the two users
      let dm = await DM.findOne({
        participants: { $all: [loggedInUserId, userId] },
      });

      // If no DM exists, create one and save it before adding messages
      if (!dm) {
        dm = new DM({
          participants: [loggedInUserId, userId],
          messages: [],
        });

        await dm.save(); // Save DM before adding messages
      }

      // Create new message object
      const newMessage = {
        sender: loggedInUserId,
        text: text.trim(),
        timestamp: new Date(),
      };

      // Add message to DM
      dm.messages.push(newMessage);
      await dm.save(); // Save DM after adding the message

      return res
        .status(201)
        .json({ message: "Message sent successfully!", newMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ error: "Failed to send message." });
    }
  }

  // Allow both GET and POST requests
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
