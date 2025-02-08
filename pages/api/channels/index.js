import connectDB from "@/lib/mongodb";
import Channel from "@/models/Channel";
import User from "@/models/User";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        try {
            const channels = await Channel.find().populate("members", "email");
            return res.status(200).json(channels);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching channels", error });
        }
    }

    if (req.method === "POST") {
        const { name } = req.body;
        try {
            const existingChannel = await Channel.findOne({ name });
            if (existingChannel) {
                return res.status(400).json({ message: "Channel already exists" });
            }

            const newChannel = new Channel({ name, members: [] });
            await newChannel.save();
            return res.status(201).json({ message: "Channel created successfully", channel: newChannel });
        } catch (error) {
            return res.status(500).json({ message: "Error creating channel", error });
        }
    }

    if (req.method === "PATCH") {
        const { channelId, userId } = req.body;
        try {
            const channel = await Channel.findById(channelId);
            const user = await User.findById(userId);
            if (!channel || !user) {
                return res.status(404).json({ message: "Channel or User not found" });
            }

            if (channel.members.includes(userId)) {
                return res.status(400).json({ message: "User already in the channel" });
            }

            channel.members.push(userId);
            await channel.save();
            return res.status(200).json({ message: "User added successfully", channel });
        } catch (error) {
            return res.status(500).json({ message: "Error adding user to channel", error });
        }
    }

    return res.status(405).json({ message: "Method Not Allowed" });
}
