// seed.js
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/connectDB.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import UserModel from "./models/user.model.js";
import RoleModel from "./models/role.model.js";
import PermissionModel from "./models/permission.model.js";

const seed = async () => {
  try {
    await connectDB();
    console.log("✅ Kết nối MongoDB thành công");

    // 1️⃣ Xóa dữ liệu cũ
    await PermissionModel.deleteMany({});
    await RoleModel.deleteMany({});
    await UserModel.deleteMany({ email: "admin@test.com" });

    // 2️⃣ Tạo permissions
    const permissions = await PermissionModel.insertMany([
      { code: "MANAGE_ROLES", description: "Quản lý Role & Permission" },
      { code: "MANAGE_PRODUCTS", description: "Quản lý sản phẩm" },
      { code: "VIEW_ORDERS", description: "Xem đơn hàng" },
    ]);

    console.log("✅ Đã tạo permissions:", permissions.map(p => p.code));

    // 3️⃣ Tạo role ADMIN (tham chiếu ObjectId của permissions)
    const adminRole = await RoleModel.create({
      name: "ADMIN",
      permissions: permissions.map((p) => p._id), // ✅ sử dụng ObjectId, KHÔNG phải code
    });

    console.log("✅ Đã tạo role ADMIN:", adminRole.name);

    // 4️⃣ Tạo user ADMIN (role là ObjectId)
    const hashedPassword = await bcrypt.hash("123456", 10);
    const adminUser = await UserModel.create({
      name: "Super Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: adminRole._id, // ✅ Gán ObjectId của ADMIN role
      verify_email: true,
      status: "Active",
    });

    console.log("✅ Đã tạo user admin:", adminUser.email);

    // 5️⃣ In ra thông tin xác nhận
    const result = await UserModel.findById(adminUser._id)
      .populate({
        path: "role",
        populate: { path: "permissions" },
      })
      .lean();

    console.log("🎯 User admin đầy đủ:", JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi seed:", err.message);
    process.exit(1);
  }
};

seed();
