import mongoose from "mongoose";

const tryOnSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userImage: String,
  productName: String,
  style: String,
  resultImage: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TryOn", tryOnSchema);
