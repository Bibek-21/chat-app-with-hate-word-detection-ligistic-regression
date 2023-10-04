import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios"; // Import Axios for making HTTP requests
import { process } from "../store/action/index"; // Import your process function
import "./chat.scss";
import { to_Decrypt, to_Encrypt } from "../aes.js";

function Chat({ username, roomname, socket }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("message", async (data) => {
      
      // Decrypt
      const ans = to_Decrypt(data.text, data.username);
      let processedText = process(false, ans, data.text);

      // Make an HTTP request to the hate word detection API
      try {
        const response = await axios.post(
          "http://localhost:5000/detect-hate-word",
          { text: processedText }
        );

        // Check if the API response indicates that the message contains hate words
        processedText= response.text;

       
      } catch (error) {
        console.error("Error detecting hate words:", error);
      }


      let temp = messages;
      temp.push({
        userId: data.userId,
        username: data.username,
        text: processedText, // Use the processed text
      });
      setMessages([...temp]);
    });
  }, [socket, dispatch, messages]);

  const sendData = () => {
    if (text !== "") {
      const ans = to_Encrypt(text); // You should define the to_Encrypt function
      socket.emit("chat", ans);
      setText("");
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chat">
      <div className="user-name">
        <h2>
          {username} <span style={{ fontSize: "0.7rem" }}>in {roomname}</span>
        </h2>
      </div>
      <div className="chat-message">
        {messages.map((i) => {
          if (i.username === username) {
            return (
              <div className="message" key={i.userId}>
                <p>{i.text}</p>
                <span>{i.username}</span>
              </div>
            );
          } else {
            return (
              <div className="message mess-right" key={i.userId}>
                <p>{i.text} </p>
                <span>{i.username}</span>
              </div>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="send">
        <input
          placeholder="enter your message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              sendData();
            }
          }}
        ></input>
        <button onClick={sendData}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
