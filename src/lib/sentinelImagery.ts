/**
 * Sentinel Imagery Library
 * Handles STAC API searching and TiTiler COG tile generation
 */

export type BBox = [number, number, number, number];

export type SceneResult = {
  itemId: string;
  date: string;
  cloudCover: number;
  thumbnailUrl: string;
  cogUrl: string;
  tileUrl: string;      // titiler tile template
  bounds: BBox;         // from tilejson
  minZoom: number;
  maxZoom: number;
  center: [number, number, number];  // [lon, lat, zoom]
};

/**
 * Fetches the best (lowest cloud) Sentinel-2 scene for a given BBox
 * and retrieves the TileJSON from TiTiler for COG rendering.
 */
export async function fetchBestScene(
  bbox: BBox,
  fallback: SceneResult,
  maxCloud = 40
): Promise<SceneResult> {
  try {
    // 1. Search Earth Search STAC API
    const stacUrl = `https://earth-search.aws.element84.com/v1/search?collections=sentinel-2-l2a&bbox=${bbox.join(',')}&limit=50`;
    
    const response = await fetch(stacUrl);
    if (!response.ok) {
      console.warn('STAC API fetch failed, using fallback');
      return fallback;
    }

    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      console.warn('No scenes found in STAC search, using fallback');
      return fallback;
    }

    // 2. Filter by cloud cover and sort
    const features = data.features.filter((f: any) => 
      f.properties['eo:cloud_cover'] !== undefined && 
      f.properties['eo:cloud_cover'] <= maxCloud
    );

    if (features.length === 0) {
      console.warn('No low-cloud scenes found, using fallback');
      return fallback;
    }

    // Sort by cloud cover ascending
    features.sort((a: any, b: any) => a.properties['eo:cloud_cover'] - b.properties['eo:cloud_cover']);
    
    const bestFeature = features[0];
    const cogUrl = bestFeature.assets.visual.href;
    const thumbnailUrl = bestFeature.assets.thumbnail.href;
    const date = bestFeature.properties.datetime.split('T')[0];
    const cloudCover = bestFeature.properties['eo:cloud_cover'];
    const itemId = bestFeature.id;

    // 3. Get TileJSON from TiTiler
    const encodedCogUrl = encodeURIComponent(cogUrl);
    const tileJsonUrl = `https://titiler.xyz/cog/WebMercatorQuad/tilejson.json?url=${encodedCogUrl}`;

    try {
      const tjResponse = await fetch(tileJsonUrl);
      if (!tjResponse.ok) {
        throw new Error('TiTiler TileJSON fetch failed');
      }

      const tileJson = await tjResponse.json();

      return {
        itemId,
        date,
        cloudCover,
        thumbnailUrl,
        cogUrl,
        tileUrl: tileJson.tiles[0],
        bounds: tileJson.bounds,
        minZoom: tileJson.minzoom,
        maxZoom: tileJson.maxzoom,
        center: tileJson.center,
      };
    } catch (tjError) {
      console.error('TiTiler error:', tjError);
      // Fallback with metadata but no tiles
      return {
        ...fallback,
        itemId,
        date,
        cloudCover,
        thumbnailUrl,
        cogUrl,
        tileUrl: '', // Signal tiles unavailable
      };
    }
  } catch (error) {
    console.error('fetchBestScene error:', error);
    return fallback;
  }
}
