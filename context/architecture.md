# TerraSentinel Swarm Architecture

## System Overview
TerraSentinel is an autonomous multi-agent swarm designed for global illegal mining detection. It uses a decoupled, event-driven architecture where specialized agents collaborate to scan, analyze, and report findings.

## Swarm Agents

### 1. OrchestratorAgent (The Brain)
- **Responsibility:** Mission planning, grid division, task dispatching, and health monitoring.
- **Model:** Gemini 2.5 Pro.
- **Communication:** Dispatches `scan_task` to ScoutAgents.

### 2. ScoutAgent (The Sensor)
- **Responsibility:** Parallel grid scanning, spectral index calculation (NDVI, NBR), and anomaly detection.
- **Communication:** Emits `candidate_region` events.

### 3. PriorityQueueAgent (The Triage)
- **Responsibility:** Ranking candidates by risk and velocity.
- **Communication:** Dispatches `priority_task` to GISAnalystAgent.

### 4. MemoryAgent (The Historian)
- **Responsibility:** Temporal change detection using historical baselines.
- **Communication:** Enriches tasks with `change_delta`.

### 5. GISAnalystAgent (The Processor)
- **Responsibility:** Deep geospatial analysis (road extraction, deforestation contours).
- **Communication:** Emits `enriched_analysis`.

### 6. VisionAgent (The Eye)
- **Responsibility:** ML inference for feature classification (tailings ponds, open pits).
- **Communication:** Emits `vision_findings`.

### 7. ReasonerAgent (The Intelligence)
- **Responsibility:** Multi-modal reasoning on full context.
- **Model:** Gemini 2.5 Pro / Flash.
- **Communication:** Emits `verdict`.

### 8. JudgeAgent (The Authority)
- **Responsibility:** Final verification and escalation trigger.
- **Communication:** Triggers `confirmed_finding`.

### 9. ReporterAgent (The Scribe)
- **Responsibility:** HTML report generation and webhook notification.

### 10. VoiceAgent (The Briefing)
- **Responsibility:** TTS field briefings.

## Communication Bus
- **Mechanism:** Redis Pub/Sub (simulated via EventEmitter in Node for this MVP).
- **Pattern:** Asynchronous event-driven flow.
