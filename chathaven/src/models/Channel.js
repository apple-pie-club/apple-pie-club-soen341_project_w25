import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema({
    name:{ type: String, required: true},
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    members:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
});

export default mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);