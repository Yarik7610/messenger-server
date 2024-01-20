import { Group } from "../Models/Group.js";
import { User } from "../Models/User.js";

class GroupController {
  async getUserGroups(req, res) {
    try {
      const groups = await Group.find({
        members: { $in: [req.userId] },
      }).populate("members", "login nickname avatarPicture ");
      res.status(200).json(groups);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  async createGroup(req, res) {
    let newMembers = [...req.body.members, req.userId];
    const newGroup = {
      name: req.body.name,
      members: newMembers,
      type: req.body.type,
      admin: req.body.admin || "",
    };
    const finalGroup = new Group(newGroup);
    try {
      const result = await finalGroup.save();
      const newGroupId = result._id;
      const finalResult = await Group.findById(newGroupId).populate(
        "members",
        "login nickname avatarPicture"
      );
      res.status(201).json(finalResult);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  async changeAdmin(req, res) {
    try {
      const group = await Group.findById(req.params.groupId);
      if (group.type === "private")
        return res.status(400).json({
          message: "This is a private group, there must be no admins",
        });
      if (group.admin !== req.userId)
        return res.status(400).json({ message: "You are not the admin" });
      if (group.admin === req.body.member)
        return res.status(400).json({ message: "Can't change admin on admin" });
      const findMember = await Group.findOne({
        _id: req.params.groupId,
        members: { $in: [req.body.member] },
      });
      if (!findMember)
        return res
          .status(400)
          .json({ message: "There is no such member in group" });
      const finalGroup = await Group.findByIdAndUpdate(
        req.params.groupId,
        {
          admin: req.body.member,
        },
        { new: true }
      );
      res.status(200).json(finalGroup);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async exitGroup(req, res) {
    try {
      const group = await Group.findByIdAndUpdate(
        req.params.groupId,
        {
          $pull: { members: req.userId },
        },
        { new: true }
      );
      if (group.members.length === 0)
        await Group.findByIdAndDelete(req.params.groupId);
      res.status(200).json({ groupId: req.params.groupId });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async addMembers(req, res) {
    try {
      const isInGroup = await Group.findOne({
        _id: req.params.groupId,
        members: { $in: [req.userId] },
      });
      if (!isInGroup) {
        return res.status(400).json({
          message: "You are not member of this group",
        });
      }
      const areNewMembersInContactList = await User.findOne({
        _id: req.userId,
        contacts: { $all: req.body.newMembers },
      });
      if (!areNewMembersInContactList)
        return res.status(400).json({
          message: "You can add only your contacts",
        });
      const areNewMembersInGroup = await Group.findOne({
        _id: req.params.groupId,
        members: { $in: req.body.newMembers },
      });
      if (areNewMembersInGroup)
        return res.status(400).json({
          message: "You can't add members twice",
        });
      const finalGroup = await Group.findByIdAndUpdate(
        req.params.groupId,
        {
          $push: { members: { $each: req.body.newMembers } },
        },
        { new: true }
      );
      const newMembersData = await User.find({
        _id: { $in: req.body.newMembers },
      }).select("login nickname avatarPicture");
      res
        .status(200)
        .json({ _id: req.params.groupId, newMembers: newMembersData });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async kickMember(req, res) {
    try {
      const group = await Group.findById(req.params.groupId);
      if (group.type === "private")
        return res.status(400).json({
          message: "This is a private group, there must be no admins",
        });
      if (group.admin !== req.userId)
        return res.status(400).json({ message: "You are not the admin" });
      const isMemberInGroup = await Group.findOne({
        _id: req.params.groupId,
        members: { $in: [req.params.memberId] },
      });
      if (!isMemberInGroup)
        return res
          .status(400)
          .json({ message: "No such member in this group" });
      if (req.userId === req.params.memberId)
        return res.status(400).json({
          message: "Can't kick yourself, use quit function",
        });
      const finalGroup = await Group.findByIdAndUpdate(
        req.params.groupId,
        { $pull: { members: req.params.memberId } },
        { new: true }
      );
      res
        .status(200)
        .json({ _id: finalGroup._id, memberId: req.params.memberId });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
}
export default new GroupController();
