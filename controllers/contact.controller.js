import { User } from "../Models/User.js";

class ContactController {
  async getContacts(req, res) {
    try {
      const user = await User.findById(req.userId);
      const userIDs = user.contacts;
      const contacts = await User.find({ _id: { $in: userIDs } }).select(
        "nickname avatarPicture"
      );
      return res.status(200).json(contacts);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async addContact(req, res) {
    if (req.userId === req.body.contactId)
      return res.status(400).json({ message: "Can't add yourself" });

    try {
      const haveContactAlready = await User.findOne({
        _id: req.userId,
        contacts: req.body.contactId,
      });
      if (haveContactAlready)
        return res
          .status(400)
          .json({ message: "You already have this contact" });

      await User.findByIdAndUpdate(
        req.userId,
        {
          $push: { contacts: req.body.contactId },
        },
        { new: true }
      );
      const newContact = await User.findById(req.body.contactId).select(
        "nickname avatarPicture"
      );
      return res.status(201).json(newContact);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async removeContact(req, res) {
    if (req.userId === req.params.contactId)
      return res
        .status(400)
        .json({ message: "Can't remove yourself from contacts" });
    try {
      await User.findByIdAndUpdate(
        req.userId,
        { $pull: { contacts: req.params.contactId } },
        { new: true }
      );
      return res.status(200).json({ contactId: req.params.contactId });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
}
export default new ContactController();
