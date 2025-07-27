// Prompt user for username if not set
let username = sessionStorage.getItem("username");
if (!username) {
  username = prompt("Enter your username for this tab:");
  if (!username || username.trim().length < 1) {
    alert("Username is required.");
    window.location.href = "/login.html";
  } else {
    username = username.trim();
    sessionStorage.setItem("username", username);
  }
}

const socket = io();
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
  const confirmChat = confirm(`${data.from} wants to chat. Accept?`);
  if (confirmChat) {
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

// Press Enter to send
messageInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendBtn.click();
});

// Receive message
socket.on("receive_private_message", (data) => {
  appendMessage(data.sender, data.msg);
});

// Status updates
socket.on("status", (data) => {
  statusEl.innerText = data.msg;
  if (data.msg.includes("not online") || data.msg.includes("declined")) {
    chatRequestBtn.disabled = false;
    receiverInput.disabled = false;
  }
});

// Display message
function appendMessage(sender, msg) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${sender}:</strong> ${msg}`;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
  chatBox.scrollIntoView({ behavior: "smooth", block: "end" });
}


document.getElementById("logoutBtn").onclick = function logout() {
  sessionStorage.clear();
  window.location.href = "/login.html";
};

window.onload = () => {
  const chatBox = document.getElementById("chatBox");
  const messageInput = document.getElementById("messageInput");

  messageInput.addEventListener("focus", () => {
    setTimeout(() => {
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 300); // delay ensures keyboard is fully opened
  });
};
