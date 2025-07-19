const socket = io();
let currentUser = "";
let currentRoom = "";

document.getElementById("loginBtn").onclick = () => {
    currentUser = document.getElementById("userInput").value.trim();
    if (!currentUser) return alert("Enter username");
    
    socket.emit("register_user", { username: currentUser });
    document.getElementById("loggedUser").innerText = currentUser;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("chat-setup").style.display = "block";
};

document.getElementById("sendRequestBtn").onclick = () => {
    const recipient = document.getElementById("receiverInput").value.trim();
    if (!recipient) return alert("Enter recipient username");
    socket.emit("chat_request", { sender: currentUser, recipient });
    document.getElementById("status").innerText = `⏳ Waiting for ${recipient} to accept...`;
};

socket.on("incoming_chat_request", (data) => {
    const sender = data.from;
    const accept = confirm(`${sender} wants to chat. Accept?`);
    if (accept) {
        socket.emit("accept_chat", { from: sender, to: currentUser });
    }
});

socket.on("chat_accepted", (data) => {
    currentRoom = data.room;
    document.getElementById("chatBox").style.display = "block";
    document.getElementById("status").innerHTML = `✅ Chat started in room: ${currentRoom}`;
});

document.getElementById("sendBtn").onclick = () => {
    const msg = document.getElementById("msgInput").value.trim();
    if (!msg || !currentRoom) return;
    socket.emit("send_private_message", {
        room: currentRoom,
        sender: currentUser,
        msg
    });
    document.getElementById("msgInput").value = "";
};

socket.on("receive_private_message", (data) => {
    const chatWindow = document.getElementById("chatWindow");
    const newMsg = document.createElement("div");
    newMsg.innerHTML = `<strong>${data.sender}:</strong> ${data.msg}`;
    chatWindow.appendChild(newMsg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});
