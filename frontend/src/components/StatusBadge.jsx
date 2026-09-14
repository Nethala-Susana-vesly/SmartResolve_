import React from "react";

export default function StatusBadge({ status }) {
  const className = `badge ${status.replace(/\s+/g, "")}`;
  return <span className={className}>{status}</span>;
}
