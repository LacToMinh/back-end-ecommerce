import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";

export const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    // ✅ Giải mã refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );

    // ✅ Kiểm tra xem user có token này trong DB không
    const user = await UserModel.findById(decoded.id);
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // ✅ Tạo accessToken mới
    const newAccessToken = await generatedAccessToken(decoded.id);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};
