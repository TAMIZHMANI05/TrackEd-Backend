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
                text: `Suggest 4 academic project ideas with 3-5 tasks each for a college student. Context: ${context}. Respond in JSON: [{title, description, tasks:[{title, description}]}]`,
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

// Conversational AI chat endpoint
router.post("/ai-chat", authMiddleware, async (req, res) => {
  const { message, history, userData } = req.body;
  try {
    // Compose a prompt with user data and chat history
    const chatHistory = (history || [])
      .map((m) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n");
    const semestersJson = JSON.stringify(userData?.cgpaData || []);
    const projectsJson = JSON.stringify(userData?.projects || []);
    const userProfile = `User Profile: Name: ${
      userData?.fullName || "N/A"
    }, Email: ${userData?.email || "N/A"}, Course: ${
      userData?.course || "N/A"
    }, Current CGPA: ${
      userData?.currentCgpa || "N/A"
    },\nSemesters Data (JSON): ${semestersJson}\nProjects Data (JSON): ${projectsJson}`;
    const prompt = `${userProfile}\nChat History:\n${chatHistory}\nUser: ${message}\nAI:`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );
    let text = geminiRes.data.candidates[0].content.parts[0].text;
    // Remove code block markers if present
    text = text.replace(/```json|```/g, "").trim();
    res.json({ reply: text });
  } catch (err) {
    console.log("Error in AI chat:", err);
    res.status(500).json({ reply: "Sorry, I couldn't process your request." });
  }
});

export default router;
