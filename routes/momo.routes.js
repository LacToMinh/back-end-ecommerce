import express from "express";
import { createMomoPaymentController, momoNotifyController } from "../controllers/momo.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-payment", auth, createMomoPaymentController);
router.post("/notify", momoNotifyController); // callback từ MoMo

export default router;
