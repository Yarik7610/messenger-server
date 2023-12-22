import { Schema, model } from "mongoose";

const messageSchema = Schema(
  {
    text: {
      type: String,
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Message = model("Message", messageSchema);
