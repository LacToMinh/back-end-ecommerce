import crypto from "crypto";
import axios from "axios";
import OrderModel from "../models/order.model.js";

// [POST] /api/momo/create-payment
export const createMomoPaymentController = async (req, res) => {
  try {
    const { amount, user, products, delivery_address, totalAmt, paymentMethod } = req.body;

    // 🔹 Kiểm tra dữ liệu tối thiểu
    if (!user || !products?.length || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đơn hàng!",
      });
    }

    // 🔹 Khởi tạo biến MoMo
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const requestId = partnerCode + Date.now();
    const orderId = requestId;
    const orderInfo = "Thanh toán đơn hàng qua MoMo";
    const redirectUrl = process.env.MOMO_RETURN_URL;
    const ipnUrl = process.env.MOMO_NOTIFY_URL;

    // 
    // const requestType = "payWithATM";
    let requestType = "captureWallet"; // mặc định
    if (paymentMethod === "ATM") requestType = "payWithATM";
    if (paymentMethod === "CC") requestType = "payWithCC";

    const extraData = "";

    // 🔹 Tạo chữ ký HMAC SHA256
    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    // 🔹 Tạo request đến MoMo
    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    // 🔹 Lưu đơn hàng tạm với trạng thái pending
    const newOrder = new OrderModel({
      user,
      products,
      delivery_address,
      totalAmt,
      paymentId: orderId,
      payment_status: "COMPLETED",
    });
    await newOrder.save();

    // 🔹 Trả về cho FE để redirect
    res.status(200).json(momoRes.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi tạo thanh toán MoMo",
      error: error.message,
    });
  }
};

// [POST] /api/momo/notify
export const momoNotifyController = async (req, res) => {
  const {
    orderId,
    requestId,
    amount,
    resultCode,
    message,
    orderInfo,
    extraData,
    signature,
  } = req.body;

  try {
    if (resultCode == 0) {
      // TODO: xác minh chữ ký (bảo mật hơn)

      const order = new OrderModel({
        user: req.body.userId,
        products: req.body.products,
        paymentId: orderId,
        payment_status: "paid",
        delivery_address: req.body.delivery_address,
        totalAmt: amount,
      });

      await order.save();

      res
        .status(200)
        .json({ message: "Thanh toán MoMo thành công", success: true });
    } else {
      res
        .status(400)
        .json({ message: "Thanh toán MoMo thất bại", success: false });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
