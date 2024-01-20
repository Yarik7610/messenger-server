import { User } from "../Models/User.js";

class ContactController {
  async getContacts(req, res) {
    try {
      const user = await User.findById(req.userId);
      const userIDs = user.contacts;
      const contacts = await User.find({ _id: { $in: userIDs } }).select(
        "login nickname avatarPicture"
      );
      return res.status(200).json(contacts);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  async addContact(req, res) {
    try {
      const me = await User.findById(req.userId);
      if (me.login === req.body.contactLogin)
        return res.status(400).json({ message: "Can't add yourself" });

      const haveContactAlready = me.contacts.some(
        (c) => c.login === req.body.contactLogin
      );
      if (haveContactAlready)
        return res
          .status(400)
          .json({ message: "You already have this contact" });

      const newContact = await User.findOne({
        login: req.body.contactLogin,
      }).select("login nickname avatarPicture");
      if (!newContact)
        return res.status(404).json({ message: "User not found" });

      await User.findByIdAndUpdate(
        req.userId,
        {
          $push: { contacts: newContact._id },
        },
        { new: true }
      );
      return res.status(201).json(newContact);
    } catch (e) {
      console.log(e);
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
