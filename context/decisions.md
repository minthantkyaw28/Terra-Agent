# Design Decisions

## 1. Event-Driven Architecture
- **Decision:** Use a message bus for inter-agent communication.
- **Reason:** Allows agents to run in parallel, scale independently, and ensures the system is non-blocking.

## 2. Backend Implementation: Node.js/Express
- **Decision:** Implement the "FastAPI" logic using Node.js.
- **Reason:** Optimized for the current sandboxed environment while maintaining identical API contracts.

## 3. State Management: In-Memory + SQLite
- **Decision:** Use an in-memory event emitter for the bus and SQLite for temporal memory.
- **Reason:** Low latency for a hackathon MVP, persistent enough for temporal analysis.

## 4. ML Mocking Strategy
- **Decision:** Mock Prithvi-EO-2.0 and STAC API outputs.
- **Reason:** Avoids external dependency bottlenecks and quota issues while demonstrating the full pipeline logic.

## 5. UI: Map-First Dashboard
- **Decision:** Fullscreen Leaflet map with real-time agent overlays.
- **Reason:** Provides immediate visual impact and clearly demonstrates the "Swarm" behavior.
