import connectToDatabase from "../../lib/mongodb";
import Team from "../../models/Team";

export default async function handler(req, res) {
    await connectToDatabase();

    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { teamId } = req.query;
        if (!teamId) {
            return res.status(400).json({ error: "Team ID is required" });
        }

        const team = await Team.findById(teamId).populate("channels");
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        console.log("API: Team Channels Fetched:", team.channels);
        res.status(200).json(team.channels);  // Return only channels, not entire team
    } catch (error) {
        console.error("Error fetching team channels:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}