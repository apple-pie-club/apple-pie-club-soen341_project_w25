import connectToDatabase from "../../lib/mongodb";
import Channel from "../../models/Channel";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    await connectToDatabase();
    
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    let loggedInUserId;
    try {
     // Decode JWT token to get the logged-in user's ID
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     loggedInUserId = decoded.userId;
    } catch (err) {
     console.error("JWT Error:", err);
     return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    // Handle GET requests (Fetching Messages)
    if (req.method === "GET") {
        try {
          const channelId = req.query.channelId; // Get channelId from body
          console.log("Fetching messages for channel: ", channelId);
    
          if (!channelId) {
            return res
              .status(400)
              .json({ error: "Channel ID is required in the request body" });
          }
    
          // Find the selected Channel by its ID
          const channel = await Channel.findById(channelId);
          
            console.log("Fetching messages for channel: ", channelId);
            
          if (!channel) {
            return res
              .status(404)
              .json({ error: "No channel found under this ID" });
          }
    
          return res.status(200).json(channel.messages); // Return channel messages exchanged in the past
        
        } catch (error) {
          console.error("Error fetching messages:", error);
          return res.status(500).json({ error: "Failed to retrieve channel messages." });
        }
      }

    // Handle POST requests (Sending Messages)
    if (req.method === "POST") {
        try{
        const channelId = req.body.channelId
        const text = req.body.text || "";
        const reply = req.body.reply;
        const imageData = req.body.imageData;
        console.log(`Sending message to channel: ${channelId} by user: ${loggedInUserId}`);

        if(!channelId) {
            return res.status(400).json({error: "Channel ID required"});
        }
        
        if(!imageData && !text) {
            return res.status(400).json({error: "Message text is required"});
        }

        console.log(`Looking for channel with ID: ${channelId}`);
        // Check if a channel already exisits
        let cm = await Channel.findOne({
            _id:channelId,
        })

        console.log("Channel found:", cm);

        //Create new message object
        const newMessage = { 
            sender: loggedInUserId,
            text: text.trim(),
            timestamp: new Date(),
            reply: reply
        };

        if(imageData){
          newMessage.imageData = imageData;
        }
        console.log("New message object:", newMessage);
        
        
        //Add message to Channel
        cm.messages.push(newMessage);
        console.log("Messages array after push:", cm.messages);
        await cm.save(); // save channel after adding message
        console.log("Message saved successfully!");
        return res
            .status(201)
            .json({ message: "Message sent successfully!", newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "Failed to send message." });
    }

    }
    res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });

}