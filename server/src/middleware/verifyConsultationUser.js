import jwt from "jsonwebtoken";

export const verifyConsultationUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader.split(" ")[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.patientId) {
      req.user = {
        role: "patient",
        patientId: decoded.patientId,
      };

      return next();
    } else if (decoded.studentId) {
      req.user = {
        role: "student",
        studentId: decoded.studentId,
      };
      return next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
