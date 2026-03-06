const express = require("express");
const router = express.Router();
const Benchmark = require("../models/Benchmarkmod");
const auth = require("../middleware/auth");

const REQUIRED_FIELDS = ["SCHOOL_ID", "SCHOOL_YR_ID", "GRADE_DEF_ID"];
const OPTIONAL_FIELDS = [
  "CAPACITY_ENROLL",
  "CONTRACTED_ENROLL_BOYS",
  "CONTRACTED_ENROLL_GIRLS",
  "CONTRACTED_ENROLL_NB",
  "COMPLETED_APPLICATION_TOTAL",
  "ACCEPTANCES_TOTAL",
  "NEW_ENROLLMENTS_TOTAL",
];

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

// post
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const payload = {};

    for (const field of REQUIRED_FIELDS) {
      const parsed = parseNumber(req.body[field]);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return res.status(400).json({ error: `${field} is required and must be a non-negative number` });
      }
      payload[field] = parsed;
    }

    for (const field of OPTIONAL_FIELDS) {
      const parsed = parseNumber(req.body[field]);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ error: `${field} must be a valid number` });
      }
      if (parsed !== null && parsed < 0) {
        return res.status(400).json({ error: `${field} cannot be negative` });
      }
      payload[field] = parsed;
    }

    payload.COMPLETED_APPLICATION_TOTAL = payload.COMPLETED_APPLICATION_TOTAL ?? 0;
    payload.ACCEPTANCES_TOTAL = payload.ACCEPTANCES_TOTAL ?? 0;
    payload.NEW_ENROLLMENTS_TOTAL = payload.NEW_ENROLLMENTS_TOTAL ?? 0;

    if (payload.ACCEPTANCES_TOTAL > payload.COMPLETED_APPLICATION_TOTAL) {
      return res.status(400).json({ error: "ACCEPTANCES_TOTAL cannot exceed COMPLETED_APPLICATION_TOTAL" });
    }

    if (payload.NEW_ENROLLMENTS_TOTAL > payload.ACCEPTANCES_TOTAL) {
      return res.status(400).json({ error: "NEW_ENROLLMENTS_TOTAL cannot exceed ACCEPTANCES_TOTAL" });
    }

    console.log(payload);

    const benchmark = new Benchmark(payload);
    await benchmark.save();
    res.status(201).json({ message: "Saved successfully", benchmark });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    if (error?.code === 11000) {
      return res.status(409).json({
        error: "Duplicate key conflict while saving benchmark data. Please verify unique index configuration and retry.",
        detail: error?.keyValue || null,
      });
    }
    res.status(500).json({ error: "Error saving data" });
  }
});

// get all
router.get("/", auth, async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 0;
    const benchmarks = limit > 0
      ? await Benchmark.find().limit(limit)
      : await Benchmark.find();
    res.json(benchmarks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch benchmarks" });
  }
});

// get by school year id
router.get("/year/:yearId", auth, async (req, res) => {
  try {
    const year = Number(req.params.yearId);
    const benchmark = await Benchmark.findOne({ SCHOOL_YR_ID: year });
    if (!benchmark) return res.status(404).json({ error: "Record not found" });
    res.json(benchmark);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch benchmark" });
  }
});

// update
router.put("/year/:yearId", auth, async (req, res) => {
  try {
    const yearId = Number(req.params.yearId);
    const benchmark = await Benchmark.findOneAndUpdate(
      { SCHOOL_YR_ID: yearId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!benchmark) return res.status(404).json({ error: "Record not found" });
    res.json({ message: "Updated successfully", benchmark });
  } catch (err) {
    res.status(500).json({ error: "Failed to update benchmark" });
  }
});

// delete
router.delete("/year/:yearId", auth, async (req, res) => {
  try {
    const yearId = Number(req.params.yearId);
    const benchmark = await Benchmark.findOneAndDelete({ SCHOOL_YR_ID: yearId });
    if (!benchmark) return res.status(404).json({ error: "Record not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete benchmark" });
  }
});

module.exports = router;