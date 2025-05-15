const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  country: String,
  sector: String,
  suggestion: String,
  email: String,
  timestamp: { type: Date, default: Date.now },
  solved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Problem", ProblemSchema);