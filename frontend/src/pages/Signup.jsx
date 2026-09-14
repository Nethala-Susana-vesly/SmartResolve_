import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const departments = ["Billing", "Technical", "Delivery", "Product Quality", "General"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", userType: "Ordinary", department: "General",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      alert("Account created — please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="topnav">
        <Link to="/" className="brand">SmartResolve</Link>
      </nav>
      <div className="auth-wrap">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="sub">Register a complaint or join as an agent.</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="userType">I am a...</label>
              <select id="userType" name="userType" value={form.userType} onChange={handleChange}>
                <option value="Ordinary">User (filing complaints)</option>
                <option value="Agent">Agent (resolving complaints)</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {form.userType === "Agent" && (
              <div className="field">
                <label htmlFor="department">Department</label>
                <select id="department" name="department" value={form.department} onChange={handleChange}>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <button className="btn-primary" style={{ width: "100%" }} type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="switch">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
