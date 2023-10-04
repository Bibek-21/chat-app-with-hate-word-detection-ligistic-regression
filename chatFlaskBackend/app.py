from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from dummyUser import dummy_user

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("joinRoom")
def handle_join(data):
    username = data["username"]
    roomname = data["roomname"]
    join_room(roomname)
    p_user = dummy_user.join_user(request.sid, username, roomname)
    send(f"{p_user['username']} has joined the chat", room=roomname)

@socketio.on("chat")
def handle_chat(data):
    p_user = dummy_user.get_current_user(request.sid)
    if p_user:
        roomname = p_user["room"]
        username = p_user["username"]
        text = data["text"]
        emit("message", {"username": username, "text": text}, room=roomname)

@socketio.on("disconnect")
def handle_disconnect():
    p_user = dummy_user.user_disconnect(request.sid)
    if p_user:
        roomname = p_user["room"]
        username = p_user["username"]
        send(f"{username} has left the chat", room=roomname)


if __name__ == "__main__":
    socketio.run(app,port=8000, debug=True)
