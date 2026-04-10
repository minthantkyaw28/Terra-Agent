import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * GISAnalystAgent performs deep geospatial analysis.
 * It extracts features like roads, deforestation contours, and bare soil polygons.
 */
export class GISAnalystAgent extends BaseAgent {
  constructor() {
    super('gis_analyst', 'GISAnalystAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('GIS Analyst Agent ready for deep spatial analysis.');
    
    // Subscribe to temporal enriched tasks from the Memory Agent
    bus.subscribe('temporal_enriched_task', (task) => this.handleGISAnalysis(task));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('GIS Analyst Agent stopped.');
  }

  private async handleGISAnalysis(task: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Performing deep GIS analysis for cell: ${task.cell_id}`);

    try {
      // 1. Simulate heavy GIS processing (Rasterio/GeoPandas logic)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      // 2. Mock feature extraction
      const features = [];
      if (task.anomaly_score > 0.6) features.push('bare_soil_polygons');
      if (task.temporal.loss_rate > 0.15) features.push('deforestation_contours');
      if (Math.random() > 0.7) features.push('linear_road_cuts');
      if (Math.random() > 0.8) features.push('water_turbidity_anomalies');

      this.log(`GIS Analysis complete for ${task.cell_id}. Extracted: ${features.join(', ') || 'None'}`);

      // 3. Generate mock GeoJSON for the frontend
      const mockGeoJSON = {
        type: 'FeatureCollection',
        features: features.map(f => ({
          type: 'Feature',
          properties: { type: f },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [task.bbox[1], task.bbox[0]],
              [task.bbox[3], task.bbox[0]],
              [task.bbox[3], task.bbox[2]],
              [task.bbox[1], task.bbox[2]],
              [task.bbox[1], task.bbox[0]]
            ]]
          }
        }))
      };

      // 4. Publish enriched analysis for the Vision Agent
      bus.publish('analysis_completed', {
        ...task,
        gis: {
          extracted_features: features,
          geojson: mockGeoJSON,
          turbidity_index: Math.random() * 0.5
        }
      });

    } catch (error) {
      this.log(`GIS Analysis failed for ${task.cell_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}

export const gisAnalystAgent = new GISAnalystAgent();
