import express from "express";
import {
  getRolePermissionMatrix,
  updateRolePermissions,
  deleteRole,
  addActionToPermission,
  deleteActionFromPermission,
} from "../controllers/permissionMatrix.controller.js";
import auth from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/authorize.js";
import { getSystemPermissionTemplates } from "../controllers/systemPermission.controller.js";

const router = express.Router();

router.get("/templates", getSystemPermissionTemplates);
router.get("/", auth, getRolePermissionMatrix);
router.put("/update", auth, updateRolePermissions);
router.delete("/:roleId", auth, deleteRole);

router.post("/:permissionId/action", auth, addActionToPermission);

// 🔹 xóa quyền con
router.delete("/:permissionId/action/:actionCode", auth, deleteActionFromPermission);
export default router;
