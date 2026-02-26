const express = require("express");
const router = express.Router();
const Benchmark = require("../models/Benchmark");

router.post("/", async (req, res) => {
  try {
    const benchmark = new Benchmark(req.body);
    await benchmark.save();
    res.status(201).json({ message: "Saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving data" });
  }
});

module.exports = router;