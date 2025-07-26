import eventlet
eventlet.monkey_patch()

from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
WEB_DIR = os.path.join(BASE_DIR, 'web_client')

app = Flask(__name__, static_folder=WEB_DIR, template_folder=WEB_DIR)
app.config['SECRET_KEY'] = '7e822abfba9076b4ef62cff581d75edb8255d3710fc4a67f22ca3430b001f7cb'
socketio = SocketIO(app, cors_allowed_origins="*")

connected_users = {}  # username -> sid
active_chats = {}     # username -> room

@app.route('/')
def index():
    return send_from_directory(WEB_DIR, 'login.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(WEB_DIR, path)

@socketio.on("register_user")
def register_user(data):
    username = data.get("username")
    connected_users[username] = request.sid
    print(f"✅ {username} connected with SID {request.sid}")
    print("Current users:", connected_users)

@socketio.on("chat_request")
def chat_request(data):
    sender = data["sender"]
    recipient = data["recipient"]
    print(f"📨 {sender} wants to chat with {recipient}")
    if recipient == sender:
        emit("status", {"msg": "You cannot chat with yourself."}, to=request.sid)
        return
    if sender in active_chats or recipient in active_chats:
        emit("status", {"msg": "One of you is already in a chat."}, to=request.sid)
        return
    if recipient in connected_users:
        emit("incoming_chat_request", {"from": sender}, to=connected_users[recipient])
    else:
        emit("status", {"msg": f"{recipient} is not online."}, to=request.sid)

@socketio.on("accept_chat")
def accept_chat(data):
    from_user = data["from"]
    to_user = data["to"]
    users = sorted([from_user, to_user])
    room = f"{users[0]}_{users[1]}"
    join_room(room, sid=connected_users[from_user])
    join_room(room, sid=connected_users[to_user])
    active_chats[from_user] = room
    active_chats[to_user] = room
    emit("chat_accepted", {"room": room}, to=connected_users[from_user])
    emit("chat_accepted", {"room": room}, to=connected_users[to_user])
    print(f"✅ Chat started in room {room} between {from_user} and {to_user}")

@socketio.on("decline_chat")
def decline_chat(data):
    from_user = data["from"]
    to_user = data["to"]
    if from_user in connected_users:
        emit("chat_declined", {"by": to_user}, to=connected_users[from_user])

@socketio.on("send_private_message")
def private_message(data):
    room = data["room"]
    sender = data["sender"]
    msg = data["msg"]
    print(f"💬 [{room}] {sender}: {msg}")
    emit("receive_private_message", {"sender": sender, "msg": msg}, room=room)

@socketio.on('disconnect')
def handle_disconnect():
    disconnected_sid = request.sid
    for username, sid in list(connected_users.items()):
        if sid == disconnected_sid:
            print(f"❌ {username} disconnected")
            del connected_users[username]
            # Remove from active_chats and notify the other user
            if username in active_chats:
                room = active_chats[username]
                for user, r in list(active_chats.items()):
                    if r == room:
                        del active_chats[user]
                emit("status", {"msg": f"{username} has left the chat."}, room=room)
            break

if __name__ == '__main__':
    socketio.run(app, port=5000)
