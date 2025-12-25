const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const dockerManager = require("./dockerManager");   // ← YE ADD KARNA THA

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "NEBULA Engine Running 🚀" });
});

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TERMINAL (Real server terminal)
app.post("/terminal", (req, res) => {
  const { cmd } = req.body;

  exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
    if (err) {
      return res.json({
        success: false,
        error: stderr || err.message
      });
    }

    res.json({
      success: true,
      stdout,
      stderr
    });
  });
});

// RUN DOCKER BOT / APP
app.post("/run", async (req, res) => {
  const { image, command } = req.body;
  const id = Date.now().toString();

  try {
    const result = await dockerManager.runContainer(id, image, command);
    res.json(result);
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// FETCH LOGS
app.get("/logs/:id", async (req, res) => {
  try {
    const logs = await dockerManager.getLogs(req.params.id);
    res.json({ success: true, logs });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("NEBULA ENGINE running on port", PORT);
});
