const express = require("express");
const router = express.Router();
const Benchmark = require("../models/Benchmark");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only"});
    }
    const benchmark = new Benchmark(req.body);
    await benchmark.save();
    res.status(201).json({ message: "Saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving data" });
  }
});

module.exports = router;