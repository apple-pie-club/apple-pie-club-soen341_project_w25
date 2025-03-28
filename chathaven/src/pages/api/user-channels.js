import connectToDatabase from "../../lib/mongodb";
import Channel from "../../models/Channel";
import User from "../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    await connectToDatabase();

    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No Token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user token" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find all channels where the user is a member
        const userChannels = await Channel.find({ members: userId });

        console.log("API: User Channels Fetched:", userChannels);
        res.status(200).json(userChannels);
    } catch (error) {
        console.error("Error fetching user channels:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}