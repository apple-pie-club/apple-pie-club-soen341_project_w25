import connectToDatabase from "../../lib/mongodb";
import Channel from "../../models/Channel";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    await connectToDatabase();

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

    if (req.method === "DELETE") {
    try {
        const { messageId, channelId } = req.query;
        console.log("DELETE request received for:", { messageId, channelId });

        if (!messageId || !channelId) {
            console.log("Error: Missing messageId or channelId");
            return res.status(400).json({ error: "Message ID and Channel ID are required" });
        }

        // Find the channel
        const channel = await Channel.findById(channelId);
        if (!channel) {
            console.log("Error: Channel not found");
            return res.status(404).json({ error: "Channel not found" });
        }

        // Find the message
        const messageIndex = channel.messages.findIndex(msg => msg._id.toString() === messageId);
        if (messageIndex === -1) {
            console.log("Error: Message not found in channel");
            return res.status(404).json({ error: "Message not found" });
        }

        console.log("Message found:", channel.messages[messageIndex]);

        // ❌ Removed admin check - Now anyone can delete messages

        // Remove the message and save
        channel.messages.splice(messageIndex, 1);
        await channel.save();
        console.log("Message deleted successfully!");

        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).json({ error: "Failed to delete message." });
    }
}


    // Handle GET requests (Fetching Messages)
    if (req.method === "GET") {
        try {
            const channelId = req.query.channelId;
            if (!channelId) {
                return res.status(400).json({ error: "Channel ID is required" });
            }

            // Find the selected Channel
            const channel = await Channel.findById(channelId);
            if (!channel) {
                return res.status(404).json({ error: "No channel found under this ID" });
            }

            return res.status(200).json(channel.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            return res.status(500).json({ error: "Failed to retrieve channel messages." });
        }
    }

    // Handle POST requests (Sending Messages)
    if (req.method === "POST") {
        try {
            const { channelId, text } = req.body;

            if (!channelId || !text || text.trim() === "") {
                return res.status(400).json({ error: "Channel ID and message text are required." });
            }

            // Find the channel
            let channel = await Channel.findById(channelId);
            if (!channel) {
                return res.status(404).json({ error: "Channel not found" });
            }

            // Create new message
            const newMessage = {
                sender: loggedInUserId,
                text: text.trim(),
                timestamp: new Date(),
            };

            // Add message to the channel
            channel.messages.push(newMessage);
            await channel.save();

            return res.status(201).json({ message: "Message sent successfully!", newMessage });
        } catch (error) {
            console.error("Error sending message:", error);
            return res.status(500).json({ error: "Failed to send message." });
        }
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
