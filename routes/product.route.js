import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createProduct,
  createProductRAMS,
  deleteMultipleProduct,
  deleteProduct,
  filters,
  getAllProducts,
  getAllProductsByCatId,
  getAllProductsByCatName,
  getAllProductsBySubCatId,
  getAllProductsByThirdSubCatId,
  getProduct,
  searchProduct,
  searchSuggest,
  sortBy,
  updateProduct,
  uploadImage,
} from "../controllers/product.controller.js";

const productRouter = Router();

// 📸 Upload ảnh
productRouter.post(
  "/uploadImages",
  auth,
  upload.array("images"),
  // safePermission("UPLOAD_PRODUCT_IMAGE"),
  uploadImage
);

// ➕ Tạo sản phẩm
productRouter.post(
  "/create",
  auth,
  // safePermission("ADD_PRODUCT"),
  createProduct
);

// 🧩 Tạo sản phẩm kiểu RAMS (nếu có module riêng)
productRouter.post(
  "/productRAMS/create",
  auth,
  // safePermission("ADD_PRODUCT_RAM"),
  createProductRAMS
);

// 🔍 Lấy danh sách sản phẩm
productRouter.get(
  "/getAllProducts",
  auth,
  // safePermission("VIEW_PRODUCT"),
  getAllProducts
);

productRouter.post("/search", searchProduct);

productRouter.get("/search-suggest", searchSuggest);

// 🔍 Theo ID chủ đề
productRouter.get(
  "/getAllProductsByCatId/:id",
  auth,
  // safePermission("VIEW_PRODUCT_BY_CAT"),
  getAllProductsByCatId
);

// 🔍 Theo tên chủ đề
productRouter.get(
  "/getAllProductsByCatName",
  // safePermission("VIEW_PRODUCT_BY_CATNAME"),
  getAllProductsByCatName
);

// 🔍 Theo ID danh mục con
productRouter.get(
  "/getAllProductsBySubCatId/:id",
  auth,
  // safePermission("VIEW_PRODUCT_BY_SUBCAT"),
  getAllProductsBySubCatId
);

// 🔍 Theo danh mục cấp 3
productRouter.get(
  "/getAllProductsByThirdSubCatId/:id",
  auth,
  // safePermission("VIEW_PRODUCT_BY_THIRDCAT"),
  getAllProductsByThirdSubCatId
);

// ❌ Xóa nhiều sản phẩm
productRouter.delete(
  "/deleteMultiple",
  auth,
  // safePermission("DELETE_MULTIPLE_PRODUCT"),
  deleteMultipleProduct
);

// ❌ Xóa 1 sản phẩm
productRouter.delete(
  "/:id",
  auth,
  // safePermission("DELETE_PRODUCT"),
  deleteProduct
);

// ✏️ Cập nhật sản phẩm
productRouter.put(
  "/updateProduct/:id",
  auth,
  // safePermission("EDIT_PRODUCT"),
  updateProduct
);

// 🔍 Lấy chi tiết sản phẩm
productRouter.get(
  "/:id",
  // safePermission("VIEW_PRODUCT_DETAIL"),
  getProduct
);

productRouter.post("/filter", filters);
productRouter.post("/sortBy", sortBy);
export default productRouter;
