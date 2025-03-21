import connectToDatabase from "../../lib/mongodb";
import DM from "../../models/DMs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectToDatabase();

  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Decode token to get the logged-in user's ID
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  if (req.method === "GET") {
    try {
      // Fetch all DMs where the logged-in user is a participant
      const userDMs = await DM.find({ participants: userId }).populate(
        "participants",
        "email"
      );

      // Extract users with whom the logged-in user has a DM
      const usersWithDMs = userDMs
        .map((dm) =>
          dm.participants.find(
            (participant) => participant._id.toString() !== userId
          )
        )
        .filter((user) => user !== null); // Ensure no null values

      return res.status(200).json(usersWithDMs);
    } catch (error) {
      console.log(error);
      console.error("Error fetching DMs:", error);
      return res.status(500).json({ error: "Failed to retrieve DMs." });
    }
  }

  if (req.method === "POST") {
    try {
      // Extract selected user from request body
      const { selectedUserId } = req.body;
      console.log(
        "The selected user from the request body is ",
        selectedUserId
      );
      if (!selectedUserId) {
        return res.status(400).json({ error: "Recipient user ID is required" });
      }

      // Check if a DM already exists between these users
      let existingDM = await DM.findOne({
        participants: { $all: [userId, selectedUserId] },
      });

      // If the DM does not exist, it's created
      if (!existingDM) {
        console.log(
          "It was found that there was no existing DM with ",
          selectedUserId
        );
        existingDM = await DM.create({
          participants: [userId, selectedUserId],
        });
      }

      res
        .status(201)
        .json({ message: "DM found or created successfully!", dm: existingDM });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch or create DM." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
