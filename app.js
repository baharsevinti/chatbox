require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { OpenAI } = require("openai");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

// OpenAI API configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New user connected");

  
  const conversationHistory = [];

  socket.on("sendMessage", async (message, callback) => {
    try {
      
      conversationHistory.push({ role: "kullanıcı", content: message });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: conversationHistory,
      });

      const response = completion.choices[0].message.content;

      conversationHistory.push({ role: "asistan", content: response });

      socket.emit("message", response);
      callback();
    } catch (error) {
      console.error("bir hata oluştu");
      callback("Hata: Chatbota bağlanıamadı");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});