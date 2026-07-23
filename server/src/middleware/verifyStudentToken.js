import jwt from "jsonwebtoken";

export const verifyStudentToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "token missing",
      });
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    if (decoded.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Student access only",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "invalid token",
    });
  }
};
