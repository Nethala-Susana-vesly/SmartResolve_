const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    comment: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Billing", "Technical", "Delivery", "Product Quality", "General"],
    },
    attachmentUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved"],
      default: "Pending", // system-set, never typed by the user
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
