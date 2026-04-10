import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "TerraAgent Backend" });
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
