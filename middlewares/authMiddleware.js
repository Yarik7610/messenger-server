import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // token == "Bearer dsada'dasdasda;dslad"
    if (!token) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const decodedData = jwt.verify(token, process.env.SECRET_KEY); //payload токена
    req.userId = decodedData.id;
    next();
  } catch (e) {
    res.status(403).json({ message: "You are not authorized" });
  }
};
