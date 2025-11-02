import express from "express";
import {
  createPayment,
  vnpReturn,
  vnpIpn,
} from "../controllers/vnpay.controller.js";

const router = express.Router();

router.post("/create-payment", createPayment);
router.get("/vnpay_return", vnpReturn);
router.get("/vnpay_ipn", vnpIpn);

export default router;
