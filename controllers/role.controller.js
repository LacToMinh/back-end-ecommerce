import RoleModel from "../models/role.model.js";
import PermissionModel from "../models/permission.model.js";

// ✅ Tạo role mới với danh sách permission được chọn
export const createRole = async (req, res) => {
  try {
    const { name, permissionIds } = req.body;

    if (!name || !permissionIds?.length)
      return res.status(400).json({ message: "Thiếu tên role hoặc danh sách quyền" });

    const existing = await RoleModel.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Tên role đã tồn tại" });

    const permissions = await PermissionModel.find({ _id: { $in: permissionIds } });
    if (!permissions.length)
      return res.status(400).json({ message: "Không tìm thấy quyền hợp lệ" });

    const newRole = await RoleModel.create({
      name,
      permissions: permissions.map((p) => p._id),
    });

    res.status(201).json({ success: true, message: "Tạo role thành công", role: newRole });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Lấy danh sách permission (để hiển thị checkbox)
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await PermissionModel.find();
    res.json({ success: true, permissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Lấy tất cả role + quyền (để render bảng)
export const getRolePermissionMatrix = async (req, res) => {
  try {
    const roles = await RoleModel.find({}).populate("permissions", "code description");
    const permissions = await PermissionModel.find({});

    res.status(200).json({
      success: true,
      roles,
      permissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Cập nhật quyền cho từng role
export const updateRolePermissions = async (req, res) => {
  try {
    const { updates } = req.body;
    // updates = [{ roleId, permissionIds: [] }, ...]

    for (const u of updates) {
      await RoleModel.findByIdAndUpdate(u.roleId, { permissions: u.permissionIds });
    }

    res.status(200).json({ success: true, message: "Cập nhật quyền thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Xóa role
export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    await RoleModel.findByIdAndDelete(roleId);
    res.status(200).json({ success: true, message: "Đã xóa role!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
