import querystring from "qs";
import crypto from "crypto";
import dateFormat from "dateformat";

// Lấy biến môi trường
const vnp_TmnCode = process.env.VNP_TMN_CODE;
const vnp_HashSecret = process.env.VNP_HASH_SECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL;
const clientUrl = process.env.CLIENT_URL;

/**
 * @desc Tạo URL thanh toán VNPay
 * @route POST /api/vnpay/create-payment
 */
export const createPayment = async (req, res) => {
  try {
    const {
      amount,
      user,
      delivery_address,
      products,
      paymentMethod,
      orderDescription,
      orderType,
    } = req.body;

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      "127.0.0.1";

    const date = new Date();
    const createDate = dateFormat(date, "yyyymmddHHMMss");
    const orderId = dateFormat(date, "HHMMss"); // VNPay yêu cầu mã ngắn

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderDescription || `Thanh toan don hang ${orderId}`,
      vnp_OrderType: orderType || "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = `${vnp_Url}?${querystring.stringify(vnp_Params, {
      encode: false,
    })}`;

    return res.json({
      code: "00",
      message: "Success",
      payUrl: paymentUrl,
    });
  } catch (error) {
    console.error("VNPay Create Payment Error:", error);
    return res.status(500).json({
      code: "99",
      message: "Có lỗi xảy ra khi tạo URL thanh toán",
    });
  }
};

/**
 * @desc VNPay redirect kết quả về client
 * @route GET /api/vnpay/vnpay_return
 */
export const vnpReturn = async (req, res) => {
  let vnp_Params = req.query;

  const secureHash = vnp_Params["vnp_SecureHash"];

  // 🟠 In ra để debug
  console.log("🟠 VNPay Return Params:", vnp_Params);

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // 🟢 So sánh chữ ký
  console.log("🟢 SignData:", signData);
  console.log("🟢 Your Hash:", signed);
  console.log("🟢 VNPay Hash:", secureHash);

  if (secureHash === signed) {
    if (vnp_Params["vnp_ResponseCode"] === "00") {
      return res.redirect(`${clientUrl}/payment/success`);
    } else {
      return res.redirect(`${clientUrl}/payment/fail`);
    }
  } else {
    return res.redirect(`${clientUrl}/payment/fail`);
  }
};


/**
 * @desc VNPay gọi IPN để xác nhận thanh toán
 * @route GET /api/vnpay/vnpay_ipn
 */
export const vnpIpn = async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];
  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    const responseCode = vnp_Params["vnp_ResponseCode"];
    if (responseCode === "00") {
      // TODO: cập nhật trạng thái đơn hàng tại đây
      return res.status(200).json({ RspCode: "00", Message: "Success" });
    } else {
      return res.status(200).json({ RspCode: "01", Message: "Payment Failed" });
    }
  } else {
    return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
  }
};

// Sắp xếp object theo key (alphabet)
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}
