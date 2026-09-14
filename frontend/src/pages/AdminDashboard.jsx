import React, { useEffect, useState } from "react";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/StatusBadge";

function ComplaintsTab() {
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);

  const load = async () => {
    const [cRes, aRes] = await Promise.all([api.get("/complaints"), api.get("/users/agents")]);
    setComplaints(cRes.data);
    setAgents(aRes.data);
  };

  useEffect(() => { load(); }, []);

  const assign = async (complaintId, agentId) => {
    if (!agentId) return;
    try {
      await api.post(`/complaints/${complaintId}/assign`, { agentId });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign");
    }
  };

  const unassigned = complaints.filter((c) => c.status === "Pending");
  const rest = complaints.filter((c) => c.status !== "Pending");

  return (
    <>
      <h2 style={{ fontSize: 17, marginBottom: 14 }}>Needs manual assignment ({unassigned.length})</h2>
      {unassigned.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: 32 }}>Everything is auto-assigned right now.</div>
      ) : (
        <div className="card-grid" style={{ marginBottom: 36 }}>
          {unassigned.map((c) => (
            <div className="complaint-card" key={c._id}>
              <div className="top-row">
                <h3>{c.category} — {c.name}</h3>
                <StatusBadge status={c.status} />
              </div>
              <div className="meta">{c.city}, {c.state}<br />{c.comment}</div>
              <select className="assign-select" defaultValue="" onChange={(e) => assign(c._id, e.target.value)}>
                <option value="" disabled>Assign to agent...</option>
                {agents.filter((a) => a.department === c.category).map((a) => (
                  <option key={a._id} value={a._id}>{a.name} {a.isAvailable ? "" : "(unavailable)"}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 17, marginBottom: 14 }}>All other complaints ({rest.length})</h2>
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Category</th><th>City</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rest.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td><td>{c.category}</td><td>{c.city}</td><td><StatusBadge status={c.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AgentsTab() {
  const [agents, setAgents] = useState([]);
  useEffect(() => { api.get("/users/agents").then((r) => setAgents(r.data)); }, []);

  return (
    <table className="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Status</th></tr></thead>
      <tbody>
        {agents.map((a) => (
          <tr key={a._id}>
            <td>{a.name}</td><td>{a.email}</td><td>{a.department}</td>
            <td>{a.isAvailable ? "Available" : "Unavailable"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const load = () => api.get("/users/ordinary").then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this user and all their complaints?")) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <table className="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
      <tbody>
        {users.map((u) => (
          <tr key={u._id}>
            <td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
            <td><button className="btn-danger" onClick={() => remove(u._id)}>Delete</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("complaints");
  const titles = { complaints: "Complaints", agents: "Agents", users: "Users" };

  return (
    <DashboardShell
      roleLabel="Admin"
      tabs={[
        { key: "complaints", label: "Complaints" },
        { key: "agents", label: "Agents" },
        { key: "users", label: "Users" },
      ]}
      activeTab={tab}
      onTabChange={setTab}
    >
      <h1>{titles[tab]}</h1>
      <p className="page-sub">Platform-wide oversight and manual assignment fallback.</p>
      {tab === "complaints" && <ComplaintsTab />}
      {tab === "agents" && <AgentsTab />}
      {tab === "users" && <UsersTab />}
    </DashboardShell>
  );
}
