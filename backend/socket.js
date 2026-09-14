const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

function initSocket(io) {
  // Verify the JWT before allowing a socket connection at all
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Each complaint's chat is its own "room" so messages only reach the two people in it
    socket.on("join_complaint", (complaintId) => {
      socket.join(`complaint_${complaintId}`);
    });

    socket.on("send_message", async ({ complaintId, message }) => {
      try {
        const saved = await Message.create({
          complaintId,
          senderId: socket.user.id,
          senderName: socket.user.name,
          message,
        });

        // Push instantly to everyone in the room (including the sender, for a consistent view)
        io.to(`complaint_${complaintId}`).emit("receive_message", saved);
      } catch (err) {
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      // no-op for now — room membership is cleaned up automatically by socket.io
    });
  });
}

module.exports = initSocket;
