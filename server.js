import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import pkg from "tiktok-live-connector";

dotenv.config();

const { WebcastPushConnection } = pkg;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 10000;

app.use(express.static("public"));

const tiktokUsername = process.env.TIKTOK_USERNAME;
if (!tiktokUsername) {
  console.error("❌ ERROR: TIKTOK_USERNAME belum diset di Environment Variables");
  process.exit(1);
}

const tiktok = new WebcastPushConnection(tiktokUsername);

// Event: User join
tiktok.on("roomUser", (data) => {
  console.log(`👤 ${data.uniqueId} joined`);
  io.emit("user-join", data);
});

// Event: Gift
tiktok.on("gift", (data) => {
  console.log(`🎁 ${data.uniqueId} mengirim ${data.giftName} x${data.repeatCount}`);
  io.emit("gift", data);
});

// Event: Chat
tiktok.on("chat", (data) => {
  console.log(`💬 ${data.uniqueId}: ${data.comment}`);
  io.emit("chat", data);
});

// Connect ke TikTok
tiktok.connect()
  .then(state => console.log(`✅ Connected to roomId ${state.roomId}`))
  .catch(err => console.error("❌ Connection failed:", err));

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
