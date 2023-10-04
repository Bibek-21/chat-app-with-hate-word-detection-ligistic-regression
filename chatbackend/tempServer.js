const express = require("express");
const app = express();
const socket = require("socket.io");
const color = require("colors");
const cors = require("cors");
const { get_Current_User, user_Disconnect, join_User } = require("./dummyuser");
const axios = require("axios"); // Import Axios for making HTTP requests

app.use(express());

const port = 8000;

app.use(cors());

var server = app.listen(
  port,
  console.log(
    `Server is running on the port no: ${(port)} `
      .green
  )
);

const io = socket(server);


// Function to send a request to the Flask API for hate word detection
async function detectHateWord(text) {
    try {
      const response = await axios.post("http://localhost:5000/detect-hate-word", {
        text: text,
      });
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

  // User sending message
  socket.on("chat", async (text) => {
    // Gets the room user and the message sent
    const p_user = get_Current_User(socket.id);

    // Detect hate words using the Flask API
    const { is_hate_word, text: modifiedText } = await detectHateWord(text);



    // Emit the modified message to the room
    io.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: is_hate_word ? "*****" : modifiedText,
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