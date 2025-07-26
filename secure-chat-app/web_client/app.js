if (!sessionStorage.getItem("username")) {
  window.location.href = "/login.html";
}

const socket = io();
const username = sessionStorage.getItem("username");
let currentRoom = "";

document.getElementById("userLabel").innerText = `You: ${username}`;
socket.emit("register_user", { username });

const chatRequestBtn = document.getElementById("chatRequestBtn");
const receiverInput = document.getElementById("receiver");
const statusEl = document.getElementById("status");
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");

// Reset chat UI
function resetUI() {
  chatRequestBtn.disabled = false;
  receiverInput.disabled = false;
  sendBtn.disabled = true;
  messageInput.disabled = true;
  chatBox.innerHTML = "";
  statusEl.innerText = "";
  currentRoom = "";
}
resetUI();

// Send chat request
chatRequestBtn.onclick = () => {
  const recipient = receiverInput.value.trim();
  if (recipient && recipient !== username) {
    socket.emit("chat_request", { sender: username, recipient });
    statusEl.innerText = `⏳ Waiting for ${recipient} to accept...`;
    chatRequestBtn.disabled = true;
    receiverInput.disabled = true;
  } else {
    alert("Enter a valid username (not your own).");
  }
};

// Incoming chat request
socket.on("incoming_chat_request", (data) => {
  if (currentRoom) return;
  const confirmed = confirm(`${data.from} wants to chat. Accept?`);
  if (confirmed) {
    socket.emit("accept_chat", { from: data.from, to: username });
    statusEl.innerText = `✅ Chat accepted. Connecting...`;
  } else {
    socket.emit("decline_chat", { from: data.from, to: username });
    statusEl.innerText = `❌ You declined the chat request from ${data.from}.`;
    chatRequestBtn.disabled = false;
    receiverInput.disabled = false;
  }
});

// Chat started
socket.on("chat_accepted", (data) => {
  currentRoom = data.room;
  statusEl.innerHTML = `✅ Chat started in room: <b>${currentRoom}</b>`;
  sendBtn.disabled = false;
  messageInput.disabled = false;
  chatRequestBtn.disabled = true;
  receiverInput.disabled = true;
});

// Chat declined
socket.on("chat_declined", (data) => {
  statusEl.innerText = `❌ ${data.by} declined your chat request.`;
  chatRequestBtn.disabled = false;
  receiverInput.disabled = false;
});

// Send message
sendBtn.onclick = () => {
  const msg = messageInput.value.trim();
  if (msg && currentRoom) {
    socket.emit("send_private_message", { room: currentRoom, sender: username, msg });
    messageInput.value = "";
  }
};

// Press Enter to send message
messageInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendBtn.click();
});

// Receive message
socket.on("receive_private_message", (data) => {
  appendMessage(data.sender, data.msg);
});

// Server status messages
socket.on("status", (data) => {
  statusEl.innerText = data.msg;
  if (data.msg.includes("not online") || data.msg.includes("declined")) {
    chatRequestBtn.disabled = false;
    receiverInput.disabled = false;
  }
});

// Append message to chat box
function appendMessage(sender, msg) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${sender}:</strong> ${msg}`;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}
