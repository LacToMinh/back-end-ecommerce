import CartProductModel from "../models/cartproduct.model.js";
// import UserModel from "../models/user.model.js";

export async function addToCartItem(req, res) {
  try {
    const userId = req.userId;
    const {
      productTitle,
      brand,
      image,
      rating,
      price,
      oldPrice,
      discount,
      size,
      quantity,
      subTotal,
      productId,
      countInStock,
    } = req.body;

    if (!productId) {
      return res.status(402).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    const checkItemCart = await CartProductModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (checkItemCart) {
      return res.status(400).json({
        message: "Item already in cart",
        error: true,
      });
    }

    const cartItem = new CartProductModel({
      productTitle: productTitle,
      brand: brand,
      image: image,
      rating: rating,
      price: price,
      oldPrice: oldPrice,
      discount: discount,
      size: size,
      quantity: quantity,
      subTotal: subTotal,
      productId: productId,
      countInStock: countInStock,
      userId: userId,
    });

    const save = await cartItem.save();

    // const updateCartUser = await UserModel.updateOne(
    //   { _id: userId },
    //   {
    //     $push: {
    //       shopping_cart: productId,
    //     },
    //   }
    // );

    return res.status(200).json({
      message: "Item add successfully!",
      data: save,
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

export async function getCartItem(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is missing!",
        success: false,
        error: true,
      });
    }

    const cartItems = await CartProductModel.find({
      userId: userId,
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({
        message: "Cart is empty!",
        success: true,
        error: false,
        data: [],
      });
    }

    return res.status(200).json({
      message: "Get cart item successfully!",
      success: true,
      error: false,
      data: cartItems,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, qty } = request.body;

    if (!_id || !qty) {
      return response.status(400).json({
        message: "provide _id, qty",
        success: false,
        error: true,
      });
    }

    // Lấy item trong giỏ hàng để tính lại subTotal
    const cartItem = await CartProductModel.findOne({ _id, userId });

    if (!cartItem) {
      return response.status(404).json({
        message: "Cart item not found",
        success: false,
        error: true,
      });
    }

    const newSubTotal = cartItem.price * qty;

    cartItem.quantity = qty;
    cartItem.subTotal = newSubTotal;

    await cartItem.save();

    return response.json({
      message: "Cart item updated successfully",
      success: true,
      error: false,
      data: cartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};

// PATCH /api/cart/update
export const updateCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id, qty, size } = req.body; // nhận thêm size

    if (!_id) {
      return res.status(400).json({
        message: "provide _id",
        success: false,
        error: true,
      });
    }

    const cartItem = await CartProductModel.findOne({ _id, userId });
    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        success: false,
        error: true,
      });
    }

    if (qty !== undefined) {
      cartItem.quantity = qty;
      cartItem.subTotal = cartItem.price * qty;
    }
    if (size) {
      cartItem.size = size;
    }

    await cartItem.save();
    return res.status(200).json({
      message: "Cart item updated successfully",
      success: true,
      error: false,
      data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};

// [DELETE] /api/cart/delete/:_id - Delete cart item
export const deleteCartItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id } = request.params; // id của cart item

    if (!_id) {
      return response.status(400).json({
        message: "provide _id",
        success: false,
        error: true,
      });
    }

    const deleted = await CartProductModel.findOneAndDelete({
      _id,
      userId,
    });

    if (!deleted) {
      return response.status(404).json({
        message: "Cart item not found",
        success: false,
        error: true,
      });
    }

    return response.json({
      message: "Cart item deleted successfully",
      success: true,
      error: false,
      data: deleted,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};

// [DELETE] /api/cart/emptyCart/:id
export const emptyCartController = async (req, res) => {
  try {
    const userId = req.params.id; // auth middleware

    await CartProductModel.deleteMany({ userId: userId });

    return res.status(200).json({
      error: false,
      success: true,
      message: "Giỏ hàng đã được làm trống!"
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: "Có lỗi khi làm trống giỏ hàng!",
      err: error.message,
    });
  }
};

