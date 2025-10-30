import ProductModel from "../models/product.model.js";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import productRAMSModel from "../models/productRAMS.model.js";

var imagesArr = [];
// [POST] /api/product/upload - Upload images
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

// [POST] /api/product/create - Create product
export async function createProduct(req, res) {
  try {
    const product = new ProductModel({
      name: req.body.name,
      description: req.body.description,
      images: imagesArr,
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      catName: req.body.catName,
      catId: req.body.catId,
      subCatId: req.body.subCatId,
      subCatName: req.body.subCatName,
      thirdSubCat: req.body.thirdSubCat,
      thirdSubCatName: req.body.thirdSubCatName,
      thirdSubCatId: req.body.thirdSubCatId,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      discount: req.body.discount,
      productRam: req.body.productRam,
      size: req.body.size,
      productWeight: req.body.productWeight,
    });

    const savedProduct = await product.save();
    imagesArr = [];

    return res.status(201).json({
      message: "Product created successfully",
      success: true,
      error: false,
      product: savedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [POST] /api/product/ - Create productRAMS
export async function createProductRAMS(req, res) {
  try {
    let productRAMS = new productRAMSModel({
      name: req.body.name,
    });

    productRAMS = await productRAMS.save();

    if (!productRAMS) {
      res.status(500).json({
        message: "Product RAMS not created!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product RAMS create successfully!",
      success: true,
      error: false,
      data: productRAMS,
    });
  } catch (error) {
    return res.status(500).json({
      message: res.message,
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/getAllProducts - Get all products
export async function getAllProducts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        succes: false,
      });
    }

    const products = await ProductModel.find()
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get products successfully",
      data: products,
      totalPages: totalPages,
      page: page,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/getAllProductsByCatId/:id - Get products by cat id
export async function getAllProductsByCatId(req, res) {
  try {
    const catId = req.params.id;
    const query = { catId };

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    const totalItems = await ProductModel.countDocuments(query);

    if (page > totalPages) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        succes: false,
      });
    }

    const products = await ProductModel.find(query)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get products successfully",
      data: products,
      totalPages: totalPages,
      totalItems: totalItems,
      page: page,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/getAllProductsByCatName - Get products by cat name
export async function getAllProductsByCatName(req, res) {
  try {
    const catName = req.query.catName;
    const query = { catName };

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    const totalItems = await ProductModel.countDocuments(query);

    if (page > totalPages) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find(query)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get products successfully",
      data: products,
      totalPages: totalPages,
      totalItems: totalItems,
      page: page,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/getAllProductsBySubCatId -  Get products by sub cat id
export async function getAllProductsBySubCatId(req, res) {
  try {
    const subCatId = req.params.id;
    const query = { subCatId: new mongoose.Types.ObjectId(subCatId) };

    if (!mongoose.Types.ObjectId.isValid(subCatId)) {
      return res.status(400).json({
        message: "Invalid subCatId",
        error: true,
        success: false,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    const totalItems = await ProductModel.countDocuments(query);

    if (page > totalPages) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        succes: false,
      });
    }

    const products = await ProductModel.find(query)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get products successfully",
      data: products,
      totalPages: totalPages,
      totalItems: totalItems,
      page: page,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/getAllProductsBySubCatId -  Get products by third cat id
export async function getAllProductsByThirdSubCatId(req, res) {
  try {
    const thirdCatId = req.params.id;
    const query = { thirdSubCatId: new mongoose.Types.ObjectId(thirdCatId) };

    if (!mongoose.Types.ObjectId.isValid(thirdCatId)) {
      return res.status(400).json({
        message: "Invalid subCatId",
        error: true,
        success: false,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    const totalItems = await ProductModel.countDocuments(query);

    if (page > totalPages) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        succes: false,
      });
    }

    const products = await ProductModel.find(query)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get products successfully",
      data: products,
      totalPages: totalPages,
      totalItems: totalItems,
      page: page,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/getAllProductsBySubCatName - Get products by sub cat name
export async function getAllProductsBySubCatName(req, res) {
  try {
    const subCatName = req.query.subCatName;
    const query = { subCatName };

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    const totalItems = await ProductModel.countDocuments(query);

    if (page > totalPages) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find(query)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get products successfully",
      data: products,
      totalPages: totalPages,
      totalItems: totalItems,
      page: page,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [DELETE] /api/product/:id - Delete product by id
export async function deleteProduct(req, res) {
  try {
    // 1. Tìm sản phẩm
    const product = await ProductModel.findById(req.params.id).populate(
      "category"
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    // 2. Xóa ảnh trên Cloudinary
    const images = product.images; // mảng các URL ảnh

    for (const img of images) {
      const urlArr = img.split("/");
      const image = urlArr[urlArr.length - 1]; // ví dụ: abc123.jpg
      const imageName = image.split(".")[0]; // abc123

      if (imageName) {
        await cloudinary.uploader.destroy(imageName, (error, result) => {
          if (error) {
            console.error(`❌ Error deleting image "${imageName}":`, error);
          } else {
            console.log(`✅ Deleted image "${imageName}" from Cloudinary`);
          }
        });
      }
    }

    // 3. Xóa sản phẩm khỏi database
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not deleted!",
        success: false,
        error: true,
      });
    }

    // 4. Trả kết quả thành công
    return res.status(200).json({
      message: "Product deleted successfully",
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

// [DELETE] /api/product/
export async function deleteMultipleProduct(req, res) {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({
      message: "Invalid input",
      error: true,
      success: false,
    });
  }

  for (let i = 0; i < ids?.length; ++i) {
    const product = await ProductModel.findById(ids[i]);
    const images = product.images;

    for (const img of images) {
      const urlArr = img.split("/");
      const image = urlArr[urlArr.length - 1]; // abc123.jpg
      const imageName = image.split(".")[0]; // abc123

      if (imageName) {
        try {
          await cloudinary.uploader.destroy(imageName);
          console.log(`✅ Deleted image "${imageName}" from Cloudinary`);
        } catch (error) {
          console.error(`❌ Error deleting image "${imageName}":`, error);
        }
      }
    }
  }

  try {
    await ProductModel.deleteMany({ _id: { $in: ids } });
    return res.status(200).json({
      message: "Product deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/:id - Get single product
export async function getProduct(req, res) {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "category"
    );

    if (!product) {
      return res.status(400).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get product successfully",
      success: true,
      error: false,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// [PUT] /api/product/updateProduct/:id - Edit product
export async function updateProduct(req, res) {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        oldPrice: req.body.oldPrice,
        catName: req.body.catName,
        catId: req.body.catId,
        subCatId: req.body.subCatId,
        subCatName: req.body.subCatName,
        thirdSubCat: req.body.thirdSubCat,
        thirdSubCatName: req.body.thirdSubCatName,
        thirdSubCatId: req.body.thirdSubCatId,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        discount: req.body.discount,
        productRam: req.body.productRam,
        size: req.body.size,
        productWeight: req.body.productWeight,
      },
      { new: true }
    );

    if (!product) {
      res.status(404).json({
        message: "The product can not be updated",
        status: false,
      });
    }

    imagesArr = [];

    return res.status(200).json({
      message: "The product is updated",
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

export async function filters(req, res) {
  try {
    const {
      catId,
      subCatId,
      thirdSubCatId,
      minPrice,
      maxPrice,
      rating,
      page,
      limit,
    } = req.body;
    const filter = {};

    if (catId.length) {
      filter.catId = { $in: catId };
    }
    if (subCatId.length) {
      filter.subCatId = { $in: subCatId };
    }
    if (thirdSubCatId.length) {
      filter.thirdSubCatId = { $in: thirdSubCatId };
    }
    if (minPrice || maxPrice) {
      filter.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
    }
    if (rating?.length) {
      filter.rating = { $in: rating };
    }

    try {
      const products = await ProductModel.find(filter) // thay filters bằng filter
        .populate("category")
        .skip((page - 1) * limit) // Chú ý sửa lại cú pháp `.skip()`
        .limit(parseInt(limit));
      const total = await ProductModel.countDocuments(filter);

      return res.status(200).json({
        success: true,
        error: false,
        data: products,
        total: total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {}
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

const sortItem = (products, sortBy, order) => {
  return [...products].sort((a, b) => {
    if (sortBy === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === "price") {
      return order === "asc" ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });
};

export async function sortBy(req, res) {
  try {
    const { products, sortBy, order } = req.body;
    const sortedItems = sortItem([...products], sortBy, order);

    return res.status(200).json({
      success: true,
      error: false,
      data: sortedItems,
      page: 0,
      totalPages: 0,
    });
  } catch (error) {
    return res.status(500).json({
      message: res.message || error,
      error: true,
      success: false,
    });
  }
}

// [GET] /api/product/search/ - Search product
export async function searchProduct(req, res) {
  try {
    const query = req.query.q?.trim();
    const { page, limit } = req.body;

    if (!query) {
      return res.status(400).json({
        message: "Vui lòng nhập sản phẩm cần tìm!",
        error: true,
        success: false,
      });
    }

    const items = await ProductModel.find({
      $or: [
        { name: { $regex: new RegExp(query, "i") } },
        { brand: { $regex: new RegExp(query, "i") } },
        { catName: { $regex: new RegExp(query, "i") } },
        { subCatName: { $regex: new RegExp(query, "i") } },
        { thirdSubCat: { $regex: new RegExp(query, "i") } },
      ],
    })
      .populate("category")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await items.length;

    return res.status(200).json({
      success: true,
      error: false,
      data: items,
      total: total,
      page: parseInt(page),
      totalPage: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
