import { Element } from '../data/types.js';

export type AttackKind = 'normal' | 'charged' | 'plunge' | 'skill' | 'burst';

export type SnapshotMode = 'snapshot' | 'dynamic';

export type HitPayload = {
  ratio?: number;
  element?: Element;
};

export type AttackPayload = {
  source: string;
  element: Element;
  attackKind: AttackKind;
  multiplier: number;
  snapshot: SnapshotMode;
  hits?: HitPayload[];
};
