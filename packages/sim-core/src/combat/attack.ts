import { CharacterStats } from '../stat/CharacterStats';
import { AttackPayload, HitPayload } from './types';

export type Buffs = {
  specialMultiplierPct: number;
  flatAdd: number;
  damageBonusPct: number;
  critRateAdd: number;
  critDamageAdd: number;
  defIgnorePct: number;
  resShredPct: number;
  finalMultiplierPct: number;
  // TODO attackKind specific buffs
};

export type DamageContext = {
  source: string;
  element: AttackPayload['element'];
  attackKind: AttackPayload['attackKind'];
  multiplier: number;
  stats: CharacterStats;
  buffs: Buffs;
  // TODO reference stat
};

export function attack(payload: AttackPayload, stats: CharacterStats): DamageContext[] {
  const resolvedStats = payload.snapshot === 'snapshot' ? clonnStats(stats) : stats;

  if (!payload.hits || payload.hits.length === 0) {
    return [
      makeDamageContext({
        payload,
        stats: resolvedStats,
        hit: { ratio: payload.multiplier },
      }),
    ];
  }

  return payload.hits.map((hit) =>
    makeDamageContext({
      payload,
      stats: resolvedStats,
      hit,
    })
  );
}

function clonnStats(stats: CharacterStats): CharacterStats {
  return stats; // TODO: implement deep clone
}

function makeDamageContext({
  payload,
  stats,
  hit,
}: {
  payload: AttackPayload;
  stats: CharacterStats;
  hit: HitPayload;
}): DamageContext {
  return {
    source: payload.source,
    element: hit.element ?? payload.element,
    attackKind: payload.attackKind,
    multiplier: hit.ratio ?? payload.multiplier,
    stats: stats,
    buffs: {
      specialMultiplierPct: 0,
      flatAdd: 0,
      damageBonusPct: 0,
      critRateAdd: 0,
      critDamageAdd: 0,
      defIgnorePct: 0,
      resShredPct: 0,
      finalMultiplierPct: 0,
    },
  };
}
