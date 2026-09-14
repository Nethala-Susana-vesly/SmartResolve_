const express = require("express");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Admin: list all agents
router.get("/agents", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const agents = await User.find({ userType: "Agent" }).select("-password");
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

// Admin: list all ordinary users
router.get("/ordinary", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const users = await User.find({ userType: "Ordinary" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: delete a user (and cascade their complaints)
router.delete("/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.deleteOne({ _id: req.params.id });
    await Complaint.deleteMany({ userId: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Admin: update a user's basic profile fields
router.put("/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Agent: toggle their own availability (used by the routing engine)
router.patch("/me/availability", requireAuth, requireRole("Agent"), async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const agent = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable: !!isAvailable },
      { new: true }
    ).select("-password");
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: "Failed to update availability" });
  }
});

module.exports = router;
