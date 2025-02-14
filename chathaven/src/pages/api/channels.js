import connectToDatabase from "../../lib/mongodb";
import Channel from "../../models/Channel";
import Team from "../../models/Team";
import User from "../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res){
    await connectToDatabase();
    if(req.method === "GET"){
        const { teamId } = req.query;
        if(!teamId){
            return res.status(400).json({ error: "Team ID is required" });
        }

        try{
            const token = req.cookies.authToken;
            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            let channels;
            if (user.isGlobalAdmin) {
                // Global Admins see all channels in a team
                console.log(`🔹 Global Admin. Fetching ALL channels in team ${teamId}...`);
                channels = await Channel.find({ teamId });
            } else {
                // Regular users only see channels they are members of
                console.log(`🔹 Regular user. Fetching ONLY assigned channels in team ${teamId}...`);
                channels = await Channel.find({ teamId });
                if (!channels.length) {
                    console.warn(`⚠️ No channels found for user: ${userId}`);
                }
            }
            
            res.status(200).json(channels || []);
        }   catch (error){
            res.status(500).json({ error: "Error fetching channels"});
        
        }
    }

    else if(req.method === "POST"){
        const { name, teamId, members } = req.body;

        console.log("received channel creation request:", req.body);

        if(!name || !teamId){
            return res.status(400).json({ error: "Name and Team ID are required" });
        }

        try{
            const newChannel = new Channel ({ name, teamId, members });
            console.log("New channel object: ", newChannel);
            await newChannel.save();

            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ error: "Team not found" });
            }

            await Team.findByIdAndUpdate(teamId, {
                $push: { channels: newChannel._id }
            });

            console.log("Channel successfully created: ", newChannel);
          res.status(201).json(newChannel);
        } catch (error) {
            console.error("Error creating channel:", error);
            res.status(500).json({ error: "Error creating channel" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
        