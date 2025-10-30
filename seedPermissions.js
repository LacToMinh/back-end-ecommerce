import mongoose from "mongoose";
import dotenv from "dotenv";
import PermissionModel from "./models/permission.model.js";

dotenv.config();

const permissionsData = [
  {
    code: "MANAGE_PRODUCTS",
    description: "Quản lý sản phẩm",
    actions: [
      { code: "ADD_PRODUCT", label: "Thêm sản phẩm" },
      { code: "EDIT_PRODUCT", label: "Sửa sản phẩm" },
      { code: "DELETE_PRODUCT", label: "Xóa sản phẩm" },
      { code: "VIEW_PRODUCT", label: "Xem sản phẩm" },
    ],
  },
  {
    code: "MANAGE_ORDERS",
    description: "Quản lý đơn hàng",
    actions: [
      { code: "VIEW_ORDER", label: "Xem đơn hàng" },
      { code: "DELETE_ORDER", label: "Xóa đơn hàng" },
    ],
  },
  {
    code: "MANAGE_CATEGORIES",
    description: "Quản lý danh mục",
    actions: [
      { code: "ADD_CATEGORY", label: "Thêm danh mục" },
      { code: "EDIT_CATEGORY", label: "Sửa danh mục" },
      { code: "DELETE_CATEGORY", label: "Xóa danh mục" },
      { code: "VIEW_CATEGORY", label: "Xem danh mục" },
    ],
  },
  {
    code: "MANAGE_BANNERS",
    description: "Quản lý slide trang chủ",
    actions: [
      { code: "ADD_BANNER", label: "Thêm slide" },
      { code: "EDIT_BANNER", label: "Sửa slide" },
      { code: "DELETE_BANNER", label: "Xóa slide" },
      { code: "VIEW_BANNER", label: "Xem slide" },
    ],
  },
  {
    code: "MANAGE_ROLES",
    description: "Quản lý vai trò",
    actions: [
      { code: "ADD_ROLE", label: "Thêm vai trò" },
      { code: "EDIT_ROLE", label: "Sửa vai trò" },
      { code: "DELETE_ROLE", label: "Xóa vai trò" },
      { code: "VIEW_ROLE", label: "Xem vai trò" },
    ],
  },
  {
    code: "MANAGE_PERMISSIONS",
    description: "Quản lý quyền",
    actions: [
      { code: "ADD_PERMISSION", label: "Thêm quyền" },
      { code: "EDIT_PERMISSION", label: "Sửa quyền" },
      { code: "DELETE_PERMISSION", label: "Xóa quyền" },
      { code: "VIEW_PERMISSION", label: "Xem quyền" },
    ],
  },
];

const seedPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Kết nối MongoDB thành công!");

    // Xóa dữ liệu cũ
    await PermissionModel.deleteMany({});
    console.log("🧹 Đã xóa toàn bộ dữ liệu cũ trong collection Permission");

    // Thêm mới
    await PermissionModel.insertMany(permissionsData);
    console.log("✅ Đã thêm thành công toàn bộ danh sách quyền!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi seed dữ liệu:", err);
    process.exit(1);
  }
};

seedPermissions();
