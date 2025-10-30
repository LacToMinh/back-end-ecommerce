const VerificationEmail = (username, otp) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      .header h1 {
        color: #0E1D61;
        margin: 0px;
      }
      .image {
        text-align: center;
        margin-bottom: 0px;
      }
      .content {
        text-align: center;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
      }
      .otp {
        font-size: 22px;
        font-weight: 700;
        color: green;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #777;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="image">
        <img src="https://res.cloudinary.com/diwj0b37p/image/upload/v1754211434/1754211430945_bear_email.png" alt="Verify Image" width="160" />
      </div>
      <div class="header">
        <h1>Xác minh địa chỉ email của bạn</h1>
      </div>
      <div class="content">
        <p>Xin chào ${username},</p>
        <p>Cảm ơn bạn đã đăng ký với ICONDENIM. Vui lòng sử dụng mã OTP bên dưới để xác minh địa chỉ email của bạn:</p>
        <div class="otp">${otp}</div>
        <p>Nếu bạn không tạo tài khoản, bạn có thể bỏ qua email này.</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 Lạc Tô Minh. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;
};

export default VerificationEmail;
