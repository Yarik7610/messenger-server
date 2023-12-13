import { Router } from "express";
import contactController from "../controllers/contact.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const contactRouter = Router();

contactRouter
  .route("/")
  .get(authMiddleware, contactController.getContacts)
  .post(authMiddleware, contactController.addContact);
contactRouter.delete(
  "/:contactId",
  authMiddleware,
  contactController.removeContact
);
