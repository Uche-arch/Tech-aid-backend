const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");         // ✅ Don't forget this
const cors = require("cors");
const Problem = require("./models/problem");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.post("/api/submit", async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    await newProblem.save();
    res.status(201).json({ message: "Problem saved successfully." });
  } catch (error) {
    console.error("❌ Error saving problem:", error);
    res.status(500).json({ message: "Error saving problem." });
  }
});

// Get all problems
app.get("/api/problems", async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching problems" });
  }
});

// Toggle solved
app.patch("/api/solved/:id", async (req, res) => {
  try {
    const { solved } = req.body;
    await Problem.findByIdAndUpdate(req.params.id, { solved });
    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

// Delete problem
app.delete("/api/delete/:id", async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting problem" });
  }
});

// Check admin password
app.post("/api/auth", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ✅ Ping route for self-wake
app.get("/ping", (req, res) => {
  res.send("pong");
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // ✅ node-cron self-ping every 4 minutes
  cron.schedule("*/4 * * * *", async () => {
    try {
      const res = await fetch("https://tech-aid-backend.onrender.com/ping"); // Replace with your actual backend URL
      const text = await res.text();
      console.log(
        `[Self-Ping] ✅ ${text} at ${new Date().toLocaleTimeString()}`
      );
    } catch (err) {
      console.error(`[Self-Ping] ❌ Failed: ${err.message}`);
    }
  });
});
