import connectToDatabase from "@/src/lib/mongodb";
import Channel from "@/src/models/Channel";
import User from "@/src/models/User";

export default async function handler(req, res) {
    await connectToDatabase();
    
    if (req.method === "GET") {
        const { channelId } = req.query;
        
        if (!channelId) {
            return res.status(400).json({ error: "Channel ID is required" });
        }

        try {
            const channel = await Channel.findById(channelId).populate("members", "firstname lastname email _id");
            
            if (!channel) {
                return res.status(404).json({ error: "Channel not found" });
            }

            res.status(200).json(channel.members);
        } catch (error) {
            res.status(500).json({ error: "Error fetching channel users" });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}

