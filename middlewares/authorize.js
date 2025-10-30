// middlewares/authorize.js
export const hasPermission = (requiredCode) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
      }

      const role = req.user.role;

      // ✅ ADMIN → full quyền
      if (role?.name?.toUpperCase() === "ADMIN" || role?.name?.toUpperCase() === "SUPER ADMIN") {
        return next();
      }

      // ✅ Gom tất cả code quyền (xử lý cả dạng object lẫn dạng string)
      const allCodes = [];

      if (Array.isArray(role?.permissions)) {
        role.permissions.forEach((p) => {
          if (typeof p === "string") {
            allCodes.push(p); // chuỗi
          } else if (p?.code) {
            allCodes.push(p.code);
            if (Array.isArray(p.actions)) {
              allCodes.push(...p.actions.map((a) => a.code));
            }
          }
        });
      }

      // ✅ Kiểm tra xem có chứa mã quyền yêu cầu không
      const hasPerm = allCodes.some((c) => c?.includes(requiredCode));

      if (!hasPerm) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền: ${requiredCode}`,
        });
      }

      next();
    } catch (err) {
      console.error("❌ hasPermission error:", err);
      res.status(500).json({ message: "Lỗi kiểm tra quyền!" });
    }
  };
};
