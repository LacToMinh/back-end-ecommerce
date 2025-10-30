import { Router } from "express";
import auth from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/authorize.js"; // middleware kiểm tra quyền
import {
  captureOrderPaypalController,
  createOrderController,
  createOrderPaypalController,
  getOrderDetailsController,
} from "../controllers/order.controller.js";

const orderRouter = Router();

// USER, ADMIN, STAFF đều được tạo đơn (có thể chỉ USER cũng được)
orderRouter.post("/create", auth, createOrderController);

// USER, ADMIN, STAFF đều được xem order của mình
orderRouter.get("/order-list", auth, getOrderDetailsController);

// Chỉ USER và ADMIN được tạo đơn qua paypal (hoặc thêm STAFF nếu muốn)
orderRouter.get("/create-order-paypal", auth,  createOrderPaypalController);
orderRouter.post("/capture-order-paypal", auth,  captureOrderPaypalController);

export default orderRouter;
