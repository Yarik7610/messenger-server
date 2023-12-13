import { Schema, model } from "mongoose";

const userSchema = new Schema({
  nickname: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatarPicture: { type: String, default: "default-avatar-picture.png" },
  contacts: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export const User = model("User", userSchema);
