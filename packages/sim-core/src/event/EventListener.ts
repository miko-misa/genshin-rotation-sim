import { CallbackEvent } from './Event';

export default abstract class EventListener {
  public eventType: string;
  public abstract startTime: number;
  public abstract endTime: number;
  /** The callback function to invoke when the event is emitted */
  public callback: (eventData: CallbackEvent) => void;

  constructor(eventType: string, callback: (eventData: CallbackEvent) => void) {
    this.eventType = eventType;
    this.callback = callback;
  }
}
