import { trackFallbackParamAccessed } from "next/dist/server/app-render/dynamic-rendering";
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

  // Handle GET request to fetch vanish mode only
  if (req.method === "GET" && req.query.fetchVanishMode === "true") {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const dm = await DM.findOne({
        participants: { $all: [loggedInUserId, userId] },
      }).select("vanishMode");

      if (!dm) {
        return res.status(404).json({ error: "DM not found" });
      }

      return res.status(200).json({ vanishMode: dm.vanishMode || false });
    } catch (error) {
      console.error("Error fetching vanish mode:", error);
      return res.status(500).json({ error: "Failed to retrieve vanish mode." });
    }
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
      }).select("messages");

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
      const { userId, text, reply, imageData, tag, vanish } = req.body;
      console.log("Sending message to:", userId);

      if (!userId) {
        return res.status(400).json({ error: "Recipient user ID is required" });
      }

      if (!imageData && !text) {
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
        reply: reply,
        tag: tag,
        vanish: dm.vanishMode || false,
      };

      if (imageData) {
        newMessage.imageData = imageData;
      }

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

  if (req.method === "DELETE") {
    const { userId, messageId, vanishMessageIds } = req.body;
    if (!userId || (!messageId && !vanishMessageIds)) {
      return res.status(400).json({ error: "Missing userId or messageId or vanishMessageIds" });
    }

    const dm = await DM.findOne({
      participants: { $all: [loggedInUserId, userId] },
    });
    if (!dm) return res.status(404).json({ error: "DM not found" });

    const initialLength = dm.messages.length;

    // Soft delete replies
    dm.messages.forEach((msg) => {
      if (
        msg.reply &&
        ((messageId && msg.reply._id.toString() === messageId) ||
         (vanishMessageIds && vanishMessageIds.includes(msg.reply._id.toString()))) &&
        msg.reply.text !== ""
      ) {
        msg.reply.text = "message deleted";
      }
    });

    // Single delete
    if (messageId) {
      dm.messages = dm.messages.filter((msg) => msg._id.toString() !== messageId);
    }

    // Batch delete for vanish messages
    if (Array.isArray(vanishMessageIds)) {
      dm.messages = dm.messages.filter(
        (msg) => !(vanishMessageIds.includes(msg._id.toString()) && msg.vanish === true)
      );
    }

    if (dm.messages.length === initialLength) {
      return res.status(404).json({ error: "Message(s) not found in dm" });
    }

    await dm.save();
    return res.status(200).json({ success: true });
  }

  if (req.method === "PATCH") {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const dm = await DM.findOne({
        participants: { $all: [loggedInUserId, userId] },
      });

      if (!dm) {
        return res.status(404).json({ error: "DM not found" });
      }

      dm.vanishMode = !dm.vanishMode;
      await dm.save();

      const updatedDM = await DM.findById(dm._id);
  
      console.log("Vanish mode now set to:", updatedDM.vanishMode);
      console.log("Updated DM:", updatedDM);

      return res.status(200).json({
        message: `Vanish mode ${updatedDM.vanishMode ? "enabled" : "disabled"}`,
        vanishMode: updatedDM.vanishMode,
      });
    } catch (err) {
      console.error("Error toggling vanish mode:", err);
      return res.status(500).json({ error: "Failed to toggle vanish mode" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
