import connectToDatabase from "@/src/lib/mongodb";
import Channel from "../../models/Channel";

export default async function handler(req, res){
    await connectToDatabase();
    if(req.method === "GET"){
        const { teamId } = req.query;
        if(!teamId){
            return res.status(400).json({ error: "Team ID is required" });
        }

        try{
            const channels = await Channel.find({ team: teamId });
            res.status(200).json(channels || []);
        }   catch (error){
            res.status(500).json({ error: "Error fetching channels"});
        
        }
    }

    else if(req.method === "POST"){
        const { channelName, teamId, members } = req.body;

        if(!channelName || !teamId){
            return res.status(400).json({ error: "Name and Team ID are required" });
        }

        try{
            const newChannel = new Channel ({ name: channelName, team: teamId, members });
            await newChannel.save();

            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ error: "Team not found" });
            }

            await Team.findByIdAndUpdate(teamId, {
                $push: { channels: newChannel._id }
            });    
          res.status(201).json(newChannel);
        } catch (error) {
            console.error("Error creating channel:", error);
            res.status(500).json({ error: "Error creating channel" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
        