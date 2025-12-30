import { Element } from '../data/types.js';

export type AttackKind = 'normal' | 'charged' | 'plunge' | 'skill' | 'burst';

export type SnapshotMode = 'snapshot' | 'dynamic';

export type HitPayload = {
  ratio?: RefStatMultiplier;
  element?: Element;
};

export type AttackPayload = {
  source: string;
  level: number;
  element: Element;
  attackKind: AttackKind;
  refStat?: ReferenceStat;
  multiplier: RefStatMultiplier;
  snapshot: SnapshotMode;
  hits?: HitPayload[];
};

export enum ReferenceStat {
  Attack = 'attack',
  Defense = 'defense',
  HP = 'hp',
  ElementalMastery = 'elementalMastery',
}

export type RefStatMultiplier = {
  Attack: number;
  Defense: number;
  HP: number;
  ElementalMastery: number;
};