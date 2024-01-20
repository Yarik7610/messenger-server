import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";

const generateAccessToken = (id) => {
  const payload = { id };
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "7d" });
};

class authController {
  async signup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Check the length of login, nickname or password" });
      }
      const { login, nickname, password } = req.body;
      const canditate = await User.findOne({ login });
      if (canditate) {
        return res.status(400).json({ message: "This login is already taken" });
      }
      const hashedPassword = bcrypt.hashSync(password, 5);
      const newUser = new User({ login, nickname, password: hashedPassword });
      await newUser.save();
      return res.status(201).json({ message: "You've signed up" });
    } catch (e) {
      res.status(500).json({ message: "Signup error" });
    }
  }
  async login(req, res) {
    const { login, password } = req.body;
    const candidate = await User.findOne({ login });
    if (!candidate) {
      return res.status(400).json({ message: "Wrong password or login" });
    }
    const validPassword = bcrypt.compareSync(password, candidate.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password or login" });
    }
    const token = generateAccessToken(candidate._id);
    res.status(200).json({
      login: candidate.login,
      nickname: candidate.nickname,
      _id: candidate._id,
      avatarPicture: candidate.avatarPicture,
      token,
    });
  }
  async me(req, res) {
    try {
      const me = await User.findById(req.userId, { password: 0 });
      if (!me) {
        return res.status(403).json({ message: "No such user" }); //если из бд удалить чела пока он зареган, то надо код ответа 403 для интерцептора
      }
      const token = generateAccessToken(me._id);
      res.json({
        login: me.login,
        nickname: me.nickname,
        _id: me._id,
        avatarPicture: me.avatarPicture,
        token,
        message: "You are authorized",
      });
    } catch (e) {
      res.status(403).json({ message: e.message });
    }
  }
}
export default new authController();
