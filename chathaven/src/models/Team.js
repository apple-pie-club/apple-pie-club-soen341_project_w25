import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
