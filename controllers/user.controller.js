import UserModel from "../models/user.model.js";
import RoleModel from "../models/role.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";

import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";

// 📌 Lấy chi tiết user theo ID (dùng cho trang EditUser)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).populate("role", "name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công!",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin người dùng!",
      error: error.message,
    });
  }
};

export const getAllUsersHaveRole = async (req, res) => {
  try {
    // lấy tất cả user
    let users = await UserModel.find().lean();

    // lọc ra user có role hợp lệ (loại bỏ null hoặc "")
    users = users.filter(
      (u) =>
        (u.role && typeof u.role === "object") ||
        /^[0-9a-fA-F]{24}$/.test(u.role)
    );

    // populate chỉ các user có role là ObjectId
    const populated = await UserModel.populate(users, {
      path: "role",
      select: "name",
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách user có quyền thành công!",
      users: populated.filter((u) => u.role), // chỉ giữ user đã có quyền thực sự
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách user có quyền!",
      error: err.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    if (!name || !email || !password || !roleId)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const role = await RoleModel.findById(roleId);
    if (!role)
      return res.status(404).json({ message: "Không tìm thấy Role này" });

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role._id,
      verify_email: true,
      status: "Active",
    });

    res.status(201).json({
      message: "Tạo user thành công",
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const { id } = req.params;

    const updated = await UserModel.findByIdAndUpdate(
      id,
      { role: roleId },
      { new: true }
    ).populate("role", "name");

    res.status(200).json({
      success: true,
      message: `Đã cập nhật quyền cho ${updated.name} thành ${updated.role.name}`,
      user: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật quyền người dùng!",
      error: error.message,
    });
  }
};

// ✅ Lấy danh sách role để hiển thị dropdown
export const getRoles = async (req, res) => {
  try {
    const roles = await RoleModel.find().select("name");
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: name, email, password",
      });
    }

    // 2️⃣ Kiểm tra email đã tồn tại chưa
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    // 3️⃣ Mã hoá mật khẩu
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    // 4️⃣ Sinh mã xác thực email (OTP)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 5️⃣ Tìm hoặc tạo role mặc định "User"
    let defaultRole = await RoleModel.findOne({ name: "User" });
    if (!defaultRole) {
      defaultRole = await RoleModel.create({
        name: "User",
        code: "USER",
        description: "Vai trò mặc định cho người dùng mới",
        permissions: [],
      });
      console.log("✅ Đã tạo role mặc định 'User'");
    }

    // 6️⃣ Tạo tài khoản người dùng mới
    const newUser = await UserModel.create({
      name,
      email,
      password: hashPassword,
      role: defaultRole._id, // Gán role mặc định
      otp: verifyCode,
      otpExpires: Date.now() + 600000, // 10 phút
    });

    // 7️⃣ Gửi email xác thực
    await sendEmailFun(
      email,
      "Xác thực tài khoản LAMINSTORE",
      "",
      VerificationEmail(name, verifyCode)
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: defaultRole.name,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi đăng ký tài khoản",
    });
  }
}

// [POST] /api/user/verifyEmail - Verify email using OTP
export async function verifyEmailController(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(200).json({
        message: "Email verified successfully",
        success: true,
        error: false,
      });
    } else if (!isCodeValid) {
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    } else {
      return res.status(400).json({
        message: "OTP expired",
        error: true,
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

// // [POST] /api/user/login - Log in with Google and receive tokens
// export async function authWithGoogle(req, res) {
//   const { name, email, avatar, mobile, signUpWithGoogle } = req.body;

//   try {
//     // 1️⃣ Kiểm tra người dùng đã tồn tại chưa
//     let existingUser = await UserModel.findOne({ email });

//     // 2️⃣ Nếu chưa có role "User" thì tạo mới
//     let defaultRole = await RoleModel.findOne({ name: "User" });
//     if (!defaultRole) {
//       defaultRole = await RoleModel.create({
//         name: "User",
//         code: "USER",
//         description: "Vai trò mặc định cho người dùng đăng nhập bằng Google",
//         permissions: [],
//       });
//       console.log("✅ Đã tạo role mặc định 'User'");
//     }

//     // 3️⃣ Nếu user chưa tồn tại, tạo mới
//     if (!existingUser) {
//       const user = await UserModel.create({
//         name,
//         email,
//         mobile: mobile || null,
//         password: "", // không cần password cho Google Auth
//         avatar: avatar || "",
//         role: defaultRole._id,
//         verify_email: true, // ✅ bạn nên giữ đồng nhất tên trường như trong schema
//         signUpWithGoogle: true,
//       });

//       await user.save();

//       const accessToken = await generatedAccessToken(user._id);
//       const refreshToken = await generatedRefreshToken(user._id);

//       await UserModel.findByIdAndUpdate(user?._id, {
//         last_login_date: new Date(),
//       });

//       const cookiesOption = {
//         httpOnly: true,
//         secure: false,
//         sameSite: "None",
//       };

//       // res.cookie(name, value, options)
//       res.cookie("accessToken", accessToken, cookiesOption);
//       res.cookie("refreshToken", refreshToken, cookiesOption);

//       return res.status(200).json({
//         message: "Login successfully",
//         success: true,
//         error: false,
//         data: {
//           accessToken,
//           refreshToken,
//         },
//       });
//     } else {
//       const accessToken = await generatedAccessToken(existingUser._id);
//       const refreshToken = await generatedRefreshToken(existingUser._id);

//       await UserModel.findByIdAndUpdate(existingUser?._id, {
//         last_login_date: new Date(),
//       });

//       const cookiesOption = {
//         httpOnly: true,
//         secure: false,
//         sameSite: "None",
//       };

//       // res.cookie(name, value, options)
//       res.cookie("accessToken", accessToken, cookiesOption);
//       res.cookie("refreshToken", refreshToken, cookiesOption);
//     }

//     // 4️⃣ (Tuỳ chọn) – Sinh JWT token hoặc access_token nếu bạn có auth middleware
//     // const token = generateToken(existingUser._id);

//     // 5️⃣ Trả về phản hồi
//     return res.status(200).json({
//       success: true,
//       message: "Đăng nhập Google thành công",
//       user: {
//         id: existingUser._id,
//         name: existingUser.name,
//         email: existingUser.email,
//         avatar: existingUser.avatar,
//         role: defaultRole.name,
//       },
//       // token, // Nếu có
//     });
//   } catch (error) {
//     console.error("❌ Lỗi đăng nhập Google:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Lỗi máy chủ trong quá trình đăng nhập Google",
//     });
//   }
// }

// [POST] /api/user/authWithGoogle
export async function authWithGoogle(req, res) {
  const { name, email, avatar, mobile, signUpWithGoogle } = req.body;

  try {
    // 1️⃣ Kiểm tra người dùng đã tồn tại chưa
    let existingUser = await UserModel.findOne({ email });

    // 2️⃣ Tạo hoặc lấy role mặc định “User”
    let defaultRole = await RoleModel.findOne({ name: "User" });
    if (!defaultRole) {
      defaultRole = await RoleModel.create({
        name: "User",
        code: "USER",
        description: "Vai trò mặc định cho người dùng đăng nhập bằng Google",
        permissions: [],
      });
      console.log("✅ Đã tạo role mặc định 'User'");
    }

    // 3️⃣ Nếu user chưa tồn tại → tạo mới
    let user;
    if (!existingUser) {
      user = await UserModel.create({
        name,
        email,
        mobile: mobile || null,
        password: null, // Google login không cần password
        avatar: avatar || "",
        role: defaultRole._id, // ✅ gán ObjectId
        verify_email: true,
        signUpWithGoogle: true,
        last_login_date: new Date(),
      });
    } else {
      user = existingUser;
      await UserModel.findByIdAndUpdate(user._id, { last_login_date: new Date() });
    }

    // 4️⃣ Sinh Access Token + Refresh Token
    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    // 5️⃣ Lưu vào cookie
    const cookieOptions = {
      httpOnly: true,
      secure: true, // nếu deploy dùng HTTPS
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // 6️⃣ Trả phản hồi về client
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: defaultRole.name,
      },
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập Google:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ trong quá trình đăng nhập Google",
    });
  }
}

// [POST] /api/user/login - Log in and receive tokens
export async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    // const user = await UserModel.findOne({ email: email });
    // ✅ Lấy user kèm role và quyền (permissions)
    const user = await UserModel.findOne({ email: email }).populate({
      path: "role",
      populate: {
        path: "permissions",
        select: "code description actions",
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not register",
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return res.status(400).json({
        message: "Please verify your email before logging in.",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Account is not active. Please contact to admin",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        message: "Check password",
        error: true,
        success: false,
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: false,
      sameSite: "None",
    };

    // res.cookie(name, value, options)

    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.status(200).json({
      message: "Login successfully",
      success: true,
      error: false,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [POST] /api/user/logout - Log out, clear cookies, and reset refresh token
export async function logoutUserController(req, res) {
  try {
    const userId = req.userId; //middleware

    const cookiesOption = {
      httpOnly: true,
      secure: false,
      sameSite: "None",
    };

    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    return res.status(200).json({
      message: "Logout successfully",
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

// [PUT] /api/user/user-avatar - Upload avatar to Cloudinary and update user profile
export async function userAvatarController(req, res) {
  try {
    const imagesArr = [];
    const userId = req.userId;
    const image = req.files;

    if (!image || image.length === 0) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
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

    user.avatar = imagesArr[0];
    await user.save();

    return res.status(200).json({
      _id: userId,
      avatar: imagesArr[0],
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

// [DELETE] /api/user/deleteImage?img=... - Delete image from Cloudinary and update user.avatar
export async function removeImageController(req, res) {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
      const result = await cloudinary.uploader.destroy(imageName);
      if (result)
        res.status(200).json({
          message: "Image deleted successfully",
          success: true,
          cloudinaryResult: result,
        });
    }

    const user = await UserModel.findById(req.userId);
    if (user.avatar.includes(imageName)) {
      user.avatar = "";
      await user.save();
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [PUT] /api/user/:id - Update user details
export async function updateUserDetailsController(req, res) {
  try {
    const userId = req.userId; // auth middleware
    const { name, email, mobile, password } = req.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    let verifyCode = "";
    if (email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    let hashPassword = "";
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    } else {
      hashPassword = userExist.password;
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        email: email,
        mobile: mobile,
        password: hashPassword,
        verify_email: email !== userExist.email ? false : true,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpires: verifyCode !== "" ? Date.now() + 600000 : "",
      },
      { new: true }
    );

    if (email !== userExist.email) {
      await sendEmailFun(
        email,
        "Verify email from ICONDENIM",
        "",
        VerificationEmail(userExist.name, verifyCode)
      );
    }

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      error: false,
      user: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [POST] /api/user/forgot-password - Forgot password
export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    } else {
      let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      const updateUser = await UserModel.findByIdAndUpdate(user._id, {
        otp: verifyCode,
        otpExpires: Date.now() + 600000,
      });

      await sendEmailFun(
        email,
        "Verify email from ICONDENIM",
        "",
        VerificationEmail(user?.name, verifyCode)
      );

      return res.status(200).json({
        message: "Check your email",
        success: true,
        error: false,
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

// [POST] /api/user/verify-password-otp - Verify forgot password otp
export async function verifyForgotPasswordOtpController(req, res) {
  try {
    const { email, otp } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        message: "Provide required fields: email, otp",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    if (otp !== user.otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date();

    if (user.otpExpires && user.otpExpires < currentTime) {
      return res.status(400).json({
        message: "OTP is expired",
        error: true,
        success: false,
      });
    }

    user.otp = "";
    user.otpExpires = null;

    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully!",
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

// [POST] /api/user/reset-password - Reset password
export async function resetPassword(req, res) {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Provide required fields: email, newPassword, confirmPassword",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(oldPassword, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Your old password is wrong",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password must be same",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await UserModel.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        password: hashPassword,
      }
    );

    return res.status(200).json({
      message: "Password reset successfully",
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

// [POST] /api/user/reset-token - Refresh token
export async function refeshToken(req, res) {
  try {
    const refreshToken =
      req.cookies.refeshToken || req?.headers?.authorization?.split(" ")[1]; // [Bearer token]

    if (!refeshToken) {
      return res.status(401).json({
        message: "Invalid token",
        error: true,
        success: false,
      });
    }

    const verifyToken = jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );

    const userId = verifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: false,
      sameSite: "None",
    };

    res.cookie("accessToken", newAccessToken, cookiesOption);

    return res.status(200).json({
      message: "New access token generated",
      success: true,
      error: false,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// [GET] /api/user/user-details - Get login user details
export async function userDetails(request, response) {
  try {
    const userId = request.userId;

    // const user = await UserModel.findById(userId).select(
    //   "-password -refresh_token"
    // );

    // const user = await UserModel.findById(userId)
    //   .select("-password -refresh_token")
    //   .populate({
    //     path: "role",
    //     populate: {
    //       path: "permissions",
    //       select: "code description actions",
    //     },
    //   });
    const user = await UserModel.findById(userId)
      .select("-password -refresh_token")
      .populate({
        path: "role",
        populate: { path: "permissions" },
      });
    console.log("🧑‍💼 User gửi về client:", user);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "User details",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something is wrong",
      error: true,
      success: false,
    });
  }
}
