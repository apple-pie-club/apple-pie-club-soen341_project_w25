import connectDB from "@/lib/mongodb";
import Channel from "@/models/Channel";
import User from "@/models/User";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        await connectDB();

        const session = await getSession({ req });
        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { channelId } = req.query;
        const { userId } = req.body; 

        // Find the channel
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        // Verify admin status
        const requestingUser = await User.findById(session.user.userId);
        if (!requestingUser || !requestingUser.isGlobalAdmin) {
            return res.status(403).json({ message: "Only admins can add users" });
        }

        // Find the user to be added
        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already in the channel
        if (channel.members.includes(userId)) {
            return res.status(400).json({ message: "User already in channel" });
        }

        // Add user to the channel
        channel.members.push(userId);
        await channel.save();

        return res.status(200).json({ message: "User added to channel successfully" });
    } catch (error) {
        console.error("Error adding user to channel:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
