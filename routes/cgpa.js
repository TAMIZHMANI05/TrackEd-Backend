import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// Helper to calculate SGPA for a semester
function calculateSGPA(subjects) {
  const GRADE_POINTS = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5 };
  let totalPoints = 0;
  let totalCredits = 0;
  subjects.forEach(({ credits, grade }) => {
    const points = GRADE_POINTS[grade] || 0;
    totalPoints += points * Number(credits);
    totalCredits += Number(credits);
  });
  return totalCredits ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
}

// Helper to calculate CGPA up to a given semester
function calculateCGPAUpTo(cgpaData, uptoIndex) {
  let totalPoints = 0;
  let totalCredits = 0;
  for (let i = 0; i <= uptoIndex; i++) {
    cgpaData[i].subjects.forEach(({ credits, grade }) => {
      const GRADE_POINTS = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5 };
      const points = GRADE_POINTS[grade] || 0;
      totalPoints += points * Number(credits);
      totalCredits += Number(credits);
    });
  }
  return totalCredits ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
}

// Get CGPA data for authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("cgpaData");
    const cgpaData = user?.cgpaData || [];
    res.json({ cgpaData });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch CGPA data" });
  }
});

// Update CGPA data for authenticated user
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { cgpaData } = req.body;
    if (!Array.isArray(cgpaData)) {
      return res.status(400).json({ error: "Invalid CGPA data format" });
    }
    // Calculate SGPA and CGPA for each semester
    const updatedCgpaData = cgpaData.map((sem, idx, arr) => {
      const sgpa = calculateSGPA(sem.subjects);
      const cgpa = calculateCGPAUpTo(arr, idx);
      return { ...sem, sgpa, cgpa };
    });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cgpaData: updatedCgpaData },
      { new: true, runValidators: true, select: "cgpaData" }
    );
    res.json({ cgpaData: user.cgpaData });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
