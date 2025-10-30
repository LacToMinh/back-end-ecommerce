import HomeSliderModel from "../models/homeSlider.js";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";

var imagesArr = [];
// [POST] /api/homeSlides/upload - Upload images
export async function uploadImage(req, res) {
  try {
    const image = req.files;

    if (!image || image.length === 0) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; ++i) {
      const result = await cloudinary.uploader.upload(image[i].path, options);
      imagesArr.push(result.secure_url);
      await fs.unlink(`uploads/${image[i].filename}`);
    }

    return res.status(200).json({
      images: imagesArr,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [POST] /api/homeSlides/add - Upload images
export async function addHomeSlider(req, res) {
  try {
    const { images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({
        message: "No images provided",
        success: false,
        error: true,
      });
    }

    const slide = new HomeSliderModel({ images });

    const saved = await slide.save();

    return res.status(200).json({
      message: "Slide created",
      success: true,
      error: false,
      data: saved,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// [POST] /api/homeSlides/ - Get home slides
export async function getHomeSlides(req, res) {
  try {
    const slides = await HomeSliderModel.find();
    if (!slides) {
      return res.status(404).json({
        message: "Slides not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Get home slides successfully!",
      success: false,
      error: true,
      data: slides,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// [GET] /api/homeSlides/:id
export async function getSlide(req, res) {
  try {
    const slide = await HomeSliderModel.findById(req.params.id);

    if (!slide) {
      res.status(500).json({
        message: "The slide with the given ID was not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Get home slide successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// DELETE /api/homeSlides/:id - Delete images home slide by id
export async function deleteHomeSlide(req, res) {
  try {
    // 1. Tìm slide theo ID
    const slide = await HomeSliderModel.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        message: "Home slide not found",
        error: true,
        success: false,
      });
    }

    // 2. Xóa từng ảnh trên Cloudinary
    const images = slide.images; // Mảng URL ảnh

    for (const img of images) {
      const segments = img.split("/");
      const filenameWithExt = segments[segments.length - 1]; // vd: abc123.jpg
      const publicId = filenameWithExt.split(".")[0]; // abc123

      if (publicId) {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`✅ Deleted image "${publicId}":`, result);
        } catch (error) {
          console.error(`❌ Failed to delete image "${publicId}":`, error);
        }
      }
    }

    // 3. Xóa slide khỏi database
    await HomeSliderModel.findByIdAndDelete(req.params.id);

    // 4. Trả về kết quả thành công
    return res.status(200).json({
      message: "Home slide deleted successfully",
      success: true,
      error: false,
    });

  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

