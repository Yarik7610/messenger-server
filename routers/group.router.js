import { Router } from "express";
import groupController from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const groupRouter = Router();

groupRouter
  .route("/")
  .get(authMiddleware, groupController.getUserGroups)
  .post(authMiddleware, groupController.createGroup);
groupRouter.put(
  "/changeAdmin/:groupId",
  authMiddleware,
  groupController.changeAdmin
);
groupRouter
  .route("/:groupId")
  .delete(authMiddleware, groupController.exitGroup)
  .put(authMiddleware, groupController.addMembers);
groupRouter.delete(
  "/:groupId/kick/:memberId",
  authMiddleware,
  groupController.kickMember
);
