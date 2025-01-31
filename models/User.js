import mongoose from "mongoose";

// Defining the user schema (structure of the data)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Exporting the model by first checking that it was already registred or no
export default mongoose.models.User || mongoose.model("User", UserSchema);
