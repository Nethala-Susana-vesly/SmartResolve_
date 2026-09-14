require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const initSocket = require("./socket");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const complaintRoutes = require("./routes/complaints");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: { origin: clientUrl },
});

connectDB();

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

initSocket(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`SmartResolve backend running on port ${PORT}`));
