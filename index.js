import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.route.js";
import categoryRouter from "./routes/category.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import addressRouter from "./routes/address.route.js";
import homeSlidesRoute from "./routes/homeSlides.route.js";
import orderRouter from "./routes/order.route.js";
import roleRouter from "./routes/role.route.js";
import permissionMatrixRouter from "./routes/permissionMatrix.route.js";
import tryOnRouter from "./routes/tryon.route.js";
import authRoutes from "./routes/auth.routes.js";
import momoRoutes from "./routes/momo.routes.js";
import vnpayRoute from "./routes/vnpay.route.js";

const app = express();
app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Server is running " + process.env.PORT,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);     
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
// app.use("/api/myList", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/homeSlides", homeSlidesRoute);
app.use("/api/role", roleRouter);
app.use("/api/permissions-matrix", permissionMatrixRouter);
app.use("/api/tryon", tryOnRouter);
app.use("/api/momo", momoRoutes);
app.use("/api/vnpay", vnpayRoute);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server running ", process.env.PORT);
  });
});
