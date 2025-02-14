import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  isGlobalAdmin: Boolean, // ✅ Admin field
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
