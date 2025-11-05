import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true }, // ví dụ: NOV15
    discountAmount: { type: Number, required: true }, // số tiền giảm, ví dụ: 15000
    minOrderValue: { type: Number, required: true }, // đơn hàng tối thiểu để áp dụng, ví dụ: 299000
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 }, // số lần có thể dùng
    usedCount: { type: Number, default: 0 }, // số lần đã dùng
  },
  { timestamps: true }
);

const VoucherModel = mongoose.model("Voucher", voucherSchema);
export default VoucherModel;
