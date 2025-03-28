import mongoose from "mongoose";

const ChannelRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ChannelRequest || mongoose.model("ChannelRequest", ChannelRequestSchema);