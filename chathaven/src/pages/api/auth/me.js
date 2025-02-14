import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    // Check if cookies exist
    const cookies = cookie.parse(req.headers.cookie || ""); 
    const token = cookies.authToken; // Read token

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isGlobalAdmin: user.isGlobalAdmin, // Ensure admin status is returned
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
