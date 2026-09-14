const express = require("express");
const Complaint = require("../models/Complaint");
const AssignedComplaint = require("../models/AssignedComplaint");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");
const upload = require("../utils/upload");
const { findBestAgent } = require("../utils/routeComplaint");

const router = express.Router();

// User: submit a new complaint (status defaults to "Pending" server-side, never user-typed)
router.post("/", requireAuth, requireRole("Ordinary"), upload.single("attachment"), async (req, res) => {
  try {
    const { name, address, city, state, pincode, comment, category } = req.body;

    const complaint = await Complaint.create({
      userId: req.user.id,
      name,
      address,
      city,
      state,
      pincode,
      comment,
      category,
      attachmentUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    // Try auto-routing first; fall back to leaving it unassigned for admin if no agent is free
    const agent = await findBestAgent(category);
    if (agent) {
      await AssignedComplaint.create({
        complaintId: complaint._id,
        agentId: agent._id,
        agentName: agent.name,
        assignedBy: "auto",
      });
      complaint.status = "Assigned";
      await complaint.save();
    }

    res.status(201).json({ complaint, autoAssigned: !!agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register complaint" });
  }
});

// User: view their own complaints
router.get("/mine", requireAuth, requireRole("Ordinary"), async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id }).sort("-createdAt");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Admin: view every complaint (only ones still needing manual assignment, by default)
router.get("/", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const complaints = await Complaint.find().sort("-createdAt");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Admin: manually assign a complaint to a specific agent (the fallback path)
router.post("/:complaintId/assign", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { agentId } = req.body;
    const { complaintId } = req.params;

    const agent = await User.findOne({ _id: agentId, userType: "Agent" });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const existing = await AssignedComplaint.findOne({ complaintId });
    if (existing) {
      return res.status(409).json({ error: "Complaint is already assigned" });
    }

    await AssignedComplaint.create({
      complaintId,
      agentId: agent._id,
      agentName: agent.name,
      assignedBy: "manual",
    });

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { status: "Assigned" },
      { new: true }
    );

    res.json({ message: `Assigned to ${agent.name}`, complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to assign complaint" });
  }
});

// Agent: view complaints assigned to them
router.get("/agent/:agentId", requireAuth, requireRole("Agent"), async (req, res) => {
  try {
    if (req.params.agentId !== req.user.id) {
      return res.status(403).json({ error: "You can only view your own assigned complaints" });
    }

    const assignments = await AssignedComplaint.find({ agentId: req.params.agentId });
    const complaintIds = assignments.map((a) => a.complaintId);
    const complaints = await Complaint.find({ _id: { $in: complaintIds } }).sort("-createdAt");

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assigned complaints" });
  }
});

// Agent: update a complaint's status (In Progress / Resolved)
router.patch("/:complaintId/status", requireAuth, requireRole("Agent"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["In Progress", "Resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const assignment = await AssignedComplaint.findOne({
      complaintId: req.params.complaintId,
      agentId: req.user.id,
    });
    if (!assignment) {
      return res.status(403).json({ error: "This complaint isn't assigned to you" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.complaintId,
      { status },
      { new: true }
    );
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;
