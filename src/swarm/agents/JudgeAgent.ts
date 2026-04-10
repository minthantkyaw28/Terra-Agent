import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * JudgeAgent is the Escalation Authority.
 * It reviews ReasonerAgent verdicts and confirms findings for reporting.
 */
export class JudgeAgent extends BaseAgent {
  private confirmedFindingsCount: number = 0;

  constructor() {
    super('judge', 'JudgeAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Judge Agent ready for escalation review.');
    
    // Subscribe to verdicts from the Reasoner Agent
    bus.subscribe('verdict_generated', (task) => this.handleReview(task));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Judge Agent stopped.');
  }

  private async handleReview(task: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Reviewing verdict for cell: ${task.cell_id} (Severity: ${task.verdict.severity})`);

    try {
      const { verdict } = task;

      // 1. Escalation Logic
      // We confirm if mining is detected AND severity is high enough
      const isConfirmed = verdict.illegal_mining_detected && verdict.severity >= 6;

      if (isConfirmed) {
        this.confirmedFindingsCount++;
        this.log(`Finding CONFIRMED for ${task.cell_id}. Escalating to Reporter and Voice agents.`);
        
        bus.publish('finding_confirmed', {
          ...task,
          confirmed_at: new Date().toISOString(),
          finding_id: `FINDING_${Date.now()}_${this.confirmedFindingsCount}`
        });
      } else {
        this.log(`Finding for ${task.cell_id} does not meet escalation threshold. Downgraded.`);
        bus.publish('finding_rejected', {
          cell_id: task.cell_id,
          reason: verdict.illegal_mining_detected ? 'Low Severity' : 'No Mining Detected'
        });
      }

      // Simulate review overhead
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      this.log(`Review failed for ${task.cell_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}

export const judgeAgent = new JudgeAgent();
