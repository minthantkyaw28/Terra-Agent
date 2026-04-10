# API Contracts (FastAPI/Express Simulation)

## Mission Management
- `POST /mission/launch`: Starts a new global swarm mission.
- `POST /mission/stop`: Halts all active agents.

## Swarm Status
- `GET /swarm/status`: Returns the current state of all 10 agents and their task queues.
- `GET /swarm/findings`: Paginated list of confirmed illegal mining operations.
- `GET /findings/{id}`: Detailed JSON and report link for a specific finding.

## Agent Control
- `POST /agent/scout/dispatch`: Manually trigger a scout scan for a specific BBOX.
- `GET /agent/{id}/logs`: SSE stream of real-time agent logs.

## Analysis & Reporting
- `POST /analyze/region`: One-shot analysis for a specific coordinate.
- `POST /report/generate`: Manually trigger report generation for a finding.
- `POST /voice/briefing`: Generate and return a TTS audio URL for a finding.
