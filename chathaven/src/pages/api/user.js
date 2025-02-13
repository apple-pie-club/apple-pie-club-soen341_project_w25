import connectToDatabase from "@/src/lib/mongodb";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    await connectToDatabase();

    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user token" });
        }

        res.status(200).json({ _id: userId });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
