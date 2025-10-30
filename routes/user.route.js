import { Router } from "express";
import {
  authWithGoogle,
  createUser,
  forgotPasswordController,
  getAllUsersHaveRole,
  getRoles,
  getUserById,
  loginUserController,
  logoutUserController,
  refeshToken,
  registerUserController,
  removeImageController,
  resetPassword,
  updateUserDetailsController,
  updateUserRole,
  userAvatarController,
  userDetails,
  verifyEmailController,
  verifyForgotPasswordOtpController,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { hasPermission } from "../middlewares/authorize.js";

// router.<method>(<path>, [middleware1, middleware2, ...], <handler>)
const userRouter = Router();
userRouter.get("/user-roles-list", auth, getAllUsersHaveRole)


userRouter.post("/create", auth, createUser);
userRouter.put("/:id/updateRole", auth, updateUserRole);

// Lấy danh sách role để hiển thị trong dropdown
userRouter.get("/roles", auth, getRoles);

userRouter.post("/register", registerUserController);
userRouter.post("/verifyEmail", verifyEmailController);
userRouter.post("/login", loginUserController);
userRouter.post("/authWithGoogle", authWithGoogle);
userRouter.post("/logout", auth, logoutUserController);
userRouter.put("/user-avatar", auth, upload.array("avatar"), userAvatarController);
userRouter.delete("/deleteImage", auth, removeImageController);
userRouter.put("/:id", auth, updateUserDetailsController);
userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/verify-forgot-password-otp", verifyForgotPasswordOtpController);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/refresh-token", refeshToken);
userRouter.get("/user-details", auth, userDetails);
userRouter.get("/:id", auth, hasPermission("MANAGE_ROLES"), getUserById);

export default userRouter;
