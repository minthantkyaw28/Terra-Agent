import { bus } from './EventBus';

export enum AgentStatus {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE'
}

/**
 * BaseAgent is the abstract class for all agents in the TerraSentinel swarm.
 * It handles status management, logging, and event bus integration.
 */
export abstract class BaseAgent {
  public id: string;
  public name: string;
  public status: AgentStatus = AgentStatus.IDLE;
  protected logs: string[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.log(`Agent initialized: ${this.name}`);
  }

  /**
   * Log a message and emit it for the UI log stream.
   */
  protected log(message: string) {
    const timestamp = new Date().toISOString();
    const formattedLog = `[${timestamp}] [${this.name}] ${message}`;
    this.logs.push(formattedLog);
    if (this.logs.length > 100) this.logs.shift(); // Keep last 100 logs
    
    console.log(formattedLog);
    
    // Emit log event for real-time UI updates
    bus.publish('agent_log', {
      agentId: this.id,
      message: formattedLog
    });
  }

  /**
   * Update agent status and notify the swarm.
   */
  protected setStatus(status: AgentStatus) {
    this.status = status;
    bus.publish('agent_status_change', {
      agentId: this.id,
      status: this.status
    });
  }

  /**
   * Get recent logs.
   */
  public getLogs(): string[] {
    return this.logs;
  }

  /**
   * Abstract method to be implemented by each agent to handle its specific logic.
   */
  public abstract start(): void;
  public abstract stop(): void;
}
