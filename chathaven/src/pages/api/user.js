import connectToDatabase from "../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import User from "../../models/User"; // ✅ Import User model

export default async function handler(req, res) {
    await connectToDatabase(); // ✅ Now it returns a Mongoose connection

    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No Token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user token" });
        }

        // Use Mongoose to find user (No need for `db.collection("users")`)
        const user = await User.findById(new ObjectId(userId));

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log("API Returning User:", user);

        res.status(200).json({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            isGlobalAdmin: user.isGlobalAdmin,  // Use isGlobalAdmin field
        });

    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
