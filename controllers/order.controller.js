import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import paypal from "@paypal/checkout-server-sdk";
// const paypal = require("@paypal/checkout-server-sdk");

// [POST] /api/order/create
export const createOrderController = async (request, response) => {
  try {
    // 1. Kiểm tra đầu vào tối thiểu
    if (
      !request.body.userId ||
      !request.body.products ||
      !request.body.products.length
    ) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Thiếu thông tin đơn hàng hoặc giỏ hàng rỗng!",
      });
    }

    // 2. Trừ tồn kho cho từng sản phẩm, kiểm tra trước khi tạo đơn
    for (let i = 0; i < request.body.products.length; i++) {
      const { productId, quantity } = request.body.products[i];

      // Lấy sản phẩm từ DB
      const product = await ProductModel.findById(productId);

      // Kiểm tra còn hàng không
      if (!product || product.countInStock < quantity) {
        return response.status(400).json({
          error: true,
          success: false,
          message: `Sản phẩm ${
            product ? product.productTitle : ""
          } không đủ hàng!`,
        });
      }

      // Trừ tồn kho rồi lưu lại
      product.countInStock -= quantity;
      await product.save();
    }

    // 3. Tạo order sau khi đã trừ kho thành công
    let order = new OrderModel({
      user: request.body.userId,
      products: request.body.products,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmt,
      date: request.body.date, // Không cần nếu dùng timestamps của Mongoose
    });

    await order.save();

    response.status(201).json({
      error: false,
      success: true,
      message: "Tạo order thành công!",
      order,
    });
  } catch (err) {
    response.status(500).json({
      error: true,
      success: false,
      message: "Lỗi khi tạo order!",
      err: err.message,
    });
  }
};

export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId; // Lấy userId từ middleware xác thực

    // Lấy danh sách đơn hàng của user, mới nhất trước, đồng thời populate địa chỉ và user
    const orderlist = await OrderModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address user");

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

function getPayPalClient() {
  const environment =
    process.env.PAYPAL_MODE === "live"
      ? new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID_LIVE,
          process.env.PAYPAL_SECRET_LIVE
        )
      : new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID_TEST,
          process.env.PAYPAL_SECRET_TEST
        );
  return new paypal.core.PayPalHttpClient(environment);
}

// Hàm tạo đơn hàng Paypal
export async function createOrderPaypalController(request, response) {
  try {
    // Tạo request mới để gọi API tạo order của Paypal
    const req = new paypal.orders.OrdersCreateRequest();
    req.prefer("return=representation");

    // Body của order gửi lên Paypal
    req.requestBody({
      intent: "CAPTURE", // Chỉ định hành động thanh toán (CAPTURE là thanh toán luôn)
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // Đơn vị tiền tệ (nếu muốn VND thì đổi thành 'VND')
            value: request.query.totalAmount, // Số tiền thanh toán truyền từ FE lên BE
          },
        },
      ],
    });

    try {
      const client = getPayPalClient();
      const order = await client.execute(req);
      response.json({ id: order.result.id });
    } catch (error) {
      console.log(error);
      response.status(500).send("Error creating PayPal order");
    }
  } catch (error) {
    // Xử lý lỗi
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const captureOrderPaypalController = async (request, response) => {
  try {
    const { paymentId } = request.body;

    const req = new paypal.orders.OrdersCaptureRequest(paymentId);
    req.requestBody({});

    const orderInfo = {
      userId: request.body.userId,
      products: request.body.products,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmount,
      date: request.body.date,
    };

    const order = new OrderModel(orderInfo);
    await order.save();

    for (let i = 0; i < request.body.products.length; i++) {
      await ProductModel.findByIdAndUpdate(
        request.body.products[i].productId,
        {
          countInStock:
            parseInt(request.body.products[i].countInStock) -
            request.body.products[i].qty,
        },
        { new: true }
      );
    }

    response.json({ success: true, error: false, order: order });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
