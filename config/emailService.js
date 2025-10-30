import nodemailer from "nodemailer";

console.log("📦 ENV CHECK:", process.env.EMAIL, process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Not loaded");

const transporter = nodemailer.createTransport({
  // service: 'gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  // service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Kiểm tra kết nối SMTP ngay sau khi khởi tạo
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails!");
  }
});

// ✅ Hàm gửi email có log chi tiết
async function sendEmail(to, subject, text, html) {
  try {
    console.log("📤 [SEND EMAIL START]");
    console.log("👉 To:", to);
    console.log("👉 Subject:", subject);
    console.log("👉 From:", process.env.EMAIL);

    const info = await transporter.sendMail({
      from: `"ICONDENIM" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ [EMAIL SENT SUCCESSFULLY]");
    console.log("📨 Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [EMAIL SEND FAILED]");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error response:", error.response);
    return { success: false, error: error.message };
  }
}

export { sendEmail };
