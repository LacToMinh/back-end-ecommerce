import mongoose from "mongoose";

const productRAMSSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    dateCreated: {
      type: String,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const productRAMSModel = mongoose.model("ProductRAMS", productRAMSSchema);  
export default productRAMSModel;