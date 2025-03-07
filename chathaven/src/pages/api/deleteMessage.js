import connectToDatabase from "../../lib/mongodb";
import Channel from "../../models/Channel";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    console.log("🔹 Incoming delete request:", req.body);

    if (req.method !== "DELETE") {
        console.log("❌ Method Not Allowed:", req.method);
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const token = req.cookies.authToken;
    if (!token) {
        console.log("❌ Unauthorized: No token found");
        return res.status(401).json({ error: "Unauthorized" });
    }

    let loggedInUser;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        loggedInUser = decoded;
    } catch (err) {
        console.log("❌ Invalid Token:", err);
        return res.status(403).json({ error: "Invalid token" });
    }

    if (!loggedInUser.isGlobalAdmin) {
        console.log("❌ Forbidden: User is not an admin", loggedInUser);
        return res.status(403).json({ error: "Forbidden: Only admins can delete messages." });
    }

    const { messageId, channelId } = req.body;
    if (!messageId || !channelId) {
        console.log("❌ Bad Request: Missing messageId or channelId");
        return res.status(400).json({ error: "Message ID and Channel ID are required." });
    }

    console.log(`🔹 Attempting to delete message: ${messageId} from channel: ${channelId}`);

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            console.log("❌ Channel Not Found:", channelId);
            return res.status(404).json({ error: "Channel not found." });
        }

        channel.messages = channel.messages.filter(msg => msg._id.toString() !== messageId);
        await channel.save();

        console.log("✅ Message deleted successfully:", messageId);
        return res.status(200).json({ message: "Message deleted successfully." });
    } catch (error) {
        console.error("❌ Error deleting message:", error);
        return res.status(500).json({ error: "Failed to delete message." });
    }
}
