// controllers/permissionMatrix.controller.js
import RoleModel from "../models/role.model.js";
import PermissionModel from "../models/permission.model.js";
import mongoose from "mongoose";

// ✅ Lấy tất cả role + quyền (kèm quyền con)
// export const getRolePermissionMatrix = async (req, res) => {
//   try {
//     const roles = await RoleModel.find({})
//       .populate("permissions", "code description actions");

//     const permissions = await PermissionModel.find({});

//     // 🔹 Chuyển đổi danh sách quyền để frontend hiểu đúng định dạng
//     const rolePermissionMap = {};
//     roles.forEach((r) => {
//       const baseIds = r.permissions?.map((p) => p._id.toString()) || [];
//       const extendedIds = [];

//       r.permissions?.forEach((p) => {
//         // thêm quyền cha
//         extendedIds.push(p._id.toString());
//         // thêm quyền con nếu có
//         p.actions?.forEach((a) =>
//           extendedIds.push(`${p._id.toString()}_${a.code}`)
//         );
//       });

//       rolePermissionMap[r._id] = [...new Set([...baseIds, ...extendedIds])];
//     });

//     res.status(200).json({
//       success: true,
//       roles,
//       permissions,
//       rolePermissionMap, // ✅ Thêm phần này
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi lấy dữ liệu quyền!",
//     });
//   }
// };

export const getRolePermissionMatrix = async (req, res) => {
  try {
    // 1️⃣ Lấy tất cả roles
    const roles = await RoleModel.find({}).lean();

    // 2️⃣ Lấy toàn bộ permissions
    const permissions = await PermissionModel.find({}).lean();

    // 3️⃣ Duyệt từng role và tách 2 loại quyền: cha (ObjectId) & con (string)
    const rolePermissionMap = {};
    for (const role of roles) {
      const parentIds = role.permissions
        .filter((p) => mongoose.Types.ObjectId.isValid(p))
        .map((p) => p.toString());

      const childIds = role.permissions
        .filter((p) => typeof p === "string" && p.includes("_"));

      // ✅ populate quyền cha
      const populatedPermissions = await PermissionModel.find({
        _id: { $in: parentIds },
      }).lean();

      // ✅ tạo danh sách tick
      const combined = [
        ...parentIds,
        ...childIds, // quyền con (string)
        ...populatedPermissions.flatMap((p) =>
          p.actions.map((a) => `${p._id}_${a.code}`)
        ),
      ];

      role.permissions = populatedPermissions;
      rolePermissionMap[role._id] = [...new Set(combined)];
    }

    res.status(200).json({
      success: true,
      roles,
      permissions,
      rolePermissionMap,
    });
  } catch (err) {
    console.error("❌ getRolePermissionMatrix error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu quyền!",
      error: err.message,
    });
  }
};


// export const getRolePermissionMatrix = async (req, res) => {
//   try {
//     // 1️⃣ Lấy toàn bộ roles
//     const roles = await RoleModel.find({}).lean();

//     // 2️⃣ Populate thủ công (chỉ ObjectId hợp lệ)
//     for (const role of roles) {
//       const validPermissionIds = role.permissions.filter((p) =>
//         mongoose.Types.ObjectId.isValid(p)
//       );

//       // Truy vấn permission tương ứng
//       const populatedPermissions = await PermissionModel.find({
//         _id: { $in: validPermissionIds },
//       }).lean();

//       // Gán lại cho role
//       role.permissions = populatedPermissions;
//     }

//     // 3️⃣ Lấy toàn bộ danh sách quyền để hiển thị ở bảng
//     const permissions = await PermissionModel.find({}).lean();

//     // 4️⃣ Tạo rolePermissionMap (để hiển thị tick trên UI)
//     const rolePermissionMap = {};
//     roles.forEach((r) => {
//       const baseIds = r.permissions?.map((p) => p._id.toString()) || [];
//       const extendedIds = [];

//       r.permissions?.forEach((p) => {
//         // Thêm quyền cha
//         extendedIds.push(p._id.toString());
//         // Thêm quyền con
//         p.actions?.forEach((a) =>
//           extendedIds.push(`${p._id.toString()}_${a.code}`)
//         );
//       });

//       // ⚡ Kết hợp cả quyền cha, con và string đang lưu trong DB
//       const rawPerms =
//         Array.isArray(r.permissions) && r.permissions.length
//           ? r.permissions.map((p) => p._id.toString())
//           : [];
//       const dbPerms = role.permissions || []; // trường hợp có string quyền con
//       rolePermissionMap[r._id] = [
//         ...new Set([...baseIds, ...extendedIds, ...dbPerms]),
//       ];
//     });

//     // 5️⃣ Trả về client
//     res.status(200).json({
//       success: true,
//       roles,
//       permissions,
//       rolePermissionMap,
//     });
//   } catch (err) {
//     console.error("❌ Lỗi getRolePermissionMatrix:", err);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi lấy dữ liệu quyền!",
//       error: err.message,
//     });
//   }
// };



// export const updateRolePermissions = async (req, res) => {
//   try {
//     const { updates } = req.body; // [{ roleId, permissionIds: [...] }]

//     for (const u of updates) {
//       // ✅ Lọc ra chỉ các ID hợp lệ (ObjectId thật)
//       const parentPerms = u.permissionIds.filter((id) =>
//         mongoose.Types.ObjectId.isValid(id)
//       );

//       await RoleModel.findByIdAndUpdate(u.roleId, {
//         permissions: parentPerms,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Cập nhật quyền thành công!",
//     });
//   } catch (err) {
//     console.error("❌ Lỗi updateRolePermissions:", err);
//     res.status(500).json({
//       success: false,
//       message: "Cập nhật quyền thất bại!",
//       error: err.message,
//     });
//   }
// };

export const updateRolePermissions = async (req, res) => {
  try {
    const { updates } = req.body; // [{ roleId, permissionIds: [...] }]

    for (const u of updates) {
      // ✅ Giữ lại cả ObjectId (cha) và quyền con (string có "_")
      const validIds = u.permissionIds.filter(
        (id) => mongoose.Types.ObjectId.isValid(id) || id.includes("_")
      );

      await RoleModel.findByIdAndUpdate(u.roleId, {
        permissions: validIds,
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật quyền thành công!",
    });
  } catch (err) {
    console.error("❌ Lỗi updateRolePermissions:", err);
    res.status(500).json({
      success: false,
      message: "Cập nhật quyền thất bại!",
      error: err.message,
    });
  }
};



// ✅ Giữ nguyên hàm xóa
export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    await RoleModel.findByIdAndDelete(roleId);
    res.status(200).json({
      success: true,
      message: "Đã xóa role!",
    });
  } catch (err) {
    console.error("Lỗi deleteRole:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const addActionToPermission = async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { code, label } = req.body;

    if (!code || !label)
      return res.status(400).json({ success: false, message: "Thiếu code hoặc label" });

    const perm = await PermissionModel.findById(permissionId);
    if (!perm) return res.status(404).json({ success: false, message: "Không tìm thấy permission!" });

    // kiểm tra trùng code trong actions
    if (perm.actions.some((a) => a.code === code))
      return res.status(400).json({ success: false, message: "Mã quyền này đã tồn tại!" });

    perm.actions.push({ code, label });
    await perm.save();

    res.status(200).json({
      success: true,
      message: "Đã thêm quyền hành động mới!",
      permission: perm,
    });
  } catch (err) {
    console.error("❌ addActionToPermission:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Xóa hành động (action) khỏi 1 permission (module)
 */
export const deleteActionFromPermission = async (req, res) => {
  try {
    const { permissionId, actionCode } = req.params;
    const perm = await PermissionModel.findById(permissionId);
    if (!perm) return res.status(404).json({ success: false, message: "Không tìm thấy permission!" });

    perm.actions = perm.actions.filter((a) => a.code !== actionCode);
    await perm.save();

    res.status(200).json({
      success: true,
      message: "Đã xóa quyền hành động thành công!",
      permission: perm,
    });
  } catch (err) {
    console.error("❌ deleteActionFromPermission:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
