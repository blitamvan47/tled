const socket = io();
const log = document.getElementById("log");

function addMessage(type, text) {
  const div = document.createElement("div");
  div.className = type;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

socket.on("chat", (data) => {
  addMessage("chat", `💬 ${data.uniqueId}: ${data.comment}`);
});

socket.on("gift", (data) => {
  addMessage("gift", `🎁 ${data.uniqueId} mengirim ${data.giftName} x${data.repeatCount}`);
});

socket.on("user-join", (data) => {
  addMessage("join", `👤 ${data.uniqueId} joined`);
});
