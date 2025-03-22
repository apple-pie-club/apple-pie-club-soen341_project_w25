import connectToDatabase from "../../lib/mongodb";
import ChannelRequest from "../../models/ChannelRequest";
import Channel from "../../models/Channel";
import User from "../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    await connectToDatabase();

    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (req.method === "POST") {
        // User requests to join a channel
        const { channelId, teamId } = req.body;

        if (!channelId || !teamId) {
            return res.status(400).json({ error: "Channel ID and Team ID are required" });
        }

        const existingRequest = await ChannelRequest.findOne({ userId, channelId });
        if (existingRequest) {
            return res.status(400).json({ error: "You have already requested to join this channel" });
        }

        const request = new ChannelRequest({ userId, channelId, teamId });
        await request.save();

        return res.status(201).json({ message: "Request sent" });
    }

    if (req.method === "GET") {
        // Fetch all join requests for channels where user is an admin
        const adminUser = await User.findById(userId);
        if (!adminUser) return res.status(404).json({ error: "User not found" });

        const adminChannels = adminUser.isChannelAdmin || [];

        const requests = await ChannelRequest.find({ channelId: { $in: adminChannels } })
            .populate("userId", "firstname lastname email")
            .populate("channelId", "name")
            .populate("teamId", "teamName");

        return res.status(200).json(requests);
    }

    if (req.method === "PATCH") {
        // Accept a join request
        const { requestId } = req.body;

        const request = await ChannelRequest.findById(requestId);
        if (!request) return res.status(404).json({ error: "Request not found" });

        await Channel.findByIdAndUpdate(request.channelId, { $push: { members: request.userId } });
        await ChannelRequest.findByIdAndDelete(requestId);

        return res.status(200).json({ message: "User added to channel" });
    }

    if (req.method === "DELETE") {
        // Deny a request (just delete it)
        const { requestId } = req.body;

        const request = await ChannelRequest.findById(requestId);
        if (!request) return res.status(404).json({ error: "Request not found" });

        await ChannelRequest.findByIdAndDelete(requestId);

        return res.status(200).json({ message: "Request denied" });
    }

    res.status(405).json({ error: `Method ${req.method} not allowed` });
}