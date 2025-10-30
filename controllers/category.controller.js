import CategoryModel from "../models/category.model.js";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";

var imagesArr = [];
// [POST] /api/category/upload - Upload images
export async function uploadImage(req, res) {
  try {
    imagesArr = [];
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

// [POST] /api/category/create - Create category
export async function createCategory(req, res) {
  try {
    let category = new CategoryModel({
      name: req.body.name,
      images: imagesArr,
      parentId: req.body.parentId,
      parentCatName: req.body.parentCatName,
    });

    if (!category) {
      return res.status(500).json({
        message: "Category not created",
        error: true,
        success: false,
      });
    }

    category = await category.save();
    imagesArr = [];

    return res.status(200).json({
      message: "Category created successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [GET] /api/category/ - Get categories
export async function getCategories(req, res) {
  try {
    const categories = await CategoryModel.find();
    // categories = [
    //   { _id: "1", name: "Quần Áo", parentId: null },
    //   { _id: "2", name: "Áo Nam", parentId: "1" },
    //   { _id: "3", name: "Áo Nữ", parentId: "1" },
    //   { _id: "4", name: "Áo Sơ Mi", parentId: "2" },
    // ];

    const categoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });
    // console.log(categoryMap);
    // {
    // "1": { _id: "1", name: "Quần Áo", parentId: null, children: [] },
    // "2": { _id: "2", name: "Áo Nam", parentId: "1", children: [] }
    // }

    const rootCategories = [];

    categories.forEach((cat) => {
      if (cat.parentId) {
        categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    // {
    //   // "1": {
    //   //   _id: "1",
    //   //   name: "Quần Áo",
    //   //   parentId: null,
    //   //   children: [
    //   //     { _id: "2", name: "Áo Nam", parentId: "1", children: [] },
    //   //     { _id: "3", name: "Áo Nữ", parentId: "1", children: [] }
    //   //   ]
    //   // },
    //   // "2": { ... },
    //   // "3": { ... }
    // }

    return res.status(200).json({
      message: "Get categories successfully",
      success: true,
      data: rootCategories,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

// [GET] /api/category/ - Get categories count
export async function getCategoriesCount(req, res) {
  try {
    const categoryCount = await CategoryModel.countDocuments({
      parentId: null,
    });

    if (!categoryCount) {
      res.status(500).json({
        message: "",
        error: true,
        success: false,
      });
    } else {
      res.send({
        categoryCount: categoryCount,
        success: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [GET] /api/category/get/count/subCat - Get sub categories count
export async function getSubCategoriesCount(req, res) {
  try {
    const categories = await CategoryModel.find();

    if (!categories) {
      res.status(500).json({
        message: "",
        error: true,
        success: false,
      });
    } else {
      let subCatList = [];
      // const subCatList = categories.filter(cat => cat.parentId !== null);

      for (let cat of categories) {
        if (cat.parentId !== null) {
          subCatList.push(cat);
        }
      }

      return res.json({
        subCategoriesCount: subCatList.length,
        subCategories: subCatList,
        success: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [GET] /api/category/ - Get category
export async function getCategory(req, res) {
  try {
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return res.status.json({
        message: "The category with the given ID was not found.",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      category: category,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [DELETE] /api/category/deleteImage?img=... - Delete image from Cloudinary
export async function removeImageController(req, res) {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
      const result = await cloudinary.uploader.destroy(imageName);
      if (result) {
        return res.status(200).json({
          message: "Image deleted successfully",
          success: true,
          cloudinaryResult: result,
        });
      } else {
        return res.status(404).json({
          message: "Image not found or already deleted",
          success: false,
          cloudinaryResult: result,
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid image name",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [DELETE] /api/category/:id - Delete category
export async function deleteCategory(req, res) {
  try {
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found!",
        error: true,
      });
    }

    const images = category.images;

    for (let img of images) {
      const urlArr = img.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    const subCategories = await CategoryModel.find({ parentId: req.params.id });

    for (let i = 0; i < subCategories.length; i++) {
      // console.log(subCategories[i]._id);

      const thirdSubCategories = await CategoryModel.find({
        parentId: subCategories[i]._id,
      });

      // Xóa tất cả danh mục con cấp 2
      for (let j = 0; j < thirdSubCategories.length; j++) {
        await CategoryModel.findByIdAndDelete(thirdSubCategories[j]._id);
      }

      // Xóa danh mục cấp 1
      await CategoryModel.findByIdAndDelete(subCategories[i]._id);
    }

    await CategoryModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Category deleted successfully!",
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

// [PUT] /api/category/:id - Updated category
export async function updatedCategory(req, res) {
  try {
    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: imagesArr.length > 0 ? imagesArr[0] : req.body.images,
        parentCatName: req.body.parentCatName,
        parentId: req.body.parentId,
      },
      { new: true }
    );

    if(!category) {
      
    }
    return res.status(200).json({
      message: "Category updated successfully",
      success: true,
      error: false,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
