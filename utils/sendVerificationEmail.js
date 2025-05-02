import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function sendVerificationEmail(email, token) {
  // Configure your SMTP transporter here
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f9; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src='cid:trackedlogo' alt='TrackEd Logo' style='height: 48px; margin-bottom: 8px;' />
            <h2 style="color: #2d3748; margin: 0; font-size: 1.5rem;">Verify Your Email</h2>
          </div>
          <p style="color: #444; font-size: 1.05rem; margin-bottom: 24px;">Welcome to TrackEd! Please verify your email address to activate your account. Click the button below to verify your email.</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${url}" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 1.1rem;">Verify Email</a>
          </div>
          <p style="color: #888; font-size: 0.95rem;">If you did not sign up for TrackEd, you can safely ignore this email.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
          <div style="text-align: center; color: #aaa; font-size: 0.9rem;">&copy; ${new Date().getFullYear()} TrackEd. All rights reserved.</div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "TrackEd-Logo.png",
        path: path.join(__dirname, "../images/TrackEd-Logo.png"),
        cid: "trackedlogo",
      },
    ],
  });
}

export async function sendResetPasswordEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f9; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src='cid:trackedlogo' alt='TrackEd Logo' style='height: 48px; margin-bottom: 8px;' />
            <h2 style="color: #2d3748; margin: 0; font-size: 1.5rem;">Reset Your Password</h2>
          </div>
          <p style="color: #444; font-size: 1.05rem; margin-bottom: 24px;">We received a request to reset your TrackEd account password. Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${url}" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 1.1rem;">Reset Password</a>
          </div>
          <p style="color: #888; font-size: 0.95rem;">If you did not request this, you can safely ignore this email.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
          <div style="text-align: center; color: #aaa; font-size: 0.9rem;">&copy; ${new Date().getFullYear()} TrackEd. All rights reserved.</div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "TrackEd-Logo.png",
        path: path.join(__dirname, "../images/TrackEd-Logo.png"),
        cid: "trackedlogo",
      },
    ],
  });
}
