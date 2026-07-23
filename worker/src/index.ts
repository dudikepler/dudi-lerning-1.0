import express from "express";
import { env } from "./env.js";
import { startConnection, stopConnection, resumeExistingConnections } from "./whatsapp.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (req.path === "/health") return next();
  if (req.header("x-api-key") !== env.workerApiKey) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/connections/:id/start", async (req, res) => {
  try {
    await startConnection(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "unknown error" });
  }
});

app.post("/connections/:id/stop", (req, res) => {
  stopConnection(req.params.id);
  res.json({ ok: true });
});

app.listen(env.port, () => {
  console.log(`wa-status-worker listening on :${env.port}`);
});

resumeExistingConnections().catch((err) => {
  console.error("failed to resume existing connections", err);
});
