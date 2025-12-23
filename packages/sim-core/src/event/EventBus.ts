import { CallbackEvent, EventType } from './Event';
import EventListener from './EventListener';

export default class EventBus {
  private listeners: Partial<Record<EventType, Set<EventListener>>> = {};

  /**
   * Register an event listener
   * @param eventType The type of event to listen for
   * @param callback The callback function to invoke when the event is emitted
   */
  register(eventType: EventType, callback: EventListener) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = new Set();
    }
    this.listeners[eventType]!.add(callback);
  }

  /** Emit an event to all registered listeners
   * @param event The event to emit
   * @param currentTime The current simulation time
   */
  emit(event: CallbackEvent, currentTime: number) {
    const eventListeners = this.listeners[event.type];
    if (!eventListeners) return;
    for (const listener of eventListeners) {
      if (currentTime < listener.startTime) continue;
      listener.callback(event);
      if (currentTime >= listener.endTime) eventListeners.delete(listener);
    }
  }
}
