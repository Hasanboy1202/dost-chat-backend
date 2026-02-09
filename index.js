const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ONLINE USERS MEMORY
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Foydalanuvchi ulandi:", socket.id);

  socket.on("user-online", ({ userId, username }) => {
    onlineUsers[userId] = username;
    socket.userId = userId;
    io.emit("online-users", onlineUsers);
    console.log(username, "online");
  });

  socket.on("group-message", (data) => {
    io.emit("group-message", {
      ...data,
      time: new Date()
    });
  });

  socket.on("private-message", (data) => {
    io.emit("private-message", {
      ...data,
      time: new Date()
    });
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      delete onlineUsers[socket.userId];
      io.emit("online-users", onlineUsers);
      console.log("Foydalanuvchi offline:", socket.userId);
    }
  });
});

// TEST API
app.get("/", (req, res) => {
  res.send("Dost Chat Backend ishlayapti 🚀");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server ishga tushdi:", PORT);
});
