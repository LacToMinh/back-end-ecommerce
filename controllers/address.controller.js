import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

// [POST] /api/address/add
export async function addAddressController(req, res) {
  // const session = await mongoose.startSession();
  try {
    const {
      address_line1,
      city,
      state,
      pincode,
      mobile,
      status,
      selected,
      landmark,
      addressType,
    } = req.body;
    const userId = req.userId; // middleware

    if (
      !address_line1 ||
      !city ||
      !state ||
      !pincode ||
      !mobile ||
      !addressType
    ) {
      return res.status(400).json({
        message: "Please provide the fields",
        error: true,
        success: false,
      });
    }

    // session.startTransaction();

    const address = new AddressModel({
      address_line1,
      city,
      state,
      pincode,
      mobile,
      status,
      userId,
      selected,
      landmark,
      addressType,
    });

    const saveAddress = await address.save({});

    const updateUser = await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { address_details: saveAddress._id } }
    );

    return res.status(200).json({
      data: saveAddress,
      message: "Address add successfully",
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

// [GET] /api/address/get
export async function getAddressController(req, res) {
  try {
    // const userId = req.userId;
    const address = await AddressModel.find({ userId: req?.userId });
    // const address = await AddressModel.findById(userId);

    if (!address) {
      return res.status(400).json({
        message: "Address not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      address: address,
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

// [PUT] /api/address/selectAddress
export async function selectAddressController(req, res) {
  try {
    const addressId = req?.params.id;

    // 1. Tìm địa chỉ để lấy userId
    const selectedAddress = await AddressModel.findById(addressId);
    if (!selectedAddress) {
      return res.status(404).json({
        message: "Address not found",
        error: true,
        success: false,
      });
    }

    // 2. Set tất cả các địa chỉ của user này về false
    await AddressModel.updateMany(
      { userId: selectedAddress.userId },
      { selected: false }
    );

    // 3. Set selected=true cho địa chỉ được chọn
    const updateAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      { selected: true },
      { new: true }
    );

    return res.status(200).json({
      message: "Update address successfully!",
      success: true,
      error: false,
      address: updateAddress,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [DELETE] /api/address/delete/:id
export async function deleteAddressController(req, res) {
  try {
    const addressId = req.params.id;

    // Kiểm tra có tồn tại không
    const address = await AddressModel.findById(addressId);
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
        success: false,
        error: true,
      });
    }

    await AddressModel.deleteOne({ _id: addressId });

    // Nếu cần, cập nhật lại selected nếu địa chỉ vừa xóa là selected
    // Có thể chọn lại 1 địa chỉ mặc định khác (nếu còn địa chỉ)
    // Optional: logic này nếu muốn

    return res.status(200).json({
      message: "Deleted address successfully!",
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
