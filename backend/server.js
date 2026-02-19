const express = require("express");
// const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
// app.use(cors()); // enable if frontend is on a different origin/port

// test route
app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "Backend is running" });
});

app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
