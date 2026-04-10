# Dataset Notes

## Sentinel-2 Bands
- **B04 (Red):** 665nm
- **B08 (NIR):** 842nm
- **B11 (SWIR):** 1610nm (for Bare Soil Index)

## Mock Data Format
```json
{
  "ndvi": 0.45,
  "nbr": -0.12,
  "bsi": 0.35,
  "anomaly_score": 0.78,
  "timestamp": "2026-04-10T15:00:00Z"
}
```

## Feature Classification (VisionAgent Mock)
- `bare_soil`: High confidence (0.92)
- `tailings_pond`: Medium confidence (0.65)
- `road_cut`: High confidence (0.88)
