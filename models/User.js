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
  cgpaData: [
    {
      semester: { type: Number, required: true },
      subjects: [
        {
          subject: { type: String, required: true },
          credits: { type: Number, required: true },
          grade: { type: String, required: true },
        },
      ],
      sgpa: { type: Number, default: 0 }, // SGPA for this semester
      cgpa: { type: Number, default: 0 }, // CGPA up to this semester
    },
  ],
  currentCgpa: { type: Number, default: 0 }, // Current CGPA for the user
});

export default mongoose.model("User", userSchema);
