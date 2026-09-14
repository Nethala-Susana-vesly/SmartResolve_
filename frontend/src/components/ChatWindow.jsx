import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";

export default function ChatWindow({ complaintId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const res = await api.get(`/messages/${complaintId}`);
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    }
    loadHistory();

    const socket = getSocket();
    socket.connect();
    socket.emit("join_complaint", complaintId);

    const handleIncoming = (msg) => {
      if (msg.complaintId === complaintId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("receive_message", handleIncoming);

    return () => {
      isMounted = false;
      socket.off("receive_message", handleIncoming);
    };
  }, [complaintId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const socket = getSocket();
    socket.emit("send_message", { complaintId, message: text.trim() });
    setText("");
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--ink-soft)", textAlign: "center", marginTop: 20 }}>
            No messages yet — say hello.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`chat-bubble ${msg.senderId === user.id ? "mine" : "theirs"}`}
          >
            <span className="sender">{msg.senderName}</span>
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
