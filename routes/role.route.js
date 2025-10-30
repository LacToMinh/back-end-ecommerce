import { Router } from "express";
import auth from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/authorize.js";
import {
  createRole,
  deleteRole,
  getAllPermissions,
  getRolePermissionMatrix,
  updateRolePermissions,
} from "../controllers/role.controller.js";

const roleRouter = Router();

// roleRouter.get("/roles", auth, hasPermission("MANAGE_ROLES"), getRoles);
roleRouter.get("/permissions", auth, getAllPermissions);
roleRouter.post("/create", auth, hasPermission("MANAGE_ROLES"), createRole);
roleRouter.get("/", auth, hasPermission("MANAGE_ROLES"), getRolePermissionMatrix);
roleRouter.put("/update", auth, hasPermission("MANAGE_ROLES"), updateRolePermissions);
roleRouter.delete("/:roleId", auth, hasPermission("MANAGE_ROLES"), deleteRole);

export default roleRouter;
