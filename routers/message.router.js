import { Router } from "express";
import messageController from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const messageRouter = Router();

messageRouter.post("/", authMiddleware, messageController.addMessage);
messageRouter.get("/:groupId", authMiddleware, messageController.getMessages);
messageRouter.get(
  "/:groupId/amount",
  authMiddleware,
  messageController.getMessagesAmount
);
