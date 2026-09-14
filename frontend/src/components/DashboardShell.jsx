import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardShell({ roleLabel, tabs, activeTab, onTabChange, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dash">
      <aside className="dash-sidebar">
        <div className="brand">SmartResolve</div>
        <div className="role-tag">{roleLabel} — {user?.name}</div>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={handleLogout}>Log out</button>
      </aside>
      <main className="dash-main">{children}</main>
    </div>
  );
}
