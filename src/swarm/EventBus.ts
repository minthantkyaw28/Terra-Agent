import { EventEmitter } from 'events';

/**
 * EventBus simulates a Redis Pub/Sub system for inter-agent communication.
 * In a production environment, this would be replaced with a real Redis client.
 */
class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    // Increase max listeners for the swarm
    this.setMaxListeners(50);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Emit an event to the swarm.
   */
  public publish(event: string, payload: any) {
    console.log(`[BUS] PUBLISH: ${event}`, JSON.stringify(payload).substring(0, 100) + '...');
    this.emit(event, payload);
  }

  /**
   * Subscribe to a swarm event.
   */
  public subscribe(event: string, callback: (payload: any) => void) {
    console.log(`[BUS] SUBSCRIBE: ${event}`);
    this.on(event, callback);
  }
}

export const bus = EventBus.getInstance();
