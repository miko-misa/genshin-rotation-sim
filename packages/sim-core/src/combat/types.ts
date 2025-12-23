import { Element } from '../data/types.js';

export type AttackKind = 'normal' | 'charged' | 'plunge' | 'skill' | 'burst';

export type SnapshotMode = 'snapshot' | 'dynamic';


// TODO: time evolution laters
export type HitPayload = {
  ratio?: number;
  // delay: number;
  element?: Element;
}

export type AttackPayload = {
  source: string;
  element: Element;
  attackKind: AttackKind;
  multiplier: number;
  snapshot: SnapshotMode;
  // time: number;
  // snapshotAt?: number;
  hits?: HitPayload[];
}