import { Router } from "express";
import groupController from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const groupRouter = Router();

groupRouter
  .route("/")
  .get(authMiddleware, groupController.getUserGroups)
  .post(authMiddleware, groupController.createGroup);
groupRouter.delete("/:groupId", authMiddleware, groupController.exitGroup);
