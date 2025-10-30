import { sendEmail } from "./emailService.js";

const sendEmailFun = async (to, subject, text, html) => {
  const result = await sendEmail(to, subject, text, html);
  if (result.success) {
    console.log("📧 Email gửi thành công!");
    return true;
  } else {
    console.error("⚠️ Gửi email thất bại:", result.error);
    return false;
  }
};

export default sendEmailFun;
