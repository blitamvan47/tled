import express from "express";
import { WebSocketServer } from "ws";
import { TikTokIOConnection } from "tiktok-live-connector";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const USERNAME = process.env.TIKTOK_USERNAME || "default_username";

// WebSocket server untuk komunikasi ke ESP32/LED
const wss = new WebSocketServer({ noServer: true });

// Map untuk client LED
let ledClients = [];

// Koneksi ke TikTok Live
const tiktokConnection = new TikTokIOConnection(USERNAME);

tiktokConnection.connect().then(state => {
    console.log(`✅ Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error("❌ Failed to connect:", err);
});

// Kirim event ke semua LED client
function broadcast(data) {
    ledClients.forEach(ws => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(data));
        }
    });
}

// Event TikTok
tiktokConnection.on("chat", (data) => {
    console.log(`💬 ${data.nickname}: ${data.comment}`);
    broadcast({ type: "chat", user: data.nickname, comment: data.comment });
});

tiktokConnection.on("gift", (data) => {
    console.log(`🎁 ${data.nickname} sent ${data.giftName}`);
    broadcast({ type: "gift", user: data.nickname, gift: data.giftName });
});

tiktokConnection.on("like", (data) => {
    console.log(`❤️ ${data.nickname} liked`);
    broadcast({ type: "like", user: data.nickname });
});

tiktokConnection.on("follow", (data) => {
    console.log(`⭐ ${data.nickname} followed`);
    broadcast({ type: "follow", user: data.nickname });
});

tiktokConnection.on("share", (data) => {
    console.log(`🔗 ${data.nickname} shared the live`);
    broadcast({ type: "share", user: data.nickname });
});

// Server HTTP + WebSocket upgrade
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        ledClients.push(ws);
        console.log("🔌 LED client connected");

        ws.on("close", () => {
            ledClients = ledClients.filter(client => client !== ws);
            console.log("❌ LED client disconnected");
        });
    });
});

app.get("/", (req, res) => {
    res.send("TikTok LED Matrix Server is running 🚀");
});
