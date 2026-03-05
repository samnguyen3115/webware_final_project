const express = require("express");
const router = express.Router();
const Benchmark = require("../models/AdmissionActivity");
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

    const lastRecord = await Benchmark
      .findOne()
      .sort({ ID: -1 })
      .select("ID");

    payload.ID = lastRecord ? +lastRecord.ID + 1 : 1;

    console.log(payload)

    const benchmark = new Benchmark(payload);
    await benchmark.save();
    res.status(201).json({ message: "Saved successfully", benchmark });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error saving data" });
  }
});

module.exports = router;