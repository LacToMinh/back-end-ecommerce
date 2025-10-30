// controllers/systemPermission.controller.js
export const getSystemPermissionTemplates = async (req, res) => {
  try {
    const templates = [
      // 📦 Categories
      {
        module: "Danh mục sản phẩm",
        codes: [
          { code: "ADD_CATEGORY", label: "Thêm danh mục" },
          { code: "EDIT_CATEGORY", label: "Sửa danh mục" },
          { code: "DELETE_CATEGORY", label: "Xóa danh mục" },
          { code: "VIEW_CATEGORY", label: "Xem danh sách danh mục" },
        ],
      },

      // 🛒 Orders
      {
        module: "Đơn hàng",
        codes: [{ code: "VIEW_ORDER", label: "Xem đơn hàng" }],
      },

      // ⚙️ Permissions
      {
        module: "Phân quyền hệ thống",
        codes: [
          { code: "ADD_PERMISSION", label: "Thêm quyền" },
          { code: "EDIT_PERMISSION", label: "Sửa quyền" },
          { code: "DELETE_PERMISSION", label: "Xóa quyền" },
        ],
      },

      // 📦 Products
      {
        module: "Sản phẩm",
        codes: [
          { code: "ADD_PRODUCT", label: "Thêm sản phẩm" },
          { code: "EDIT_PRODUCT", label: "Sửa sản phẩm" },
          { code: "DELETE_PRODUCT", label: "Xóa sản phẩm" },
          { code: "DELETE_MULTIPLE_PRODUCT", label: "Xóa nhiều sản phẩm" },
          { code: "VIEW_PRODUCT", label: "Xem danh sách sản phẩm" },
          { code: "UPLOAD_PRODUCT_IMAGE", label: "Upload hình sản phẩm" },
        ],
      },

      // 🧩 Product RAMS
      {
        module: "Chi tiết sản phẩm (RAMS)",
        codes: [
          { code: "ADD_PRODUCT_RAM", label: "Thêm RAM sản phẩm" },
          { code: "EDIT_PRODUCT_RAM", label: "Sửa RAM sản phẩm" },
          { code: "DELETE_PRODUCT_RAM", label: "Xóa RAM sản phẩm" },
        ],
      },

      // 🧭 Home sliders
      {
        module: "Trang chủ - Slider",
        codes: [
          { code: "ADD_HOMESLIDER", label: "Thêm slider" },
          { code: "EDIT_HOMESLIDER", label: "Sửa slider" },
          { code: "DELETE_HOMESLIDER", label: "Xóa slider" },
        ],
      },

      // 🧑‍💼 Roles
      {
        module: "Quản lý vai trò (Roles)",
        codes: [
          { code: "ADD_ROLE_PARENT", label: "Thêm role cha" },
          { code: "ADD_ROLE_CHILD", label: "Thêm role con" },
          { code: "DELETE_ROLE", label: "Xóa role" },
          { code: "EDIT_ROLE", label: "Sửa role" },
        ],
      },

      // 👤 Users
      {
        module: "Người dùng",
        codes: [
          { code: "ADD_USER", label: "Thêm người dùng" },
          { code: "EDIT_USER", label: "Sửa người dùng" },
          { code: "DELETE_USER", label: "Xóa người dùng" },
          { code: "VIEW_USER", label: "Xem danh sách người dùng" },
        ],
      },
    ];

    res.status(200).json({ success: true, templates });
  } catch (err) {
    console.error("❌ getSystemPermissionTemplates:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách mẫu quyền!",
    });
  }
};
