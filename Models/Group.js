import { Schema, model } from "mongoose";

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  admin: {
    type: String,
    default: "",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export const Group = model("Group", groupSchema);
