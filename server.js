import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { WebcastPushConnection } from "tiktok-live-connector";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || "default_username";

// Serve file static (index.html, dll)
app.use(express.static("public"));

let tiktokConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// Event TikTok
tiktokConnection.connect().then(state => {
  console.log(`Connected to roomId ${state.roomId}`);
}).catch(err => {
  console.error("Failed to connect", err);
});

// Event Like
tiktokConnection.on("like", (data) => {
  io.emit("event", {
    type: "like",
    username: data.uniqueId,
    likeCount: data.likeCount
  });
});

// Event Comment
tiktokConnection.on("chat", (data) => {
  io.emit("event", {
    type: "comment",
    username: data.uniqueId,
    comment: data.comment
  });
});

// Event Gift
tiktokConnection.on("gift", (data) => {
  io.emit("event", {
    type: "gift",
    username: data.uniqueId,
    giftName: data.giftName,
    repeatEnd: data.repeatEnd
  });
});

// Event Follow
tiktokConnection.on("follow", (data) => {
  io.emit("event", {
    type: "follow",
    username: data.uniqueId
  });
});

// Event Share
tiktokConnection.on("share", (data) => {
  io.emit("event", {
    type: "share",
    username: data.uniqueId
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
