const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./Config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");
const messageRoutes = require("./routes/messageRoutes");

const path = require("path");
//require("dotenv").config({ path: path.resolve(__dirname + "./.env") });
dotenv.config();
connectDB();
const app = express();

app.use(express.json());
// app.use(cors());
const corsOptions = {
  origin: '*', // This will allow all origins
  methods: ['GET', 'POST'], // Allow only these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow only these headers
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions));
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ----------------------------Deployment--------------------------------

// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running");
//   });
// }
// ----------------------------Deployment--------------------------------

app.use(notFound);
app.use(errorHandler);
const server = app.listen(PORT, console.log(`Server Started on PORT ${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Specify allowed methods if needed
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers if needed
    credentials: true, // Allow credentials if needed
  },
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    //console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined Room:" + room);
  });

  //creating new socket for typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stoptyping", (room) => socket.in(room).emit("stoptyping"));

  //send message functionality
  socket.on("New Message", (newMessageRecived) => {
    var chat = newMessageRecived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecived.sender._id) return;

      // "in" means inside that user's room, emit/send that message
      socket.in(user._id).emit("Message Recived", newMessageRecived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
