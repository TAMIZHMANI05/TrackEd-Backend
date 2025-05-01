import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationSentAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  fullName: { type: String },
  studentId: { type: String },
  course: { type: String },
});

export default mongoose.model("User", userSchema);
