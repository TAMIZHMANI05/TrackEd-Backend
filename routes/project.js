import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// Get all projects for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("projects");
    res.json({ projects: user.projects || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Add a new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, status, tasks, notes } = req.body;
    const newProject = {
      title,
      description,
      dueDate,
      status,
      tasks: tasks || [],
      notes: notes || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { projects: newProject } },
      { new: true, select: "projects" }
    );
    res.json({ projects: user.projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to add project" });
  }
});

// Update a project
router.put("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const update = req.body;
    update.updatedAt = new Date();
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, "projects._id": projectId },
      { $set: { "projects.$": { ...update, _id: projectId } } },
      { new: true, select: "projects" }
    );
    res.json({ projects: user.projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { projects: { _id: projectId } } },
      { new: true, select: "projects" }
    );
    res.json({ projects: user.projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
