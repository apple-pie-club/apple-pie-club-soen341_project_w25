import mongoose from "mongoose";

// Define the schema for a Direct Message (DM)
const DMsSchema = new mongoose.Schema({
  // Array of user IDs participating in the DM
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  // Array to store messages in the DM conversation
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
      reply:{
        type: mongoose.Schema.Types.Mixed,
        default:null
      }
    },
  ],
});

export default mongoose.models.DMs || mongoose.model("DMs", DMsSchema);
