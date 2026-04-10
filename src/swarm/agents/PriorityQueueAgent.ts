import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * PriorityQueueAgent acts as a triage engine.
 * It ranks candidate regions and dispatches them for deep analysis.
 */
export class PriorityQueueAgent extends BaseAgent {
  private queue: any[] = [];

  constructor() {
    super('priority_queue', 'PriorityQueueAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Priority Queue ready for triage.');
    
    // Subscribe to candidate regions from Scouts
    bus.subscribe('candidate_region', (candidate) => this.handleCandidate(candidate));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Priority Queue stopped.');
  }

  private handleCandidate(candidate: any) {
    this.log(`Received candidate: ${candidate.cell_id} (Score: ${candidate.anomaly_score.toFixed(2)})`);
    
    // 1. Add to internal queue and sort by anomaly score
    this.queue.push(candidate);
    this.queue.sort((a, b) => b.anomaly_score - a.anomaly_score);

    // 2. Dispatch the top candidate if we aren't overwhelmed
    this.dispatchNext();
  }

  private async dispatchNext() {
    if (this.queue.length === 0) return;

    this.setStatus(AgentStatus.BUSY);
    const topCandidate = this.queue.shift();

    this.log(`Dispatching high-priority region for GIS analysis: ${topCandidate.cell_id}`);

    bus.publish('priority_task', {
      ...topCandidate,
      priority_rank: 1,
      dispatched_at: new Date().toISOString()
    });

    // Simulate triage overhead
    await new Promise(resolve => setTimeout(resolve, 500));
    this.setStatus(AgentStatus.IDLE);
  }
}

export const priorityQueue = new PriorityQueueAgent();
