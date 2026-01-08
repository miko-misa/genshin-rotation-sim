import { DamageContext } from './attack';
import { CharacterStats } from '../stat/CharacterStats';
import { RefStatMultiplier } from './types';
import { Element } from '../data/types.js';

export type PreEnemyDamage = {
  damage: number;
  element: Element;
  defIgnorePct: number;
  defShredPct: number;
  resShredPct: number;
  attackerLevel: number;
};


export function calculateDamage(dc: DamageContext): PreEnemyDamage {
  const { stats, multiplier, buffs } = dc;

  
  const rawBaseDamage = calcRowBase(stats, multiplier, buffs.specialMultiplierPct);
  const baseDamage = rawBaseDamage + buffs.flatAdd;
  const damageBuffed = baseDamage * (1 + (buffs.damageBonusPct + buffs.attackKindBonusPct) / 100);
  const critExpected =
    damageBuffed *
    (1 +
      ((stats.critRate.total + buffs.critRateAdd) / 100) *
        ((stats.critDamage.total + buffs.critDamageAdd) / 100));
  const finalDamage = critExpected * (1 + buffs.finalMultiplierPct / 100);

  return {
    damage: finalDamage,
    element: dc.element,
    defIgnorePct: buffs.defIgnorePct,
    defShredPct: buffs.defShredPct,
    resShredPct: buffs.resShredPct,
    attackerLevel: dc.level,
  };
}

function calcRowBase(stats: CharacterStats, m: RefStatMultiplier, specialPct: number) {
  const base =
    m.Attack * stats.attack.total +
    m.Defense * stats.defense.total +
    m.HP * stats.hp.total +
    m.ElementalMastery * stats.elementalMastery.total;
  return base * (1 + specialPct / 100);
}