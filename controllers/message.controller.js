import { Group } from "../Models/Group.js";
import { Message } from "../Models/Message.js";

class MessageController {
  async addMessage(req, res) {
    if (!req.body.text)
      return res.status(400).json({ message: "Can't send empty message" });
    const message = {
      text: req.body.text,
      group: req.body.groupId,
      sender: req.userId,
    };
    const newMessage = new Message(message);
    try {
      const result = await newMessage.save();
      const newMessageId = result._id;
      const finalMessage = await Message.findById(newMessageId).populate(
        "sender",
        "avatarPicture nickname"
      );
      res.status(201).json(finalMessage);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  async getMessages(req, res) {
    try {
      const group = await Group.findOne({
        _id: req.params.groupId,
        members: { $in: [req.userId] },
      });
      if (!group)
        return res.status(404).json({ message: "You are not in this group" });
      const messages = await Message.find({
        group: req.params.groupId,
      }).populate("sender", "avatarPicture nickname");
      res.status(200).json(messages);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
}
export default new MessageController();
