import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * VisionAgent runs ML inference on change-detected patches.
 * It classifies specific mining features like tailings ponds and open pits.
 */
export class VisionAgent extends BaseAgent {
  constructor() {
    super('vision', 'VisionAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Vision Agent ready for ML inference.');
    
    // Subscribe to analysis completed tasks from the GIS Analyst
    bus.subscribe('analysis_completed', (task) => this.handleVisionInference(task));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Vision Agent stopped.');
  }

  private async handleVisionInference(task: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Running ML inference (Prithvi-EO-2.0) for cell: ${task.cell_id}`);

    try {
      // 1. Simulate ML model loading and inference time
      await new Promise(resolve => setTimeout(resolve, 2500 + Math.random() * 1500));

      // 2. Mock classification results based on anomaly score and GIS features
      const classifications = [];
      
      if (task.gis.extracted_features.includes('bare_soil_polygons')) {
        classifications.push({
          type: 'open_pit',
          confidence: 0.85 + Math.random() * 0.1,
          bbox: task.bbox
        });
      }

      if (task.gis.extracted_features.includes('water_turbidity_anomalies')) {
        classifications.push({
          type: 'tailings_pond',
          confidence: 0.75 + Math.random() * 0.15,
          bbox: task.bbox
        });
      }

      if (task.gis.extracted_features.includes('linear_road_cuts')) {
        classifications.push({
          type: 'road_cut',
          confidence: 0.92 + Math.random() * 0.05,
          bbox: task.bbox
        });
      }

      if (task.temporal.loss_rate > 0.2) {
        classifications.push({
          type: 'deforestation',
          confidence: 0.95,
          bbox: task.bbox
        });
      }

      this.log(`ML Inference complete for ${task.cell_id}. Detected: ${classifications.map(c => c.type).join(', ') || 'None'}`);

      // 3. Publish vision findings for the Reasoner Agent
      bus.publish('vision_findings', {
        ...task,
        vision: {
          classifications,
          model_version: 'Prithvi-EO-2.0-v1.2',
          inference_time_ms: 3200
        }
      });

    } catch (error) {
      this.log(`Vision inference failed for ${task.cell_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}

export const visionAgent = new VisionAgent();
