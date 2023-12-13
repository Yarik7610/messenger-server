import { Router } from "express";
import multer from "multer";
import userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const userRouter = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

userRouter.put(
  "/updatePhoto",
  authMiddleware,
  upload.single("avatarPicture"),
  userController.updatePhoto
);
