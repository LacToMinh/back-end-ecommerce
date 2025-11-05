import { Router } from "express";
import {
  createVoucherController,
  deleteVoucherController,
  getAllVouchersController,
  updateVoucherController,
  validateVoucherController,
} from "../controllers/voucher.controller.js";

const voucherRouter = Router();

// API cho admin
voucherRouter.post("/create", createVoucherController);
voucherRouter.get("/list", getAllVouchersController);
voucherRouter.put("/update/:id", updateVoucherController);
voucherRouter.delete("/delete/:id", deleteVoucherController);

// API cho frontend
voucherRouter.get("/validate/:code", validateVoucherController);

export default voucherRouter;
