import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendVerificationEmail, {
  sendResetPasswordEmail,
} from "../utils/sendVerificationEmail.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(409).json({ error: "Email already registered." });

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = new User({
    email,
    password: hashedPassword,
    verificationToken,
    verificationSentAt: new Date(),
  });
  await user.save();
  await sendVerificationEmail(email, verificationToken);
  res
    .status(201)
    .json({ message: "Signup successful. Please verify your email." });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials." });
  if (!user.isVerified)
    return res.status(403).json({ error: "Email not verified." });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

  // Generate JWT
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ message: "Login successful.", token });
});

// Protected route example: get current user
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -verificationToken"
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// Email Verification
router.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  if (!token)
    return res.status(400).json({ error: "Verification token is required." });
  const user = await User.findOne({ verificationToken: token });
  if (!user)
    return res.status(400).json({ error: "Invalid or expired token." });
  if (user.isVerified)
    return res.status(400).json({ error: "Email already verified." });
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.json({ message: "Email verified successfully." });
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(200)
      .json({
        message: "If that email is registered, a reset link has been sent.",
      });
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();
  await sendResetPasswordEmail(email, resetToken);
  res
    .status(200)
    .json({
      message: "If that email is registered, a reset link has been sent.",
    });
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res
      .status(400)
      .json({ error: "Token and new password are required." });
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    return res.status(400).json({ error: "Invalid or expired token." });
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: "Password has been reset successfully." });
});

export default router;
