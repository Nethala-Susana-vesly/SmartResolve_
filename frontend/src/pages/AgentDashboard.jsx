import React, { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/StatusBadge";
import ChatWindow from "../components/ChatWindow";
import { useAuth } from "../context/AuthContext";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [openChatId, setOpenChatId] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const load = useCallback(async () => {
    const res = await api.get(`/complaints/agent/${user.id}`);
    setComplaints(res.data);
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (complaintId, status) => {
    await api.patch(`/complaints/${complaintId}/status`, { status });
    load();
  };

  const toggleAvailability = async () => {
    const next = !isAvailable;
    await api.patch("/users/me/availability", { isAvailable: next });
    setIsAvailable(next);
  };

  return (
    <DashboardShell roleLabel="Agent" tabs={[{ key: "queue", label: "My queue" }]} activeTab="queue" onTabChange={() => {}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>My queue</h1>
          <p className="page-sub">Complaints routed or assigned to you.</p>
        </div>
        <button className={isAvailable ? "btn-secondary" : "btn-danger"} onClick={toggleAvailability}>
          {isAvailable ? "● Available" : "● Marked unavailable"}
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">Nothing assigned to you right now.</div>
      ) : (
        <div className="card-grid">
          {complaints.map((c) => (
            <div className="complaint-card" key={c._id}>
              <div className="top-row">
                <h3>{c.category} — {c.name}</h3>
                <StatusBadge status={c.status} />
              </div>
              <div className="meta">
                {c.address}, {c.city}, {c.state} — {c.pincode}<br />
                {c.comment}
              </div>
              <div className="actions">
                {c.status !== "Resolved" && (
                  <>
                    <button className="btn-secondary" onClick={() => updateStatus(c._id, "In Progress")}>Mark in progress</button>
                    <button className="btn-primary" onClick={() => updateStatus(c._id, "Resolved")}>Mark resolved</button>
                  </>
                )}
                <button className="btn-secondary" onClick={() => setOpenChatId(openChatId === c._id ? null : c._id)}>
                  {openChatId === c._id ? "Hide messages" : "Message user"}
                </button>
              </div>
              {openChatId === c._id && <ChatWindow complaintId={c._id} />}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
