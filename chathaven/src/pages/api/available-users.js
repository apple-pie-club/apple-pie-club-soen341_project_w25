import connectToDatabase from "../../lib/mongodb";
import User from "../../models/User";
import Team from "../../models/Team";
import Channel from "../../models/Channel";

export default async function handler(req, res) {
    await connectToDatabase();

    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { teamId, channelId } = req.query;

    if (!teamId || !channelId) {
        return res.status(400).json({ error: "Team ID and Channel ID are required" });
    }

    try {
        // Get the team and channel
        const team = await Team.findById(teamId);
        const channel = await Channel.findById(channelId);

        if (!team || !channel) {
            return res.status(404).json({ error: "Team or Channel not found" });
        }

        // Get all users in the team
        const teamUsers = await User.find({ _id: { $in: team.members } });

        // Filter users who are not in the channel
        const availableUsers = teamUsers.filter(user => !channel.members.includes(user._id.toString()));

        return res.status(200).json(availableUsers);
    } catch (error) {
        console.error("Error fetching available users:", error);
        return res.status(500).json({ error: "Failed to fetch available users" });
    }
}