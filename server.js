import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import cgpaRoutes from "./routes/cgpa.js";
import projectRoutes from "./routes/project.js";
import geminiRoutes from "./routes/gemini.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:2810",
      "http://localhost:2810",
    ],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/cgpa", cgpaRoutes);
app.use("/api/project", projectRoutes); // Assuming you have a projects route
app.use("/api/gemini", geminiRoutes);

app.get("/", (req, res) => {
  res.send("TrackEd backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
