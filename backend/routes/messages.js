const express = require("express");
const Message = require("../models/Message");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Fetch chat history for a complaint (available to whoever is in that conversation)
router.get("/:complaintId", requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({ complaintId: req.params.complaintId }).sort("createdAt");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
