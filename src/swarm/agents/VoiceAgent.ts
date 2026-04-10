import { BaseAgent, AgentStatus } from '../BaseAgent';
import { bus } from '../EventBus';

/**
 * VoiceAgent converts confirmed findings into spoken field briefings.
 * It simulates integration with a TTS service (e.g., Gradio TTS).
 */
export class VoiceAgent extends BaseAgent {
  constructor() {
    super('voice', 'VoiceAgent');
  }

  public start() {
    this.setStatus(AgentStatus.IDLE);
    this.log('Voice Agent ready for audio briefing generation.');
    
    // Subscribe to confirmed findings from the Judge Agent
    bus.subscribe('finding_confirmed', (finding) => this.handleVoiceGeneration(finding));
  }

  public stop() {
    this.setStatus(AgentStatus.OFFLINE);
    this.log('Voice Agent stopped.');
  }

  private async handleVoiceGeneration(finding: any) {
    this.setStatus(AgentStatus.BUSY);
    this.log(`Generating audio briefing for finding: ${finding.finding_id}`);

    try {
      // 1. Prepare the briefing script
      const script = `
        Attention. A high-severity illegal mining operation has been detected at latitude ${finding.bbox[0].toFixed(4)}, longitude ${finding.bbox[1].toFixed(4)}.
        The operation is classified as ${finding.verdict.mining_type} with a confidence of ${(finding.verdict.confidence * 100).toFixed(0)} percent.
        Analysis indicates ${finding.verdict.explanation}.
        Immediate environmental impacts include ${finding.verdict.env_impact.join(', ')}.
        Recommended actions are ${finding.verdict.recommended_actions.join('. ')}.
        End of briefing.
      `;

      // 2. Simulate TTS Processing Time (Gradio/OpenAI TTS)
      this.log(`Synthesizing voice for ${finding.finding_id}...`);
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

      // 3. Mock Audio URL (In a real app, this would be a signed URL or base64)
      const mockAudioUrl = `https://storage.googleapis.com/terrasentinel-briefings/${finding.finding_id}.mp3`;

      // 4. Publish briefing for the dashboard
      bus.publish('briefing_generated', {
        finding_id: finding.finding_id,
        audio_url: mockAudioUrl,
        script: script,
        generated_at: new Date().toISOString()
      });

      this.log(`Audio briefing generated for ${finding.finding_id}.`);

    } catch (error) {
      this.log(`Voice generation failed for ${finding.finding_id}: ${error}`);
    } finally {
      this.setStatus(AgentStatus.IDLE);
    }
  }
}

export const voiceAgent = new VoiceAgent();
