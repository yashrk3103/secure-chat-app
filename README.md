# 🔐 Secure Chat App – End-to-End Encrypted Messenger

A responsive and real-time web-based chat application built with **Flask**, **Socket.IO**, and **Web Crypto API** that supports **end-to-end encrypted** private messaging. Designed with login, registration, encryption, session handling, and optimized UI for **both mobile and desktop**.

> ✅ Developed by: **Yash Khunt**  
> 🛡️ Domain: Cyber Security  
> 🏢 Company: Elevate Labs

---

## 🚀 Features

- 🔐 **End-to-End Encryption (E2EE)**
  - RSA for secure key exchange
  - AES-GCM for fast message encryption
  - All encryption handled **in-browser**

- 🧑‍💻 **Authentication**
  - User login & registration with password
  - Session-based login using Flask

- 💬 **Real-time Private Chat**
  - Chat over private Socket.IO rooms
  - Secure key handshake before messaging

- 🌗 **Dark/Light Mode UI Toggle**
  - Clean and modern responsive design
  - Styled chat bubbles for sender & receiver
  - Fully responsive on both desktop and mobile

- 📱 **Mobile UX Optimized**
  - Keyboard aware chat box scroll
  - Works across tabs, browsers, and devices

- 🔒 **Encrypted Logging (Optional)**
  - Server-side `.enc` log file for admin-only auditing

---

## 🧩 Tech Stack

| Layer     | Tech                            |
|-----------|----------------------------------|
| Frontend  | HTML, CSS (Tailwind), JS (Web Crypto) |
| Backend   | Python (Flask), Flask-SocketIO  |
| Auth      | SQLite + session login          |
| Security  | RSA (Key Exchange), AES-GCM     |
| Real-Time | WebSockets via Socket.IO        |

---

## 🛠️ Setup & Run Instructions

### 📦 1. Clone the Repo

```bash
git clone https://github.com/yashrk3103/secure-chat-app.git
cd secure-chat-app

---
🐍 2. Setup Python Backend
python -m venv .venv
# Activate:
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt

---

▶️ 3. Run Flask App
python secure-chat-app/server/server.py

---

📁 Project Structure
secure-chat-app/
├── client/
├── server/
│   ├── instance/
│   │   ├── db.sqlite3
│   │   ├── chat_logs.enc
│   ├── models.py
│   ├── server.py
├── web_client/
│   ├── index.html
│   ├── login.html
│   ├── chat.html
│   ├── app.js
│   ├── chat.js
│   ├── styles.css
│   └── screenshots/
│       ├── desktop_login.jpg
│       ├── desktop_chat.jpg
│       ├── mobile_login.jpg
│       ├── mobile_chat.jpg
├── requirements.txt
└── README.md

