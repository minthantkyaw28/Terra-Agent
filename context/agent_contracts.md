# Agent Contracts

## OrchestratorAgent
- **Input:** `MissionConfig { region, resolution, threshold }`
- **Output:** `ScanTask { bbox, cell_id, priority }`
- **Event Emitted:** `mission_started`, `task_dispatched`

## ScoutAgent
- **Input:** `ScanTask`
- **Output:** `SpectralIndices { ndvi, nbr, bsi }`
- **Event Emitted:** `candidate_region { cell_id, anomaly_score, bbox }`

## PriorityQueueAgent
- **Input:** `candidate_region`
- **Output:** `PriorityTask`
- **Event Emitted:** `task_prioritized`

## MemoryAgent
- **Input:** `priority_task`
- **Output:** `TemporalDelta { ndvi_change, vegetation_loss_rate }`
- **Event Emitted:** `temporal_enriched_task`

## GISAnalystAgent
- **Input:** `temporal_enriched_task`
- **Output:** `GeoJSON { polygons, features }`
- **Event Emitted:** `analysis_completed`

## VisionAgent
- **Input:** `analysis_completed`
- **Output:** `Classifications { type, confidence, bbox }`
- **Event Emitted:** `vision_findings`

## ReasonerAgent
- **Input:** `vision_findings`
- **Output:** `VerdictJSON`
- **Event Emitted:** `verdict_generated`

## JudgeAgent
- **Input:** `verdict_generated`
- **Output:** `ConfirmedFinding`
- **Event Emitted:** `finding_confirmed`, `finding_rejected`

## ReporterAgent
- **Input:** `finding_confirmed`
- **Output:** `HTML Report`
- **Event Emitted:** `report_generated`

## VoiceAgent
- **Input:** `finding_confirmed`
- **Output:** `Audio Briefing URL`
- **Event Emitted:** `briefing_generated`
