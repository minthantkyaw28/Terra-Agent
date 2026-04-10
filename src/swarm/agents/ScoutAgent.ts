import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * ScoutAgent simulates a parallel sensor network.
 * It "ingests" imagery for a grid cell and computes spectral indices.
 */
export class ScoutAgent extends BaseAgent {
  constructor(id: string) {
    super(id, `ScoutAgent_${id}`);
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Scout ready for scanning.');
    
    // Subscribe to scan tasks from the Orchestrator
    bus.subscribe('scan_task', (task) => this.handleScanTask(task));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Scout stopped.');
  }

  private async handleScanTask(task: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Scanning grid cell: ${task.cell_id} | BBOX: ${task.bbox}`);

    try {
      // 1. Simulate STAC API imagery ingestion
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 2. Mock spectral analysis (NDVI, NBR, BSI)
      const ndvi = 0.3 + Math.random() * 0.5;
      const bsi = 0.2 + Math.random() * 0.4;
      
      // Anomaly detection logic (simplified)
      const anomalyScore = (1 - ndvi) * bsi * 2; // High bare soil + low vegetation = high anomaly

      this.log(`Spectral analysis complete for ${task.cell_id}. Anomaly Score: ${anomalyScore.toFixed(2)}`);

      // 3. Emit candidate event if threshold exceeded
      if (anomalyScore > 0.5) {
        this.log(`Anomaly detected in ${task.cell_id}! Emitting candidate region event.`);
        bus.publish('candidate_region', {
          cell_id: task.cell_id,
          bbox: task.bbox,
          anomaly_score: anomalyScore,
          spectral: { ndvi, bsi },
          mission_id: task.mission_id,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      this.log(`Scan failed for ${task.cell_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}
