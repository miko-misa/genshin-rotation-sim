import { describe, expect, it } from 'vitest';

import { calculateDamage } from '../src/combat/damageCalculator';
import { DamageContext } from '../src/combat/attack';
import { RefStatMultiplier } from '../src/combat/types';
import { Element } from '../src/data/types';
import { createCharacterStats } from '../src/stat/CharacterStats';

describe('damageCalculator (pre-enemy)', () => {
  it('calculates crit expected value from attack stat', () => {
    const stats = createCharacterStats({
      attack: 1000,
      critRate: 50,
      critDamage: 100,
    });

    const multiplier: RefStatMultiplier = {
      Attack: 1,
      Defense: 0,
      HP: 0,
      ElementalMastery: 0,
    };

    const dc: DamageContext = {
      source: 'test',
      level: 90,
      element: Element.Pyro,
      attackKind: 'normal',
      multiplier,
      stats,
      buffs: {
        specialMultiplierPct: 0,
        flatAdd: 0,
        damageBonusPct: 0,
        critRateAdd: 0,
        critDamageAdd: 0,
        defIgnorePct: 0,
        defShredPct: 0,
        resShredPct: 0,
        finalMultiplierPct: 0,
        attackKindBonusPct: 0,
      },
    };

    const result = calculateDamage(dc);
    expect(result.damage).toBeCloseTo(1500, 6);
  });
});
