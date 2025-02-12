import connectToDatabase from "@/src/lib/mongodb";
import DM from "../../models/DMs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Decode token to get the logged-in user's ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Extract selected user from request body
      const { selectedUserId } = req.body;
      if (!selectedUserId) {
        return res.status(400).json({ error: "Recipient user ID is required" });
      }

      // Check if a DM already exists between these users
      let existingDM = await DM.findOne({
        participants: { $all: [userId, selectedUserId] },
      });

      // If the DM does not exist, it's created
      if (!existingDM) {
        existingDM = await DM.create({
          participants: [userId, selectedUserId],
        });
      }

      res
        .status(201)
        .json({ message: "DM found or created successfully!", dm: existingDM });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch or create DM." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
