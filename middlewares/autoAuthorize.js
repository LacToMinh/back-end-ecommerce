// middlewares/autoAuthorize.js
import PermissionModel from "../models/permission.model.js";
import { hasPermission } from "./authorize.js";

/**
 * Middleware: tự động tải danh sách quyền (actions) từ DB
 * Gắn vào req.permissionMap để router có thể sử dụng
 */
export const autoAuthorize = async (req, res, next) => {
  try {
    const permissions = await PermissionModel.find({}).lean();

    // Tạo map code -> middleware kiểm tra quyền
    const permissionMap = {};
    permissions.forEach((p) => {
      p.actions?.forEach((a) => {
        permissionMap[a.code] = hasPermission(a.code);
      });
    });

    req.permissionMap = permissionMap;
    next();
  } catch (err) {
    console.error("❌ autoAuthorize error:", err);
    res
      .status(500)
      .json({ message: "Không thể tải danh sách quyền từ hệ thống!" });
  }
};
