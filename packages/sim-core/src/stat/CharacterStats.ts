import { AdditiveStat, ScalingStat, Stat, StatKind } from './Stat';

export interface CharacterStats {
  /** Base Stats */
  hp: Stat;
  attack: Stat;
  defense: Stat;
  elementalMastery: Stat;
  maxStamina: Stat;
  /** Advanced Stats */
  critRate: Stat;
  critDamage: Stat;
  healingBonus: Stat;
  incomingHealingBonus: Stat;
  energyRecharge: Stat;
  cooldownReduction: Stat;
  shieldStrength: Stat;
  physicalBonus: Stat;
  /** Elemental Stats */
  pyroBonus: Stat;
  hydroBonus: Stat;
  electroBonus: Stat;
  cryoBonus: Stat;
  geoBonus: Stat;
  anemoBonus: Stat;
  dendroBonus: Stat;
  pyroResistance: Stat;
  hydroResistance: Stat;
  electroResistance: Stat;
  cryoResistance: Stat;
  geoResistance: Stat;
  anemoResistance: Stat;
  dendroResistance: Stat;
}

export type CharacterStatKey = keyof CharacterStats;

export const STAT_KINDS = {
  hp: 'scaling',
  attack: 'scaling',
  defense: 'scaling',
  elementalMastery: 'additive',
  maxStamina: 'additive',
  critRate: 'additive',
  critDamage: 'additive',
  healingBonus: 'additive',
  incomingHealingBonus: 'additive',
  energyRecharge: 'additive',
  cooldownReduction: 'additive',
  shieldStrength: 'additive',
  physicalBonus: 'additive',
  pyroBonus: 'additive',
  hydroBonus: 'additive',
  electroBonus: 'additive',
  cryoBonus: 'additive',
  geoBonus: 'additive',
  anemoBonus: 'additive',
  dendroBonus: 'additive',
  pyroResistance: 'additive',
  hydroResistance: 'additive',
  electroResistance: 'additive',
  cryoResistance: 'additive',
  geoResistance: 'additive',
  anemoResistance: 'additive',
  dendroResistance: 'additive',
} as const satisfies Record<CharacterStatKey, StatKind>;

const INITIAL_STATS: Partial<Record<CharacterStatKey, number>> = {
  critRate: 5,
  critDamage: 50,
  energyRecharge: 100,
};

export function createCharacterStats(
  initial?: Partial<Record<CharacterStatKey, number>>
): CharacterStats {
  const initialStats = { ...INITIAL_STATS, ...initial };
  const createStat = (key: CharacterStatKey) =>
    STAT_KINDS[key] === 'scaling'
      ? new ScalingStat(initialStats[key] || 0)
      : new AdditiveStat(initialStats[key] || 0);
  return {
    hp: createStat('hp'),
    attack: createStat('attack'),
    defense: createStat('defense'),
    elementalMastery: createStat('elementalMastery'),
    maxStamina: createStat('maxStamina'),
    critRate: createStat('critRate'),
    critDamage: createStat('critDamage'),
    healingBonus: createStat('healingBonus'),
    incomingHealingBonus: createStat('incomingHealingBonus'),
    energyRecharge: createStat('energyRecharge'),
    cooldownReduction: createStat('cooldownReduction'),
    shieldStrength: createStat('shieldStrength'),
    physicalBonus: createStat('physicalBonus'),
    pyroBonus: createStat('pyroBonus'),
    hydroBonus: createStat('hydroBonus'),
    electroBonus: createStat('electroBonus'),
    cryoBonus: createStat('cryoBonus'),
    geoBonus: createStat('geoBonus'),
    anemoBonus: createStat('anemoBonus'),
    dendroBonus: createStat('dendroBonus'),
    pyroResistance: createStat('pyroResistance'),
    hydroResistance: createStat('hydroResistance'),
    electroResistance: createStat('electroResistance'),
    cryoResistance: createStat('cryoResistance'),
    geoResistance: createStat('geoResistance'),
    anemoResistance: createStat('anemoResistance'),
    dendroResistance: createStat('dendroResistance'),
  };
}

/**
 * キーに応じたボーナスStatを生成するファクトリ。
 * scaling系のキーはpercentBonusにvalue1、additive系はflatBonusにvalue1を入れる。
 * value2はscaling系のflatBonusを増やしたい場合のみ使用。
 */
export function createBonusStatForKey(
  key: CharacterStatKey,
  value1: number = 0,
  value2: number = 0
): Stat {
  if (STAT_KINDS[key] === 'scaling') {
    return new ScalingStat(0, value1, value2);
  }
  return new AdditiveStat(0, value1);
}

export function printStats(stats: CharacterStats): string {
  const lines: string[] = [];
  lines.push(
    ' stats name'.padStart(23) + ' | base value | percent value | flat value | total value'
  );
  lines.push(
    '-'.repeat(24) +
      '+' +
      '-'.repeat(12) +
      '+' +
      '-'.repeat(15) +
      '+' +
      '-'.repeat(12) +
      '+' +
      '-'.repeat(13)
  );
  for (const key in stats) {
    const statKey = key as CharacterStatKey;
    // 各ステータスの表示。揃えて表示
    lines.push(
      ` ${statKey.padStart(22)} | ${stats[statKey].base.toFixed(3).padStart(10)} | ${
        stats[statKey] instanceof ScalingStat
          ? (stats[statKey] as ScalingStat).percentBonus.toFixed(3).padStart(13)
          : '-'.padStart(13)
      } | ${
        stats[statKey] instanceof ScalingStat
          ? (stats[statKey] as ScalingStat).flatBonus.toFixed(3).padStart(10)
          : (stats[statKey] as AdditiveStat).flatBonus.toFixed(3).padStart(10)
      } | ${stats[statKey].total.toFixed(3).padStart(11)}`
    );
  }
  return lines.join('\n');
}
