import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectToDatabase();

  const { currentEmail, firstname, lastname, email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: currentEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email !== currentEmail) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    // Validate old password if changing password
    if (oldPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect old password" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update other fields
    user.firstname = firstname;
    user.lastname = lastname;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
