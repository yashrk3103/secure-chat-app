import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, send_from_directory, request  # ✅ FIXED: added `request`
from flask_socketio import SocketIO, emit, join_room
import os

# Project path setup
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
WEB_DIR = os.path.join(BASE_DIR, 'web_client')

app = Flask(__name__, static_folder=WEB_DIR, template_folder=WEB_DIR)
app.config['SECRET_KEY'] = '195007820aac318d4da604f40153bf7652eef665b1f7ab0b2022bc8b5c4e2c5a'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store username -> sid
connected_users = {}

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(WEB_DIR, filename)

@socketio.on("register_user")
def handle_register_user(data):
    username = data["username"]
    connected_users[username] = request.sid
    print(f"✅ {username} registered with SID {request.sid}")

@socketio.on("chat_request")
def handle_chat_request(data):
    sender = data["sender"]
    recipient = data["recipient"]
    print(f"📨 {sender} wants to chat with {recipient}")

    if recipient in connected_users:
        emit("incoming_chat_request", {"from": sender}, to=connected_users[recipient])
    else:
        emit("status", {"msg": f"{recipient} is not online."}, to=request.sid)

@socketio.on("accept_chat")
def handle_accept_chat(data):
    from_user = data["from"]
    to_user = data["to"]
    users = sorted([from_user, to_user])
    room = f"{users[0]}_{users[1]}"

    # Join both users into the same room
    join_room(room, sid=request.sid)
    emit("chat_accepted", {"room": room}, to=request.sid)

    if from_user in connected_users:
        join_room(room, sid=connected_users[from_user])
        emit("chat_accepted", {"room": room}, to=connected_users[from_user])
        print(f"✅ Chat room {room} created between {from_user} and {to_user}")

@socketio.on("send_private_message")
def handle_private_message(data):
    room = data["room"]
    sender = data["sender"]
    msg = data["msg"]
    print(f"💬 [{room}] {sender}: {msg}")
    emit("receive_private_message", {"sender": sender, "msg": msg}, room=room)

if __name__ == '__main__':
    socketio.run(app, port=5000)
