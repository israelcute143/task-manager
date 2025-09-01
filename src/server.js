import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect("mongodb+srv://intingUser:12345@cluster-1.ue3dsti.mongodb.net/taskDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected to Atlas"))
.catch((err) => console.log("❌ MongoDB connection error:", err));

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ["pending", "in-progress", "completed"], 
    default: "pending" 
  },
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

// ROUTES -------------------------------

// ➕ Create Task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Validate title
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = new Task({ title, description, status });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📖 Get All Tasks + Search + Filter
app.get("/api/tasks", async (req, res) => {
  try {
    const { keyword, status } = req.query;
    let query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📖 Get One Task by ID
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Invalid Task ID" });
  }
});

// ✏️ Update Task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { title, description, status }, 
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ Delete Task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "✅ Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Invalid Task ID" });
  }
});

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Task API is running...");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
