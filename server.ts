import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

import { bus } from "./src/swarm/EventBus";
import { orchestrator } from "./src/swarm/agents/OrchestratorAgent";
import { ScoutAgent } from "./src/swarm/agents/ScoutAgent";
import { priorityQueue } from "./src/swarm/agents/PriorityQueueAgent";
import { memoryAgent } from "./src/swarm/agents/MemoryAgent";
import { gisAnalystAgent } from "./src/swarm/agents/GISAnalystAgent";
import { visionAgent } from "./src/swarm/agents/VisionAgent";
import { reasonerAgent } from "./src/swarm/agents/ReasonerAgent";
import { judgeAgent } from "./src/swarm/agents/JudgeAgent";
import { reporterAgent } from "./src/swarm/agents/ReporterAgent";
import { voiceAgent } from "./src/swarm/agents/VoiceAgent";

// Initialize agents
const scouts = [
  new ScoutAgent('1'),
  new ScoutAgent('2'),
  new ScoutAgent('3')
];

orchestrator.start();
priorityQueue.start();
memoryAgent.start();
gisAnalystAgent.start();
visionAgent.start();
reasonerAgent.start();
judgeAgent.start();
reporterAgent.start();
voiceAgent.start();
scouts.forEach(s => s.start());

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- SWARM EVENT MONITORING ---
  const agentStatuses: Record<string, string> = {
    orchestrator: 'IDLE',
    priority_queue: 'IDLE',
    memory: 'IDLE',
    gis_analyst: 'IDLE',
    vision: 'IDLE',
    reasoner: 'IDLE',
    judge: 'IDLE',
    reporter: 'IDLE',
    voice: 'IDLE',
    scout_1: 'IDLE',
    scout_2: 'IDLE',
    scout_3: 'IDLE'
  };

  const findings: any[] = [];

  bus.subscribe('agent_status_change', (data) => {
    agentStatuses[data.agentId] = data.status;
  });

  bus.subscribe('report_generated', (report) => {
    findings.push(report);
    console.log(`[SERVER] New finding stored: ${report.finding_id}`);
  });

  // --- API ROUTES ---

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "TerraSentinel Swarm OS",
      swarm_bus: "active"
    });
  });

  app.get("/api/swarm/status", (req, res) => {
    res.json({
      agents: agentStatuses,
      mission: {
        active: agentStatuses['orchestrator'] === 'BUSY',
        timestamp: new Date().toISOString()
      }
    });
  });

  app.get("/api/swarm/findings", (req, res) => {
    res.json(findings);
  });

  app.get("/api/findings/:id", (req, res) => {
    const finding = findings.find(f => f.finding_id === req.params.id);
    if (!finding) return res.status(404).json({ error: "Finding not found" });
    res.json(finding);
  });

  app.post("/api/mission/launch", async (req, res) => {
    const { region, resolution, threshold } = req.body;
    
    // Fire and forget mission launch
    orchestrator.launchMission({ region, resolution, threshold });
    
    res.json({ 
      status: "mission_dispatched",
      region,
      message: "Orchestrator is planning the swarm mission."
    });
  });

  app.post("/api/mission/stop", (req, res) => {
    orchestrator.stop();
    orchestrator.start(); // Reset to idle
    res.json({ status: "mission_halted" });
  });

  app.post("/api/fetch-satellite", (req, res) => {
    const { lat, lon, radius } = req.body;
    console.log(`Fetching satellite data for: ${lat}, ${lon} (radius: ${radius})`);
    
    // Mock response
    res.json({
      tile_id: `S2A_MSIL2A_20240410_${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
      cloud_cover: Math.random() * 10,
      thumbnail_url: `https://picsum.photos/seed/${lat}${lon}/400/400`
    });
  });

  app.post("/api/analyze-region", (req, res) => {
    const { lat, lon, tile_id } = req.body;
    console.log(`Analyzing region: ${lat}, ${lon} (tile: ${tile_id})`);

    // Mock ML output
    const disturbance_detected = Math.random() > 0.5;
    res.json({
      ndvi_delta: disturbance_detected ? 0.3 + Math.random() * 0.4 : 0.05 + Math.random() * 0.1,
      disturbance_detected,
      features: disturbance_detected ? ["bare_soil", "deforestation", "new_road"] : ["dense_vegetation"],
      ai_summary: "Analysis pending Gemini reasoning integration...",
      severity: disturbance_detected ? Math.floor(Math.random() * 10) + 1 : 0,
      mining_type: disturbance_detected ? "Alluvial / Open-pit" : "None",
      impact: disturbance_detected ? "Significant forest loss and river sedimentation detected." : "Stable ecosystem.",
      recommendations: disturbance_detected ? ["Deploy ground patrol", "Satellite monitoring escalation"] : ["Routine monitoring"]
    });
  });

  app.post("/api/generate-report", (req, res) => {
    res.json({ report_url: "https://example.com/reports/terra-agent-001.pdf" });
  });

  app.post("/api/voice-summary", (req, res) => {
    res.json({ audio_url: "https://example.com/audio/summary.mp3" });
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 TerraAgent Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
