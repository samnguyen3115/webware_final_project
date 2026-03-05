const express = require("express");
const router = express.Router();
const BenchmarkEmployee = require("../models/BenchmarkEmployee");
const auth = require("../middleware/auth");

const REQUIRED_FIELDS = ["SCHOOL_ID", "SCHOOL_YR_ID", "EMP_CAT_CD"];
const OPTIONAL_FIELDS = [
  "TOTAL_EMPLOYEES",
  "FT_EMPLOYEES",
  "SUBCONTRACT_FTE",
  "FTE_ONLY_SALARY_MIN",
  "FTE_ONLY_SALARY_MAX",
  "POC_EMPLOYEES",
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
      if (field === "EMP_CAT_CD") {
        if (!req.body[field] || String(req.body[field]).trim() === "") {
          return res.status(400).json({ error: `${field} is required` });
        }
        payload[field] = String(req.body[field]).trim();
      } else {
        const parsed = parseNumber(req.body[field]);
        if (!Number.isFinite(parsed) || parsed < 0) {
          return res.status(400).json({ error: `${field} is required and must be a non-negative number` });
        }
        payload[field] = parsed;
      }
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

    const benchmarkEmployee = new BenchmarkEmployee(payload);
    await benchmarkEmployee.save();
    res.status(201).json({ message: "Saved successfully", benchmarkEmployee });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error saving data" });
  }
});

module.exports = router;
