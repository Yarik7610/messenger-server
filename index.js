import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { authRouter } from "./routers/auth.router.js";
import { contactRouter } from "./routers/contact.router.js";
import { groupRouter } from "./routers/group.router.js";
import { messageRouter } from "./routers/message.router.js";
import { userRouter } from "./routers/user.router.js";

dotenv.config();
const PORT = process.env.PORT;
const URL = process.env.URL;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);
app.use("/api/group", groupRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);
app.use("/api/images/", express.static("uploads"));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  },
});

let activeUsers = [];
let unreadMessages = {};
io.on("connection", (socket) => {
  const id = socket.handshake.query.id;

  socket.on("addNewUser", () => {
    if (!activeUsers.some((user) => user.userId === id)) {
      activeUsers.push({ id });
      // console.log("User connected", activeUsers);
    }
    io.emit("getActiveUsers", activeUsers);
  });

  //к комнате подключается группа, а не юзер
  socket.on("joinRoom", (groupId) => {
    socket.join(groupId);
  });
  socket.on("leaveRoom", (groupId) => {
    delete unreadMessages[groupId][id];
    // console.log(unreadMessages);
    socket.leave(groupId);
  });

  socket.on("addMember", ({ groupId, membersIds }) => {
    if (unreadMessages[groupId]) {
      membersIds.forEach((memberId) => {
        unreadMessages[groupId][memberId] = {};
        unreadMessages[groupId][memberId]["value"] = 0;
        unreadMessages[groupId][memberId]["isRead"] = false;
      });
    }
    // console.log(unreadMessages);
  });
  socket.on("pushGroupMembers", ({ groupId, membersIds }) => {
    if (!unreadMessages[groupId]) {
      unreadMessages[groupId] = {};
      membersIds.forEach((memberId) => {
        unreadMessages[groupId][memberId] = {};
        if (unreadMessages[groupId][memberId]["value"] > 0) return;
        else {
          unreadMessages[groupId][memberId]["value"] = 0;
          unreadMessages[groupId][memberId]["isRead"] = false;
        }
      });
    }
    // console.log(unreadMessages);
    socket.emit("getUsersUnreadGroupMessages", {
      groupUnreadMessages: unreadMessages[groupId],
      groupId,
    });
  });

  socket.on("setReadUser", (groupId) => {
    if (unreadMessages[groupId] && unreadMessages[groupId][id])
      unreadMessages[groupId][id]["isRead"] = true;
  });
  socket.on("unsetReadUser", (groupId) => {
    if (unreadMessages[groupId] && unreadMessages[groupId][id])
      unreadMessages[groupId][id]["isRead"] = false;
  });

  socket.on("resetUsersUnreadGroupMessages", (groupId) => {
    if (unreadMessages[groupId] && unreadMessages[groupId][id])
      unreadMessages[groupId][id]["value"] = 0;
  });

  socket.on("sendNewMessage", ({ message, groupId, senderId }) => {
    for (let user in unreadMessages[groupId]) {
      if (user !== senderId && !unreadMessages[groupId][user]["isRead"]) {
        unreadMessages[groupId][user]["value"]++;
      }
    }
    // console.log(unreadMessages);
    io.to(groupId).emit("getNewMessage", { message, groupId });
    io.to(groupId).emit("getUsersUnreadGroupMessages", {
      groupUnreadMessages: unreadMessages[groupId],
      groupId,
    });
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((u) => u.id !== id);
    io.emit("getActiveUsers", activeUsers);
    // console.log("User disconnected", activeUsers);
  });
});

const start = async () => {
  try {
    await mongoose.connect(URL);
    console.log(`Connected to DB`);
    server.listen(PORT, (e) =>
      e
        ? console.log(`Port problem: ${e}`)
        : console.log(`App listening port: ${PORT}`)
    );
  } catch (e) {
    console.log(`Can't connect to ${e}`);
  }
};
start();
