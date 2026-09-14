import { io } from "socket.io-client";
import { API_BASE } from "./axios";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(API_BASE, {
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
