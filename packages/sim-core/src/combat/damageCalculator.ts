import { DamageContext } from './attack';

export type ResultDamage = {
  damage: number;
  element: DamageContext['element'];
  hits: number; // number of enemies hit by the attack
};

export function calculateDamage(dc: DamageContext): ResultDamage {
  const { stats, multiplier, buffs } = dc;

  const rawBaseDamage = stats.hp.total * multiplier * (1 + buffs.specialMultiplierPct / 100); // TODO get reference stat from dc
  const baseDamage = rawBaseDamage + buffs.flatAdd;
  const damageBuffed = baseDamage * (1 + buffs.damageBonusPct / 100);
  const critExpected =
    damageBuffed *
    (1 +
      ((stats.critRate.total + buffs.critRateAdd) / 100) *
        ((stats.critDamage.total + buffs.critDamageAdd) / 100));
  const defApplied = calcDefIgnore(critExpected, buffs.defIgnorePct);
  const resApplied = calcResShred(defApplied, buffs.resShredPct);
  const finalDamage = resApplied * (1 + buffs.finalMultiplierPct / 100);

  return {
    damage: finalDamage,
    element: dc.element,
    hits: 1, // TODO calculate number of enemies hit by the attack
  };
}

function calcDefIgnore(damage: number, defIgnorePct: number): number {
  // TODO implement defense ignore calculation
  return damage * (1 - defIgnorePct / 100);
}

function calcResShred(damage: number, resShredPct: number): number {
  // TODO implement resistance shred calculation
  return damage * (1 - resShredPct / 100);
}
