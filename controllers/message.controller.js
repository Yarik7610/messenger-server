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
  async getMessagesAmount(req, res) {
    try {
      const messagesCount = await Message.countDocuments({
        group: req.params.groupId,
      });
      res.status(200).json(messagesCount);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  async getMessages(req, res) {
    const page = req.query.page;
    if (!page)
      return res.status(400).json({ message: "No page found in query" });
    const pageSize = 50;
    try {
      const group = await Group.findOne({
        _id: req.params.groupId,
        members: { $in: [req.userId] },
      });
      if (!group)
        return res.status(404).json({ message: "You are not in this group" });

      const messages = await Message.find({
        group: req.params.groupId,
      })
        .sort({ createdAt: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate("sender", "avatarPicture nickname");
      res.status(200).json(messages);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
}
export default new MessageController();
