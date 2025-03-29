import connectToDatabase from "../../lib/mongodb";
import Channel from "../../models/Channel";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const token = req.cookies?.authToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let loggedInUser;
  try {
    loggedInUser = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }

  const { channelId, messageId } = req.body;
  if (!channelId || !messageId) {
    return res.status(400).json({ error: "Missing channelId or messageId" });
  }

  await connectToDatabase();

  const channel = await Channel.findById(channelId);
  if (!channel) return res.status(404).json({ error: "Channel not found" });

  const initialLength = channel.messages.length;
  channel.messages = channel.messages.filter(
    (msg) => msg._id.toString() !== messageId
  );

  if (channel.messages.length === initialLength) {
    return res.status(404).json({ error: "Message not found in channel" });
  }

  await channel.save();
  return res.status(200).json({ success: true });
}
