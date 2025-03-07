import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    await connectToDatabase();
    const { firstname, lastname, email, password, contactByFax, requestGlobalAdmin } = req.body;

    // contactByFax is an invisible field that only bots will fill out
    if (contactByFax) {
      return res.status(400).json({ message: "Spam detected" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign admin status based on checkbox selection
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      isGlobalAdmin: requestGlobalAdmin || false, 
    });

    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser._id, isGlobalAdmin: newUser.isGlobalAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      isGlobalAdmin: newUser.isGlobalAdmin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
