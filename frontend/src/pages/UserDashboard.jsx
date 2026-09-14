import React, { useEffect, useState } from "react";
import api from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StatusBadge from "../components/StatusBadge";
import ChatWindow from "../components/ChatWindow";

const categories = ["Billing", "Technical", "Delivery", "Product Quality", "General"];

function SubmitTab({ onSubmitted }) {
  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "", pincode: "", comment: "", category: "General",
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (file) data.append("attachment", file);

      const res = await api.post("/complaints", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotice(
        res.data.autoAssigned
          ? "Complaint submitted and automatically assigned to an available agent."
          : "Complaint submitted. All agents in this category are busy right now — an admin will assign it shortly."
      );
      setForm({ name: "", address: "", city: "", state: "", pincode: "", comment: "", category: "General" });
      setFile(null);
      onSubmitted();
    } catch (err) {
      setNotice(err.response?.data?.error || "Something went wrong submitting your complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 640, padding: 32 }}>
      {notice && <div className="form-error" style={{ background: "var(--brand-tint)", color: "var(--brand-dark)" }}>{notice}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <div className="field">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>State</label>
            <input name="state" value={form.state} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Pincode</label>
            <input name="pincode" value={form.pincode} onChange={handleChange} required />
          </div>
        </div>
        <div className="field">
          <label>Supporting document (optional)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <div className="field">
          <label>Describe the issue</label>
          <textarea name="comment" value={form.comment} onChange={handleChange} required />
        </div>
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit complaint"}
        </button>
      </form>
    </div>
  );
}

function StatusTab() {
  const [complaints, setComplaints] = useState([]);
  const [openChatId, setOpenChatId] = useState(null);

  const load = async () => {
    const res = await api.get("/complaints/mine");
    setComplaints(res.data);
  };

  useEffect(() => { load(); }, []);

  if (complaints.length === 0) {
    return <div className="empty-state">No complaints yet — submit one from the "Submit complaint" tab.</div>;
  }

  return (
    <div className="card-grid">
      {complaints.map((c) => (
        <div className="complaint-card" key={c._id}>
          <div className="top-row">
            <h3>{c.category}</h3>
            <StatusBadge status={c.status} />
          </div>
          <div className="meta">
            {c.city}, {c.state} — {c.pincode}<br />
            {c.comment}
            {c.attachmentUrl && (
              <><br /><a className="attachment-link" href={`http://localhost:8000${c.attachmentUrl}`} target="_blank" rel="noreferrer">View attachment</a></>
            )}
          </div>
          <div className="actions">
            <button className="btn-secondary" onClick={() => setOpenChatId(openChatId === c._id ? null : c._id)}>
              {openChatId === c._id ? "Hide messages" : "Message agent"}
            </button>
          </div>
          {openChatId === c._id && <ChatWindow complaintId={c._id} />}
        </div>
      ))}
    </div>
  );
}

export default function UserDashboard() {
  const [tab, setTab] = useState("submit");

  return (
    <DashboardShell
      roleLabel="User"
      tabs={[
        { key: "submit", label: "Submit complaint" },
        { key: "status", label: "My complaints" },
      ]}
      activeTab={tab}
      onTabChange={setTab}
    >
      <h1>{tab === "submit" ? "Submit a complaint" : "My complaints"}</h1>
      <p className="page-sub">
        {tab === "submit" ? "We'll route this to the right team automatically." : "Track progress and message your assigned agent."}
      </p>
      {tab === "submit" ? <SubmitTab onSubmitted={() => setTab("status")} /> : <StatusTab />}
    </DashboardShell>
  );
}
