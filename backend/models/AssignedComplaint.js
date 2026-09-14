const mongoose = require("mongoose");

const assignedComplaintSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true, unique: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agentName: { type: String, required: true },
    assignedBy: {
      type: String,
      enum: ["auto", "manual"],
      default: "manual",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignedComplaint", assignedComplaintSchema);
