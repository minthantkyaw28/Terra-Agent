# TerraAgent Architecture

## System Overview
TerraAgent is an Earth Intelligence OS designed to detect illegal mining using satellite imagery and AI.

## Components

### 1. Frontend (Next.js / React)
- **Framework:** Next.js (using Vite/React in this environment as a high-fidelity proxy).
- **Map Engine:** React Leaflet for geospatial visualization.
- **UI Library:** Tailwind CSS + Framer Motion for premium animations.
- **State Management:** React Context/Hooks.

### 2. Backend (Express.js)
- **Runtime:** Node.js.
- **API:** RESTful endpoints for satellite data fetching, analysis, and reporting.
- **Integration:** Gemini API for reasoning and insights.

### 3. ML Pipeline (Simulated)
- **Data Source:** Sentinel-2 (STAC API).
- **Processing:** NDVI Calculation, Change Detection, Feature Extraction.
- **Implementation:** Mocked logic returning realistic geospatial JSON payloads.

### 4. AI Reasoning (Gemini)
- **Model:** Gemini 3.1 Pro for deep reasoning.
- **Tasks:** Illegal mining detection, severity scoring, impact assessment.

## Data Flow
1. User selects region on Map.
2. Frontend sends coordinates to Backend.
3. Backend triggers ML Pipeline (Mocked) to get disturbance data.
4. Backend sends ML data + context to Gemini.
5. Gemini returns structured insights.
6. Frontend renders insights and overlays on Map.
