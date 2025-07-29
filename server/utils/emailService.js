import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendOrderEmail = async (toEmail, orderHash) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your email service provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your Order Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #275060;">Thank you for your order!</h2>
        <p>We’re excited to process your order.</p>
         <p><strong>Your order ID:</strong> ${orderHash}</p>
        <p><strong>Your order reference link:</strong></p>
        <a href="http://localhost:5173/admin/order/${orderHash}" 
           style="display: inline-block; padding: 10px 20px; background-color: #DE4E13; color: #fff; text-decoration: none; border-radius: 5px;">
          Press and View Your Order
        </a>
    
        <p>If you have any questions, feel free to reply to this email.</p>
        <hr style="margin: 20px 0;">
        <footer style="font-size: 12px; color: #888;">
          Abe Garage •Calgary, Canada
        </footer>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendOrderEmail };
