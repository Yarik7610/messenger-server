import { Router } from "express";
import { check } from "express-validator";
import authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
export const authRouter = Router();

authRouter.post(
  "/signup",
  [
    check(
      "login",
      "Login length should be minimum 1 symbol and not more than 50 symbols"
    ).isLength({
      min: 1,
      max: 50,
    }),
    check(
      "nickname",
      "Nickname length should be minimum 1 symbol and not more than 50 symbols"
    ).isLength({
      min: 1,
      max: 50,
    }),
    check(
      "password",
      "Password length should be minimum 6 symbols and not more than 50 symbols"
    ).isLength({
      min: 6,
      max: 50,
    }),
  ],
  authController.signup
);
authRouter.post("/login", authController.login);
authRouter.get("/me", authMiddleware, authController.me);
