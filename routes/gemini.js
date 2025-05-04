import express from "express";
import axios from "axios";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/recommend-projects", authMiddleware, async (req, res) => {
  const { context } = req.body;
  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Suggest 3 academic project ideas with 3-5 tasks each for a college student. Context: ${context}. Respond in JSON: [{title, description, tasks:[{title, description}]}]`,
              },
            ],
          },
        ],
      }
    );
    let text = geminiRes.data.candidates[0].content.parts[0].text;
    // Remove code block markers if present
    text = text.replace(/```json|```/g, "").trim();
    const projects = JSON.parse(text);

    res.json({ projects });
  } catch (err) {
    console.log("Error fetching recommendations:", err);

    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

export default router;
