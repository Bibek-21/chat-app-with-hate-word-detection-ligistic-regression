const express = require("express");
const app = express();
const socket = require("socket.io");
const color = require("colors");
const cors = require("cors");
const { get_Current_User, user_Disconnect, join_User } = require("./dummyuser");
const { default: axios } = require("axios");
const { to_Encrypt, to_Decrypt } = require("./ase");

app.use(express());

const port = 8000;

app.use(cors());

var server = app.listen(
  port,
  console.log(`Server is running on the port no: ${port} `.green)
);

const io = socket(server);

// Function to send a request to the Flask API for hate word detection
async function detectHateWord(text) {
  try {
    const response = await axios.post(
      "http://localhost:5000/detect-hate-word",
      {
        text: text,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error detecting hate word:", error.message);
    return error; // Default to not a hate word on error
  }
}

//initializing the socket io connection
io.on("connection", (socket) => {
  //for a new user joining the room
  socket.on("joinRoom", ({ username, roomname }) => {
    //* create user
    const p_user = join_User(socket.id, username, roomname);
    console.log(socket.id, "=id");
    socket.join(p_user.room);

    //display a welcome message to the user who have joined a room
    socket.emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `Welcome ${p_user.username}`,
    });

    //displays a joined room message to all other room users except that particular user
    socket.broadcast.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `${p_user.username} has joined the chat`,
    });
  });

  //user sending message
  socket.on("chat", async (text) => {
    //gets the room user and the message
    let newText = text;
    const p_user = get_Current_User(socket.id);
    console.log({ id: socket.room, text, username: p_user?.username });

    if (p_user?.room && socket?.id) {
      const decryptData = to_Decrypt(text, p_user?.username);
      // const isHateWord =
      const { is_hate_word, text: newT } = await detectHateWord(decryptData);
      if (is_hate_word) {
        newText = "/70o9oexpULqr8+RnWIUD2DFxyiO";
      }
      console.log({ newText });
    }

    io.to(p_user?.room).emit("message", {
      userId: p_user?.id,
      username: p_user?.username,
      text: newText,
    });
  });

  //when the user exits the room
  socket.on("disconnect", () => {
    //the user is deleted from array of users and a left room message displayed
    const p_user = user_Disconnect(socket.id);

    if (p_user) {
      io.to(p_user.room).emit("message", {
        userId: p_user.id,
        username: p_user.username,
        text: `${p_user.username} has left the chat`,
      });
    }
  });
});
