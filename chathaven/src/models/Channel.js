import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema({
    name:{ type: String, required: true},
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    members:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    messages: [
        {
          sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          text: {
            type: String, // Message text
            required: true,
          },
          timestamp: {
            type: Date, // Timestamp of when the message was sent
            default: Date.now, // Defaults to the current time
          },
        },
      ],
});

export default mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);