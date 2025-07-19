const socket = io();
let currentUser = "";
let currentRoom = "";

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("startBtn").addEventListener("click", registerUser);

function registerUser() {
    const user = document.getElementById("userInput").value;
    currentUser = user;
    socket.emit("register", { username: currentUser });
    document.getElementById("status").innerText = `Logged in as ${user}`;
}

function initiateChat() {
    const receiver = document.getElementById("receiverInput").value;
    socket.emit("chat_request", { sender: currentUser, recipient: receiver });
}

socket.on("incoming_chat_request", (data) => {
    if (confirm(`Accept chat request from ${data.from}?`)) {
        socket.emit("accept_chat", { from: data.from, to: currentUser });
    }
});

socket.on("chat_accepted", (data) => {
    currentRoom = data.room;
    document.getElementById("status").innerText += ` | In chat: ${currentRoom}`;
});

function sendMessage() {
    const msg = document.getElementById("msgInput").value;
    if (!msg || !currentRoom) return;

    socket.emit("send_private_message", {
        room: currentRoom,
        sender: currentUser,
        message: msg
    });

    appendMessage(`${currentUser}: ${msg}`);
    document.getElementById("msgInput").value = "";
}

socket.on("receive_private_message", (data) => {
    appendMessage(`${data.sender}: ${data.message}`);
});

function appendMessage(msg) {
    const box = document.getElementById("chatBox");
    box.innerHTML += `<div><strong>${msg}</strong></div>`;
}
