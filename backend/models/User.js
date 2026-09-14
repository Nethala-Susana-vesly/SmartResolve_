const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    phone: { type: String, required: true },
    userType: {
      type: String,
      required: true,
      enum: ["Ordinary", "Agent", "Admin"],
    },
    // Only meaningful for Agents — lets routing skip agents who are offline/busy
    department: {
      type: String,
      enum: ["Billing", "Technical", "Delivery", "Product Quality", "General", null],
      default: null,
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
