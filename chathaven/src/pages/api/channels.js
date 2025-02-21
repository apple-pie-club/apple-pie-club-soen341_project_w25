import connectToDatabase from "@/src/lib/mongodb";
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
                channels = await Channel.find({ teamId, members: userId });
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
            const token = req.cookies.authToken;
            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;

            // Ensure the creator is part of the team
            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ error: "Team not found" });
            }
            if (!team.members.includes(userId)) {
                return res.status(403).json({ error: "User must be a member of the team to create a channel" });
            }

            const newChannel = new Channel ({ 
                name, 
                teamId, 
                members,
             });
            console.log("New channel object: ", newChannel);
            await newChannel.save();

            await Team.findByIdAndUpdate(teamId, {
                $push: { channels: newChannel._id }
            });

            const updatedUser = await User.findByIdAndUpdate(
                userId, 
                { $push: { isChannelAdmin: newChannel._id } }, 
                { new: true }
            );
            
            console.log("Updated user after adding isChannelAdmin:", updatedUser);

            console.log("Channel successfully created: ", newChannel);
            console.log(`User ${userId} is now an admin of channel ${newChannel._id}`);
            res.status(201).json(newChannel);
        } catch (error) {
            console.error("Error creating channel:", error);
            res.status(500).json({ error: "Error creating channel" });
        }
    }

    else if (req.method === "PATCH") { 
        const { channelId, userIdToAdd } = req.body;
    
        if (!channelId || !userIdToAdd) {
            return res.status(400).json({ error: "Channel ID and User ID are required" });
        }
    
        try {
            const token = req.cookies.authToken;
            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }
    
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const loggedInUserId = decoded.userId;
    
            // Fetch logged-in user
            const loggedInUser = await User.findById(loggedInUserId);
            if (!loggedInUser) {
                return res.status(404).json({ error: "Logged-in user not found" });
            }
    
            // Check if the user to be added exists
            const userToAdd = await User.findById(userIdToAdd);
            if (!userToAdd) {
                return res.status(404).json({ error: "User to add not found" });
            }
    
            // Find the channel
            const channel = await Channel.findById(channelId);
            if (!channel) {
                return res.status(404).json({ error: "Channel not found" });
            }
    
            // Check if user is already in the channel
            if (channel.members.includes(userIdToAdd)) {
                return res.status(400).json({ error: "User is already a member of this channel" });
            }
    
            // Permission Check: Only Global Admins or Channel Admins can add users
            if (!loggedInUser.isGlobalAdmin && !loggedInUser.isChannelAdmin.includes(channelId)) {
                return res.status(403).json({ error: "Permission denied. Only global admins or channel admins can add users." });
            }
    
            // Add user to channel
            await Channel.findByIdAndUpdate(channelId, {
                $push: { members: userIdToAdd }
            });
    
            console.log(`User ${userIdToAdd} added to channel ${channelId}`);
            return res.status(200).json({ message: "User added to channel successfully" });
    
        } catch (error) {
            console.error("Error adding user to channel:", error);
            return res.status(500).json({ error: "Failed to add user to channel" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
        