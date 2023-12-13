import { Schema, model } from "mongoose";

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  }
  //   lastSender: {
  //     type: Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  //   lastMessage: {
  //     type: messageSchema,
  //   },
  //   messages: [messageSchema],
);

export const Group = model("Group", groupSchema);
