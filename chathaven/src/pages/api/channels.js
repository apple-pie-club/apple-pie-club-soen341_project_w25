import connectToDatabase from "../../lib/mongodb";
import Channel from "../../models/Channel";
import Team from "../../models/Team";
import User from "../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res){
    await connectToDatabase();

    // Handle GET request (Fetch Channels)
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
                console.log(`🔹 Global Admin. Fetching ALL channels in team ${teamId}...`);
                channels = await Channel.find({ teamId });
            } else {
                console.log(`🔹 Regular user. Fetching ONLY assigned channels in team ${teamId}...`);
                channels = await Channel.find({ teamId, members: userId });
                if (!channels.length) {
                    console.warn(`⚠️ No channels found for user: ${userId}`);
                }
            }
            
            res.status(200).json(channels || []);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error fetching channels"});
        }
    }

    // Handle POST request (Create Channel + Ban User)
    else if(req.method === "POST"){
        const { action, name, teamId, members, channelId, userIdToBan } = req.body;

        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        try {
            if (action === "banUser") {
                console.log(`Ban Request: User ${userIdToBan} from Channel ${channelId}`);

                if (!channelId || !userIdToBan) {
                    return res.status(400).json({ error: "Channel ID and User ID to ban are required" });
                }

                // Prevent user from banning themselves
                if (userId === userIdToBan) {
                    return res.status(400).json({ error: "You cannot ban yourself!" });
                }

                const channel = await Channel.findById(channelId);
                if (!channel) {
                    return res.status(404).json({ error: "Channel not found" });
                }

                const loggedInUser = await User.findById(userId);
                if (!loggedInUser) {
                    return res.status(404).json({ error: "Logged-in user not found" });
                }

                // Ensure only Channel Admins or Global Admins can ban
                if (!loggedInUser.isGlobalAdmin && !loggedInUser.isChannelAdmin.includes(channelId)) {
                    return res.status(403).json({ error: "Permission denied. Only channel admins or global admins can ban users." });
                }

                // Ensure the user being banned is actually in the channel
                if (!channel.members.includes(userIdToBan)) {
                    return res.status(400).json({ error: "User is not a member of this channel" });
                }

                // Remove the user from the channel
                await Channel.findByIdAndUpdate(channelId, {
                    $pull: { members: userIdToBan }
                });

                console.log(`User ${userIdToBan} successfully banned from channel ${channelId}`);
                return res.status(200).json({ message: "User banned successfully" });
            }

            // Handle Channel Creation
            if (!name || !teamId) {
                return res.status(400).json({ error: "Name and Team ID are required" });
            }

            const team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({ error: "Team not found" });
            }
            if (!team.members.includes(userId)) {
                return res.status(403).json({ error: "User must be a member of the team to create a channel" });
            }

            const newChannel = new Channel({ name, teamId, members });
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
            console.log("Channel successfully created:", newChannel);
            res.status(201).json(newChannel);
        } catch (error) {
            console.error("Error processing request:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Handle PATCH request (Add User to Channel)
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
    
            const loggedInUser = await User.findById(loggedInUserId);
            if (!loggedInUser) {
                return res.status(404).json({ error: "Logged-in user not found" });
            }
    
            const userToAdd = await User.findById(userIdToAdd);
            if (!userToAdd) {
                return res.status(404).json({ error: "User to add not found" });
            }
    
            const channel = await Channel.findById(channelId);
            if (!channel) {
                return res.status(404).json({ error: "Channel not found" });
            }
    
            if (channel.members.includes(userIdToAdd)) {
                return res.status(400).json({ error: "User is already a member of this channel" });
            }
    
            if (!loggedInUser.isGlobalAdmin && !loggedInUser.isChannelAdmin.includes(channelId)) {
                return res.status(403).json({ error: "Permission denied. Only global admins or channel admins can add users." });
            }
    
            await Channel.findByIdAndUpdate(channelId, {
                $push: { members: userIdToAdd }
            });

            console.log(`✅ User ${userIdToAdd} added to channel ${channelId}`);
            return res.status(200).json({ message: "User added to channel successfully" });
    
        } catch (error) {
            console.error("Error adding user to channel:", error);
            return res.status(500).json({ error: "Failed to add user to channel" });
        }
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
