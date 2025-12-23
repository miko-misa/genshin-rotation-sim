import { AttackPayload, HitPayload } from "./types";
import { CharacterStats } from "../stat/CharacterStats";

export type DamageContext = {
  source: string;
  element: AttackPayload["element"];
  attackKind: AttackPayload["attackKind"];
  multiplier: number;
  stats: CharacterStats;
  // TODO: add more fields later e.g. time, buffs, etc.
}

export function attack(payload: AttackPayload, stats: CharacterStats): DamageContext[] {
  const resolvedStats = payload.snapshot === 'snapshot' ? clonnStats(stats) : stats;

  if (!payload.hits || payload.hits.length === 0) {
    return [
      makeDamageContext({
        payload,
        stats: resolvedStats,
        hit: {ratio: payload.multiplier}
      })
    ]
  }

  return payload.hits.map((hit) =>
    makeDamageContext({
      payload,
      stats: resolvedStats,
      hit
    })
  );
}

function clonnStats(stats: CharacterStats): CharacterStats {
  return stats; // TODO: implement deep clone
}

function makeDamageContext({
  payload,
  stats,
  hit
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
    stats: stats
  };
}