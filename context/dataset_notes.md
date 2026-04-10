# Dataset Notes

## Sentinel-2
- **Bands:** B04 (Red), B08 (NIR) for NDVI.
- **Resolution:** 10m.
- **Frequency:** 5 days.

## Disturbance Indicators
- **Bare Soil:** High reflectance in SWIR, low in NIR.
- **Water Turbidity:** Increased sediment in nearby rivers.
- **Road Networks:** Linear clearings in dense forest.

## Mock Logic
- If `lat` is in a known mining region (e.g., Amazon Basin, Ghana), return high disturbance.
- Randomize `ndvi_delta` between 0.2 and 0.6 for "detected" areas.
