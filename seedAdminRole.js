// seedRoleAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import RoleModel from "./models/role.model.js";
import PermissionModel from "./models/permission.model.js";

dotenv.config();

// ⚙️ Mongo URI — cập nhật nếu khác
const MONGO_URI = process.env.MONGODB_URI;

const seedAdminRole = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    // 1️⃣ Lấy tất cả quyền hiện có
    const allPermissions = await PermissionModel.find({});
    if (!allPermissions.length) {
      console.log("⚠️ Chưa có quyền nào trong DB. Hãy chạy seedPermission trước!");
      process.exit(0);
    }

    // 2️⃣ Kiểm tra xem role ADMIN đã tồn tại chưa
    let adminRole = await RoleModel.findOne({ name: "ADMIN" });

    if (!adminRole) {
      adminRole = await RoleModel.create({
        name: "ADMIN",
        permissions: allPermissions.map((p) => p._id),
      });
      console.log("🎉 Đã tạo role ADMIN với toàn bộ quyền");
    } else {
      // Cập nhật quyền mới nếu có
      const newPerms = allPermissions.map((p) => p._id.toString());
      const currentPerms = adminRole.permissions.map((p) => p.toString());
      const merged = [...new Set([...currentPerms, ...newPerms])];

      adminRole.permissions = merged;
      await adminRole.save();

      console.log("✅ Role ADMIN đã tồn tại, đã cập nhật thêm quyền mới");
    }

    console.log("🚀 Hoàn tất seed role ADMIN");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi seed role ADMIN:", err);
    process.exit(1);
  }
};

seedAdminRole();
