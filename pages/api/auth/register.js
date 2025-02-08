import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Defining the API route handler which processes HTTP requests and ensures only POST requests are handled
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Trying to connect to the database
  try {
    await connectToDatabase();
    console.log("Connected to database");

    const { firstname, lastname, email, password, requestGlobalAdmin } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ 
      firstname, 
      lastname, 
      email, 
      password: hashedPassword, 
      isGlobalAdmin: false,
      requestGlobalAdmin 
    });
    await newUser.save();

    console.log("User registered successfully");
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("ERROR in /api/auth/register:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
