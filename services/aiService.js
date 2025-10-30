// server/services/aiService.js
import axios from "axios";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const API_KEY = process.env.FASHN_API_KEY;

export async function callFashnTryOn({
  modelImageUrl,
  garmentImageUrl,
  category,
  style,
}) {
  try {
    const body = {
      model_name: "tryon-v1.6",
      inputs: {
        model_image: modelImageUrl,
        garment_image: garmentImageUrl,
        category: category || "tops",
        // Nếu muốn bạn có thể thêm parameter style hoặc tùy chỉnh khác
        style: style || "casual",
      },
    };

    const resp = await axios.post(FASHN_API_URL, body, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const result =
      resp.data?.outputs?.result_image_url || resp.data?.result_image_url;
    return result;
  } catch (err) {
    console.error(
      "❌ Error calling FASHN Try-On API:",
      err.response?.data || err.message
    );
    throw err;
  }
}
