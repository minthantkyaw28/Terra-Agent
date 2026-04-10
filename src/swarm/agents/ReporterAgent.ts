import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * ReporterAgent generates detailed intelligence reports for confirmed findings.
 * It also handles external notifications (simulated webhooks).
 */
export class ReporterAgent extends BaseAgent {
  constructor() {
    super('reporter', 'ReporterAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Reporter Agent ready for report generation.');
    
    // Subscribe to confirmed findings from the Judge Agent
    bus.subscribe('finding_confirmed', (finding) => this.handleReportGeneration(finding));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Reporter Agent stopped.');
  }

  private async handleReportGeneration(finding: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Generating intelligence report for finding: ${finding.finding_id}`);

    try {
      // 1. Generate HTML Report Content (Mock)
      const reportHtml = `
        <div class="report">
          <h1>TerraSentinel Intelligence Report</h1>
          <div class="badge severity-${finding.verdict.severity}">Severity: ${finding.verdict.severity}/10</div>
          <p><strong>Location:</strong> ${finding.bbox[0]}, ${finding.bbox[1]}</p>
          <p><strong>Mining Type:</strong> ${finding.verdict.mining_type}</p>
          <p><strong>Confidence:</strong> ${(finding.verdict.confidence * 100).toFixed(1)}%</p>
          <hr/>
          <h3>Analysis Summary</h3>
          <p>${finding.verdict.explanation}</p>
          <h3>Environmental Impact</h3>
          <ul>
            ${finding.verdict.env_impact.map((i: string) => `<li>${i}</li>`).join('')}
          </ul>
          <h3>Recommended Actions</h3>
          <ul>
            ${finding.verdict.recommended_actions.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      `;

      // 2. Simulate Webhook Dispatch
      this.log(`Dispatching webhook to configured endpoints for ${finding.finding_id}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Store in "Database" (Emitting event for the server to catch)
      bus.publish('report_generated', {
        ...finding,
        report_html: reportHtml,
        generated_at: new Date().toISOString()
      });

      this.log(`Report successfully generated and stored for ${finding.finding_id}.`);

    } catch (error) {
      this.log(`Report generation failed for ${finding.finding_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}

export const reporterAgent = new ReporterAgent();
