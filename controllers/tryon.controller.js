import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const tryOnController = async (req, res) => {
  try {
    const { productImage, productName, style } = req.body;
    const userImage = req.file?.path;

    if (!userImage || !productImage) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ảnh người dùng hoặc ảnh sản phẩm!",
      });
    }

    console.log("🧠 Gửi yêu cầu đến Fal.ai (model: fal-fashn/tryon)...");

    // 🧾 Tạo form data
    const formData = new FormData();
    formData.append("image", fs.createReadStream(userImage)); // ảnh người thật
    formData.append("cloth", productImage); // ảnh quần áo (URL)
    formData.append(
      "prompt",
      `Make the person wear ${productName} in ${style} fashion style, realistic lighting`
    );

    // 🚀 Gọi Fal.ai model mới
    const response = await fetch("https://fal.run/fal-ai/fal-fashn/tryon", {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();

    fs.unlink(userImage, () => {}); // xóa ảnh tạm

    if (data?.image?.url) {
      console.log("✅ Ảnh kết quả:", data.image.url);
      return res.json({
        success: true,
        resultImage: data.image.url,
      });
    } else {
      console.error("❌ Fal.ai trả về:", data);
      return res.status(400).json({
        success: false,
        message: data?.detail || "Không tạo được ảnh thử đồ.",
      });
    }
  } catch (error) {
    console.error("🔥 Lỗi Fal.ai:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi gọi Fal.ai API.",
    });
  }
};
