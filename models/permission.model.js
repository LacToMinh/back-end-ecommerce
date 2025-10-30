// models/permission.model.js
import mongoose from "mongoose";

const actionSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true }, // ví dụ: "ADD_PRODUCT"
  label: { type: String, required: true, trim: true }, // ví dụ: "Thêm sản phẩm"
});

const permissionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // ví dụ: "MANAGE_PRODUCTS"
    description: { type: String },                       // "Quản lý sản phẩm"
    module: { type: String },                            // "Sản phẩm"
    actions: { type: [actionSchema], default: [] },      // Danh sách quyền con
  },
  { timestamps: true }
);

const PermissionModel = mongoose.model("Permission", permissionSchema);
export default PermissionModel;
