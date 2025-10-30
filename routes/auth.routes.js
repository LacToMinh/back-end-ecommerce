import { Router } from "express";
import { refreshTokenController } from "../controllers/auth.controller.js";
const authRoutes = Router();

// POST /api/auth/refresh
authRoutes.post("/refresh", refreshTokenController);

export default authRoutes;
