import VoucherModel from "../models/voucher.model.js";

// [POST] /api/voucher/create
export const createVoucherController = async (req, res) => {
  try {
    const { code, discountAmount, minOrderValue, expiryDate, usageLimit } =
      req.body;

    if (!code || !discountAmount || !minOrderValue || !expiryDate) {
      return res.status(400).json({ message: "Thiếu thông tin voucher!" });
    }

    const exists = await VoucherModel.findOne({ code: code.toUpperCase() });
    if (exists)
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại!" });

    const voucher = await VoucherModel.create({
      code: code.toUpperCase(),
      discountAmount,
      minOrderValue,
      expiryDate,
      usageLimit,
    });

    res.status(201).json({
      success: true,
      message: "Tạo voucher thành công!",
      data: voucher,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [GET] /api/voucher/validate/:code?total=xxx
export const validateVoucherController = async (req, res) => {
  try {
    const { code } = req.params;
    const { total } = req.query;

    const voucher = await VoucherModel.findOne({ code: code.toUpperCase() });
    if (!voucher)
      return res.status(404).json({
        success: false,
        message: "Mã không tồn tại hoặc không hợp lệ!",
      });

    // Kiểm tra giá trị đơn hàng có đạt điều kiện tối thiểu không
    if (total < voucher.minOrder)
      return res.status(400).json({
        success: false,
        message: `Đơn hàng chưa đạt mức tối thiểu ${voucher.minOrder.toLocaleString()} ₫ để dùng mã này!`,
      });

    res.json({
      success: true,
      discountAmount: voucher.discountAmount,
      message: "Áp dụng mã giảm giá thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra mã giảm giá!",
    });
  }
};

// [GET] /api/voucher/list
export const getAllVouchersController = async (req, res) => {
  try {
    const vouchers = await VoucherModel.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: vouchers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// [PUT] /api/voucher/update/:id
export const updateVoucherController = async (req, res) => {
  try {
    const voucher = await VoucherModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!voucher)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy voucher!" });

    res.json({
      success: true,
      message: "Cập nhật voucher thành công!",
      data: voucher,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// [DELETE] /api/voucher/delete/:id
export const deleteVoucherController = async (req, res) => {
  try {
    const deleted = await VoucherModel.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Voucher không tồn tại!" });

    res.json({ success: true, message: "Xóa voucher thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
