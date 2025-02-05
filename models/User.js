const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isGlobalAdmin: { type: Boolean, required: true}
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
