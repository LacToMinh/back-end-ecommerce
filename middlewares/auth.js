import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const auth = async (req, res, next) => {
  try {
    // 🔹 Lấy token từ header hoặc cookie
    const token =
      req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        message: "Token is missing",
        success: false,
      });
    }

    // 🔹 Xác thực token
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    if (!decoded?.id) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    // 🔹 Tìm user theo ID (không cần populate role/permissions)
    const user = await UserModel.findById(decoded.id)
      .select("-password")
      .populate({
        path: "role",
        populate: { path: "permissions" },
      })
      .lean();
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    // ✅ Lưu user vào request để controller có thể dùng
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Unauthorized",
      success: false,
    });
  }
};

export default auth;
