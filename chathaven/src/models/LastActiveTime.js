import mongoose from "mongoose";

const LastActiveTimeSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // userId to identify the user
  lastActiveTime: { type: Date, required: true }, // the last active timestamp
});

export default mongoose.models.LastActiveTime ||
  mongoose.model("LastActiveTime", LastActiveTimeSchema);
