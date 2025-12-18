export type EventType =
  | 'attack'
  | 'skill'
  | 'burst'
  | 'damage'
  | 'heal'
  | 'statusApply'
  | 'statusExpire';

export type CallbackEvent = {
  type: EventType;
};
