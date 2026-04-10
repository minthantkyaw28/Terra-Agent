# API Contracts

## POST /api/fetch-satellite
- **Description:** Fetches metadata for the latest satellite imagery for a region.
- **Request Body:**
  ```json
  {
    "lat": number,
    "lon": number,
    "radius": number
  }
  ```
- **Response:**
  ```json
  {
    "tile_id": string,
    "date": string,
    "cloud_cover": number,
    "thumbnail_url": string
  }
  ```

## POST /api/analyze-region
- **Description:** Performs change detection and feature extraction.
- **Request Body:**
  ```json
  {
    "lat": number,
    "lon": number,
    "tile_id": string
  }
  ```
- **Response:**
  ```json
  {
    "ndvi_delta": number,
    "disturbance_detected": boolean,
    "features": string[],
    "ai_summary": string,
    "severity": number,
    "mining_type": string,
    "impact": string,
    "recommendations": string[]
  }
  ```

## POST /api/generate-report
- **Description:** Generates a full HTML/PDF report.
- **Response:** `{ "report_url": string }`

## POST /api/voice-summary
- **Description:** Generates a TTS summary of the findings.
- **Response:** `{ "audio_url": string }`
