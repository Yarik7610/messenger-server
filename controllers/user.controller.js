import { User } from "../Models/User.js";

class UserController {
  async updatePhoto(req, res) {
    const imageName = req.file.originalname;
    try {
      await User.findByIdAndUpdate(
        req.userId,
        {
          avatarPicture: imageName,
        },
        { new: true }
      );
      return res.status(200).json({ avatarPicture: imageName });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
}
export default new UserController();
