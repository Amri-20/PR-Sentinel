import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return req.status(401).json({
        sucess: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return req.status(401).json({
      sucess: false,
      message: "Invalid or expired session",
    });
  }
};
