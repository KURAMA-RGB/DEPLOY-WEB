const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BASE = path.join(__dirname, "projects");
if (!fs.existsSync(BASE)) fs.mkdirSync(BASE);

// --------------------
// HEALTH
// --------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok", engine: "NEBULA" });
});

// --------------------
// CREATE PROJECT
// --------------------
app.post("/project", (req, res) => {
  const { userId, name } = req.body;
  const dir = path.join(BASE, userId, name);
  fs.mkdirSync(dir, { recursive: true });
  res.json({ success: true, path: dir });
});

// --------------------
// WRITE FILE
// --------------------
app.post("/file", (req, res) => {
  const { userId, project, file, content } = req.body;
  const p = path.join(BASE, userId, project, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  res.json({ success: true });
});

// --------------------
// TERMINAL
// --------------------
app.post("/terminal", (req, res) => {
  const { userId, project, cmd } = req.body;
  const cwd = path.join(BASE, userId, project);

  exec(cmd, { cwd }, (err, stdout, stderr) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, stdout, stderr });
  });
});

// --------------------
// DEPLOY (PM2)
// --------------------
app.post("/deploy", (req, res) => {
  const { userId, project, start } = req.body;
  const cwd = path.join(BASE, userId, project);

  exec(`pm2 start ${start} --name ${userId}-${project}`, { cwd }, (err) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// --------------------
// LOGS
// --------------------
app.get("/logs/:name", (req, res) => {
  exec(`pm2 logs ${req.params.name} --lines 100`, (err, stdout) => {
    if (err) return res.json({ error: err.message });
    res.send(stdout);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("NEBULA ENGINE RUNNING ON", PORT));
