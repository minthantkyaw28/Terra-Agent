import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * ReasonerAgent is the Intelligence Core of the swarm.
 * It receives full context from all previous agents and uses Gemini to reason about illegal mining.
 */
export class ReasonerAgent extends BaseAgent {
  constructor() {
    super('reasoner', 'ReasonerAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Reasoner Agent ready for deep intelligence analysis.');
    
    // Subscribe to vision findings from the Vision Agent
    bus.subscribe('vision_findings', (task) => this.handleReasoning(task));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Reasoner Agent stopped.');
  }

  private async handleReasoning(task: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Reasoning about potential illegal mining for cell: ${task.cell_id}`);

    try {
      // 1. Prepare context for Gemini
      const context = {
        location: { lat: task.bbox[0], lon: task.bbox[1] },
        spectral: task.spectral,
        temporal: task.temporal,
        gis: task.gis.extracted_features,
        vision: task.vision.classifications.map((c: any) => `${c.type} (conf: ${c.confidence.toFixed(2)})`)
      };

      const prompt = `
        Role: Senior Intelligence Analyst for TerraSentinel Swarm.
        Task: Analyze the following geospatial context and determine if illegal mining is occurring.
        
        Context:
        - Location: ${context.location.lat}, ${context.location.lon}
        - Spectral Anomaly: NDVI=${context.spectral.ndvi.toFixed(3)}, BSI=${context.spectral.bsi.toFixed(3)}
        - Temporal Change: Loss Rate=${(context.temporal.loss_rate * 100).toFixed(1)}%, Accelerating=${context.temporal.is_accelerating}
        - GIS Features: ${context.gis.join(', ')}
        - Vision Classifications: ${context.vision.join(', ')}

        Reasoning Requirements:
        1. Evaluate the synergy between spectral anomalies and vision classifications.
        2. Consider the temporal velocity of vegetation loss.
        3. Identify specific mining patterns (e.g., alluvial gold vs. open-pit).
        4. Assess environmental impact.

        Output Format: Return structured JSON with fields:
        {
          "illegal_mining_detected": boolean,
          "confidence": number (0-1),
          "severity": number (1-10),
          "mining_type": string,
          "env_impact": string[],
          "spread_velocity": "fast" | "moderate" | "slow",
          "recommended_actions": string[],
          "explanation": string
        }
      `;

      // 2. Call Gemini 2.5 Pro (using 3.1-pro-preview as alias for now)
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const verdict = JSON.parse(response.text || "{}");
      
      this.log(`Reasoning complete for ${task.cell_id}. Verdict: ${verdict.illegal_mining_detected ? 'DETECTED' : 'NOT DETECTED'} (Conf: ${verdict.confidence})`);

      // 3. Publish verdict for the Judge Agent
      bus.publish('verdict_generated', {
        ...task,
        verdict,
        reasoned_at: new Date().toISOString()
      });

    } catch (error) {
      this.log(`Reasoning failed for ${task.cell_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}

export const reasonerAgent = new ReasonerAgent();
