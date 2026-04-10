import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MissionConfig {
  region: string;
  resolution: number; // in km
  threshold: number; // 0-1
}

export interface GridCell {
  id: string;
  bbox: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
  priority: number;
}

/**
 * OrchestratorAgent is the Global Brain of the swarm.
 * It divides a mission region into grid cells and dispatches tasks to ScoutAgents.
 */
export class OrchestratorAgent extends BaseAgent {
  private activeMission: MissionConfig | null = null;

  constructor() {
    super('orchestrator', 'OrchestratorAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Orchestrator ready for mission dispatch.');
  }

  public stop() {
    this.activeMission = null;
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Orchestrator stopped.');
  }

  /**
   * Launch a new mission.
   */
  public async launchMission(config: MissionConfig) {
    this.activeMission = config;
    this.setStatus(AgentStatus.BUSY);
    this.log(`Launching mission for region: ${config.region}`);

    try {
      // 1. Use Gemini to reason about the region and identify high-risk zones
      const gridCells = await this.planMission(config);
      
      this.log(`Mission planned. Dispatched ${gridCells.length} grid cells to the swarm.`);
      
      // 2. Dispatch tasks to the bus
      for (const cell of gridCells) {
        bus.publish('scan_task', {
          cell_id: cell.id,
          bbox: cell.bbox,
          priority: cell.priority,
          mission_id: Date.now().toString()
        });
      }

      bus.publish('mission_started', {
        region: config.region,
        cell_count: gridCells.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.log(`Mission launch failed: ${error}`);
      this.setStatus(AgentStatus.ERROR);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }

  /**
   * Divide the region into grid cells.
   * In a real system, this would use complex GIS logic and Gemini reasoning.
   */
  private async planMission(config: MissionConfig): Promise<GridCell[]> {
    this.log('Analyzing region risk factors with Gemini...');

    // Mocking the geometric bounds for the region for now
    // In a real app, we'd use a Geocoding API or Gemini to get the BBOX
    const baseBBox: [number, number, number, number] = [-4.0, -63.0, -3.0, -62.0]; // Amazon example
    
    const cells: GridCell[] = [];
    const step = 0.2; // roughly 20km

    for (let lat = baseBBox[0]; lat < baseBBox[2]; lat += step) {
      for (let lon = baseBBox[1]; lon < baseBBox[3]; lon += step) {
        const id = `cell_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        cells.push({
          id,
          bbox: [lat, lon, lat + step, lon + step],
          priority: Math.random() // In reality, Gemini would assign this
        });
      }
    }

    // Simulate Gemini reasoning delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return cells;
  }
}

export const orchestrator = new OrchestratorAgent();
