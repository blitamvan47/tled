import express from "express";
import dotenv from "dotenv";
import pkg from "tiktok-live-connector";

dotenv.config();

const { WebcastPushConnection } = pkg;
const app = express();
const PORT = process.env.PORT || 10000;

// Serve frontend (HTML + JS + CSS)
app.use(express.static("public"));

// TikTok Username dari .env
const tiktokUsername = process.env.TIKTOK_USERNAME;

if (!tiktokUsername) {
  console.error("❌ ERROR: TIKTOK_USERNAME belum diset di Environment Variables");
  process.exit(1);
}

// Buat koneksi ke TikTok Live
const tiktok = new WebcastPushConnection(tiktokUsername);

// Event ketika viewer join
tiktok.on("roomUser", (data) => {
  console.log(`👤 ${data.uniqueId} joined`);
});

// Event ketika ada gift
tiktok.on("gift", (data) => {
  console.log(`🎁 ${data.uniqueId} mengirim ${data.giftName} x${data.repeatCount}`);
});

// Event ketika ada comment
tiktok.on("chat", (data) => {
  console.log(`💬 ${data.uniqueId}: ${data.comment}`);
});

// Start koneksi ke TikTok
tiktok.connect()
  .then(state => {
    console.log(`✅ Connected to roomId ${state.roomId}`);
  })
  .catch(err => {
    console.error("❌ Connection failed:", err);
  });

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
