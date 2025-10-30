import mongoose from "mongoose";
import { type } from "os";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: String,
          required: true,
        },
        productTitle: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
        subTotal: {
          type: Number,
        },
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      default: "",
    },
    order_status: {
      type: String,
      default: "pending",
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
      required: true,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
     paymentMethod: {
      type: String
     }
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("order", orderSchema);
export default OrderModel;
