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
            default: "",
          },
          imageData: {
            type: String, // Base64 encoded image
            default: null
          },
          timestamp: {
            type: Date, // Timestamp of when the message was sent
            default: Date.now, // Defaults to the current time
          },
          reply:{
            type: mongoose.Schema.Types.Mixed,
            default:null
          }
        },
      ],
});

export default mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);