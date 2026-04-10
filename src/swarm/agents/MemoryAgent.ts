import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * MemoryAgent acts as a temporal sentinel.
 * It stores historical baselines for grid cells and detects accelerating disturbance.
 */
export class MemoryAgent extends BaseAgent {
  // Simple in-memory store for historical baselines
  // In a production app, this would be SQLite or PostgreSQL
  private history: Record<string, { ndvi: number; timestamp: string }[]> = {};

  constructor() {
    super('memory', 'MemoryAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Memory Agent ready for temporal analysis.');
    
    // Subscribe to priority tasks from the Queue
    bus.subscribe('priority_task', (task) => this.handleTemporalAnalysis(task));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Memory Agent stopped.');
  }

  private async handleTemporalAnalysis(task: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Analyzing temporal change for cell: ${task.cell_id}`);

    try {
      const cellId = task.cell_id;
      const currentNdvi = task.spectral.ndvi;

      // 1. Retrieve historical baseline
      const cellHistory = this.history[cellId] || [];
      
      // 2. Calculate delta if history exists
      let vegetationLossRate = 0;
      let historicalBaseline = currentNdvi + 0.15; // Mock a healthier past if no history

      if (cellHistory.length > 0) {
        const lastScan = cellHistory[cellHistory.length - 1];
        historicalBaseline = lastScan.ndvi;
        vegetationLossRate = (historicalBaseline - currentNdvi) / historicalBaseline;
      }

      const temporalDelta = historicalBaseline - currentNdvi;
      this.log(`Temporal analysis for ${cellId}: Delta=${temporalDelta.toFixed(3)}, Loss Rate=${(vegetationLossRate * 100).toFixed(1)}%`);

      // 3. Update history
      if (!this.history[cellId]) this.history[cellId] = [];
      this.history[cellId].push({
        ndvi: currentNdvi,
        timestamp: new Date().toISOString()
      });

      // Keep only last 5 scans to prevent memory leak in MVP
      if (this.history[cellId].length > 5) this.history[cellId].shift();

      // 4. Enrich task and publish for GIS analysis
      bus.publish('temporal_enriched_task', {
        ...task,
        temporal: {
          historical_baseline: historicalBaseline,
          delta: temporalDelta,
          loss_rate: vegetationLossRate,
          is_accelerating: vegetationLossRate > 0.1 // Flag if >10% loss
        }
      });

    } catch (error) {
      this.log(`Temporal analysis failed for ${task.cell_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}

export const memoryAgent = new MemoryAgent();
