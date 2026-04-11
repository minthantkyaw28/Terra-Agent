/**
 * Sentinel Imagery Library
 * Handles STAC API searching and TiTiler STAC tile generation
 */

export type BBox = [number, number, number, number];

export type SceneResult = {
  itemId: string;
  itemUrl: string;
  date: string;
  cloudCover: number;
  thumbnailUrl: string;
  bounds: BBox;
  minZoom: number;
  maxZoom: number;
  center: [number, number, number];  // [lon, lat, zoom]
};

export interface TargetConfig {
  label: string;
  itemId: string;
  itemUrl: string;
  date: string;
  cloudCover: number;
  bounds: BBox;
  focusLat: number;
  focusLon: number;
  defaultZoom: number;
  thumbnailUrl: string;
}

export const TARGETS: Record<string, TargetConfig> = {
  amazon: {
    label:       'Amazon — La Pampa, Peru',
    itemId:      'S2C_19LCF_20260405_0_L2A',
    itemUrl:     'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2C_19LCF_20260405_0_L2A',
    date:        '2026-04-05',
    cloudCover:  7.9,
    focusLat:    -12.95,
    focusLon:    -70.05,
    bounds:      [-70.12, -13.66, -69.83, -12.66],
    defaultZoom: 13,
    thumbnailUrl:'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/19/L/CF/2026/4/S2C_19LCF_20260405_0_L2A/preview.jpg',
  },

  congo: {
    label:       'Rubaya Coltan Mines, DRC',
    itemId:      'S2C_35MPU_20251023_0_L2A',
    itemUrl:     'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2C_35MPU_20251023_0_L2A',
    date:        '2025-10-23',
    cloudCover:  7.2,
    bounds:      [28.2, -1.9, 28.89, -0.9],
    focusLat:    -1.558,
    focusLon:    28.884,
    defaultZoom: 13,
    thumbnailUrl:'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/35/M/PU/2025/10/S2C_35MPU_20251023_0_L2A/preview.jpg',
  },

  borneo: {
    label:       'Sintang Gold Mines, West Kalimantan',
    itemId:      'S2A_49NEB_20260315_0_L2A',
    itemUrl:     'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_49NEB_20260315_0_L2A',
    date:        '2026-03-15',
    cloudCover:  16.0,
    bounds:      [111.0, 0.816, 111.987, 1.81],
    focusLat:    1.0,
    focusLon:    111.93,
    defaultZoom: 13,
    thumbnailUrl:'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/49/N/EB/2026/3/S2A_49NEB_20260315_0_L2A/preview.jpg',
  },
};

/**
 * Fetches the best (lowest cloud) Sentinel-2 scene for a given BBox
 * and retrieves metadata.
 */
export async function fetchBestScene(
  bbox: BBox,
  fallback: TargetConfig,
  maxCloud = 40
): Promise<SceneResult> {
  try {
    const stacUrl = `https://earth-search.aws.element84.com/v1/search?collections=sentinel-2-l2a&bbox=${bbox.join(',')}&limit=50`;
    
    const response = await fetch(stacUrl);
    if (!response.ok) return { ...fallback, minZoom: 8, maxZoom: 14, center: [fallback.focusLon, fallback.focusLat, fallback.defaultZoom] };

    const data = await response.json();
    if (!data.features || data.features.length === 0) return { ...fallback, minZoom: 8, maxZoom: 14, center: [fallback.focusLon, fallback.focusLat, fallback.defaultZoom] };

    const features = data.features.filter((f: any) => 
      f.properties['eo:cloud_cover'] !== undefined && 
      f.properties['eo:cloud_cover'] <= maxCloud
    );

    if (features.length === 0) return { ...fallback, minZoom: 8, maxZoom: 14, center: [fallback.focusLon, fallback.focusLat, fallback.defaultZoom] };

    features.sort((a: any, b: any) => a.properties['eo:cloud_cover'] - b.properties['eo:cloud_cover']);
    
    const bestFeature = features[0];
    const itemUrl = bestFeature.links.find((l: any) => l.rel === 'self')?.href || `https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/${bestFeature.id}`;

    return {
      itemId: bestFeature.id,
      itemUrl,
      date: bestFeature.properties.datetime.split('T')[0],
      cloudCover: bestFeature.properties['eo:cloud_cover'],
      thumbnailUrl: bestFeature.assets.thumbnail.href,
      bounds: bestFeature.bbox as BBox,
      minZoom: 8,
      maxZoom: 14,
      center: [bestFeature.bbox[0] + (bestFeature.bbox[2] - bestFeature.bbox[0])/2, bestFeature.bbox[1] + (bestFeature.bbox[3] - bestFeature.bbox[1])/2, 12],
    };
  } catch (error) {
    console.error('fetchBestScene error:', error);
    return { ...fallback, minZoom: 8, maxZoom: 14, center: [fallback.focusLon, fallback.focusLat, fallback.defaultZoom] };
  }
}
