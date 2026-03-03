const express = require("express");
const router = express.Router();
const Benchmark = require("../models/Benchmarkmod");

// CREATE
router.post("/", async (req, res) => {
  try {
    const existing = await Benchmark.findOne({ year: req.body.year });
    if (existing) return res.status(400).json({ error: "Benchmark form for this year already exists" });

    const benchmark = new Benchmark({ ...req.body, entryDateTime: new Date() });
    const saved = await benchmark.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: "Error saving data" });
  }
});

// FETCH ALL
router.get("/", async (req, res) => {
  try {
    const benchmarks = await Benchmark.find().sort({ year: -1 });
    res.json(benchmarks);
  } catch (error) {
    console.error("Fetch All Error:", error);
    res.status(500).json({ error: "Error fetching records" });
  }
});

// FETCH BY YEAR
router.get("/year/:year", async (req, res) => {
  try {
    const benchmark = await Benchmark.findOne({ year: Number(req.params.year) });
    if (!benchmark) return res.status(404).json({ error: "Record not found" });
    res.json(benchmark);
  } catch (error) {
    console.error("Fetch By Year Error:", error);
    res.status(500).json({ error: "Error fetching record" });
  }
});

// UPDATE BY YEAR
router.put("/year/:year", async (req, res) => {
  try {
    const updated = await Benchmark.findOneAndUpdate(
      { year: Number(req.params.year) },
      { ...req.body, entryDateTime: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Record not found" });
    res.json(updated);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Error updating record" });
  }
});

// DELETE BY YEAR
router.delete("/year/:year", async (req, res) => {
  try {
    const deleted = await Benchmark.findOneAndDelete({ year: Number(req.params.year) });
    if (!deleted) return res.status(404).json({ error: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Error deleting record" });
  }
});

module.exports = router;