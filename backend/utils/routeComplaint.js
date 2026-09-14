const User = require("../models/User");
const AssignedComplaint = require("../models/AssignedComplaint");
const Complaint = require("../models/Complaint");

/**
 * Tries to auto-assign a complaint to the best available agent in its category.
 *
 * Logic:
 *  1. Find agents in the matching department who are marked available.
 *  2. Among them, pick whichever agent currently has the FEWEST open (non-resolved) complaints
 *     — a simple load-balancing step so one agent doesn't get flooded.
 *  3. If no agent in that department is available, return null so the complaint
 *     falls back to the admin's manual assignment queue instead of being stuck
 *     on an agent who isn't there to work it.
 *
 * This is intentionally simple (no ML, no external service) — it's a rules-based
 * router, which is the honest way to describe it in an interview.
 */
async function findBestAgent(category) {
  const availableAgents = await User.find({
    userType: "Agent",
    department: category,
    isAvailable: true,
  });

  if (availableAgents.length === 0) {
    return null; // nobody available — admin will assign manually
  }

  // Count each candidate's current open workload (status lives on the Complaint, not the assignment)
  const workloads = await Promise.all(
    availableAgents.map(async (agent) => {
      const assignments = await AssignedComplaint.find({ agentId: agent._id }).select("complaintId");
      const complaintIds = assignments.map((a) => a.complaintId);
      const openCount = await Complaint.countDocuments({
        _id: { $in: complaintIds },
        status: { $ne: "Resolved" },
      });
      return { agent, openCount };
    })
  );

  workloads.sort((a, b) => a.openCount - b.openCount);
  return workloads[0].agent;
}

module.exports = { findBestAgent };
