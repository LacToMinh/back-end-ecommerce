// middlewares/safePermission.js
const DEV_MODE = false; // true = bỏ qua kiểm tra khi dev

export const safePermission = (requiredCode) => {
  return (req, res, next) => {
    try {
      // 1️⃣ Chưa đăng nhập
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Bạn chưa đăng nhập.",
        });
      }

      const role = req.user.role;
      if (!role) {
        return res.status(403).json({
          success: false,
          message: "Không xác định được vai trò người dùng.",
        });
      }

      // 2️⃣ ADMIN → full quyền
      if (role?.name?.toUpperCase() === "ADMIN") {
        return next();
      }

      // 3️⃣ Lấy danh sách quyền mà user có
      const perms = role.permissions || [];

      // 4️⃣ Check quyền khớp (chấp nhận 3 kiểu: ObjectId, code, quyền con "_CODE")
      const hasPermission = perms.some((p) => {
        if (!p) return false;
        if (typeof p === "string") {
          return (
            p === requiredCode ||              // khớp code
            p.endsWith(`_${requiredCode}`) ||  // khớp quyền con
            p.includes(requiredCode)            // khớp trong chuỗi permissionId_code
          );
        }
        if (p.code) return p.code === requiredCode;
        return false;
      });

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền: ${requiredCode}`,
        });
      }

      next();
    } catch (err) { 
      console.error("❌ safePermission error:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi kiểm tra quyền (safePermission)!",
      });
    }
  };
};
