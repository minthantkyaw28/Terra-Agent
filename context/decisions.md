# Design Decisions

## 1. Backend Framework: Express.js instead of FastAPI
- **Reason:** The current environment is optimized for Node.js. To ensure stability and port 3000 accessibility, Express.js is used.
- **Impact:** API contracts remain identical to the requested FastAPI structure.

## 2. ML Implementation: Simulated/Mocked
- **Reason:** Real-time GIS processing (Rasterio/GeoPandas) requires specific system dependencies and heavy compute.
- **Impact:** We will simulate realistic NDVI and change detection outputs to focus on the "Intelligence OS" experience and Gemini reasoning.

## 3. Map Engine: React Leaflet
- **Reason:** Industry standard for React-based GIS applications.
- **Impact:** Allows for easy overlay of GeoJSON and disturbance masks.

## 4. UI Aesthetic: Technical Dashboard (Recipe 1)
- **Reason:** Fits the "Mission Control" vibe of a geospatial intelligence platform.
- **Impact:** Uses visible grids, monospace fonts, and high-contrast dark theme.
