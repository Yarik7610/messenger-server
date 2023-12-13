import { Group } from "../Models/Group.js";

class GroupController {
  async createGroup(req, res) {
    const members = req.body.members;
    if (!members || members.length === 0)
      return res.status(400).json({ message: "Can't create empty group" });
    let newMembers;
    //если один юзре придет, то придет в виде строки, а если больше одного, то в виде массива
    if (!Array.isArray(members)) newMembers = [members, req.userId];
    else newMembers = [...members, req.userId];
    const newGroup = { name: req.body.name, members: newMembers };
    const finalGroup = new Group(newGroup);
    try {
      const result = await finalGroup.save();
      const newGroupId = result._id;
      const finalResult = await Group.findById(newGroupId).populate(
        "members",
        "nickname avatarPicture"
      );
      res.status(201).json(finalResult);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  async getUserGroups(req, res) {
    try {
      const groups = await Group.find({
        members: { $in: [req.userId] },
      }).populate("members", "nickname avatarPicture ");
      res.status(200).json(groups);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  async exitGroup(req, res) {
    try {
      await Group.findByIdAndUpdate(req.params.groupId, {
        $pull: { members: req.userId },
      });
      res.status(200).json({ groupId: req.params.groupId });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
}
export default new GroupController();
