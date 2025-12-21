import charactersData from '../../data/characters.json';
import { CharacterLevel, CharacterRarity, Element, WeaponType } from '../../data/types';
import {
  CharacterStatKey,
  CharacterStats,
  createBonusStatForKey,
  createCharacterStats,
} from '../../stat/CharacterStats';
import { ScalingStat } from '../../stat/Stat';
import { getLevelAndAscension } from '../../utils';
import { EquippedArtifact, loadArtifactsStats } from '../artifacts/Artifact';
import { Weapon } from '../weapons/Weapon';

export default abstract class Character {
  element: Element;
  rarity: CharacterRarity;
  weaponType: WeaponType;
  stats: CharacterStats;

  constructor(
    public key: string,
    public level: CharacterLevel,
    public equippedWeapon: Weapon,
    public equippedArtifacts: EquippedArtifact[] = []
  ) {
    const characterData = CHARACTERS[this.key];
    if (!characterData) {
      throw new Error(`Character '${this.key}' not found.`);
    }
    if (equippedWeapon.type !== characterData.weaponType) {
      throw new Error(
        `Equipped weapon type '${equippedWeapon.type}' does not match character's weapon type '${characterData.weaponType}'.`
      );
    }
    this.stats = calcBaseStatAtLevel(this.key, this.level);
    this.element = characterData.element;
    this.rarity = characterData.rarity;
    this.weaponType = characterData.weaponType;
    this.init();
  }

  init(): void {
    // 武器の基礎攻撃力を基礎ステータスに反映
    this.stats.attack.add(new ScalingStat(this.equippedWeapon.baseAttack));
    // 武器の副ステータスをステータスに反映
    const secondary = this.equippedWeapon.secondaryStat;
    this.stats[secondary.stat].add(createBonusStatForKey(secondary.stat, secondary.value));
    // 武器のパッシブ効果（固定）を適用
    this.equippedWeapon.applyPassiveModifiers(this.stats);
    // 装備アーティファクトのステータスを反映
    loadArtifactsStats(this.stats, this.equippedArtifacts);
  }

  /* TODO
  abstract actN(): void;
  abstract actCA(): void;
  abstract actE(): void;
  abstract actQ(): void;
  */
}

export type CharacterData = {
  displayName: string;
  element: Element;
  rarity: CharacterRarity;
  weaponType: WeaponType;
  bonusStat: CharacterStatKey;
  stats: {
    base: {
      hp: number;
      attack: number;
      defense: number;
    };
    maxAsc: {
      hp: number;
      attack: number;
      defense: number;
    };
  };
};

const CHARACTERS = charactersData as unknown as Record<string, CharacterData>;

// ヘルパー関数: レベルによる基礎ステータス乗数を計算
function getLevelMultiplier(level: number, rarity: CharacterRarity) {
  const multiplier = ((100 + 9 * level) / 109) * (1 + ((rarity - 4) * (level - 1)) / 1901);
  return Math.round(multiplier * 1000) / 1000;
}

export function calcBaseStatAtLevel(characterKey: string, level: CharacterLevel): CharacterStats {
  const characterData = CHARACTERS[characterKey];
  if (!characterData) {
    throw new Error(`Character '${characterKey}' not found.`);
  }

  const {
    rarity,
    stats: { base, maxAsc },
  } = characterData;
  const { levelNum, ascension } = getLevelAndAscension(level);

  // レベル乗数の取得
  let multipliers: { hp: number; attack: number; defense: number };
  if (levelNum <= 90) {
    const m = getLevelMultiplier(levelNum, rarity);
    multipliers = { hp: m, attack: m, defense: m };
  } else {
    const overLevel = OVER_LEVEL_MULTIPLIER[rarity]?.[levelNum];
    // 定義がない場合はエラー
    if (!overLevel) {
      throw new Error(
        `Over level multipliers not defined for character rarity ${rarity} at level ${levelNum}.`
      );
    }
    multipliers = overLevel;
  }

  const ascMultiplier = ASCENSION_MULTIPLIERS[ascension] || 0;

  // ステータス計算
  const calcStat = (baseVal: number, maxAscVal: number, levelMult: number) =>
    baseVal * levelMult + maxAscVal * ascMultiplier;

  const stat = createCharacterStats({
    hp: calcStat(base.hp, maxAsc.hp, multipliers.hp),
    attack: calcStat(base.attack, maxAsc.attack, multipliers.attack),
    defense: calcStat(base.defense, maxAsc.defense, multipliers.defense),
  });

  // 突破ステータスを反映
  const key = characterData.bonusStat;
  if (!key) {
    throw new Error(`bonusStat is not defined for character '${characterData.displayName}'.`);
  }
  stat[key].add(createBonusStatForKey(key, getAscensionBonusStat(key, rarity, ascension)));
  return stat;
}

const ASCENSION_MULTIPLIERS: readonly number[] = Object.freeze([
  0,
  38 / 182,
  65 / 182,
  101 / 182,
  128 / 182,
  155 / 182,
  1,
] as const);

type OverLevelMultiplier = Readonly<
  Record<CharacterRarity, Record<number, { hp: number; attack: number; defense: number }>>
>;

const OVER_LEVEL_MULTIPLIER: OverLevelMultiplier = Object.freeze({
  4: {
    95: { hp: 8.761, attack: 9.87, defense: 8.761 },
    100: { hp: 9.174, attack: 11.392, defense: 9.174 },
  },
  5: {
    95: { hp: 9.195, attack: 10.184, defense: 9.195 },
    100: { hp: 9.652, attack: 11.629, defense: 9.652 },
  },
} as const);

const BONUS_ASCENSION_BASE: Readonly<
  Partial<Record<CharacterStatKey, Readonly<Record<CharacterRarity, number>>>>
> = Object.freeze({
  // HP% / ATK% / DEF%
  hp: Object.freeze({ 4: 6, 5: 7.2 }),
  attack: Object.freeze({ 4: 6, 5: 7.2 }),
  defense: Object.freeze({ 4: 7.5, 5: 9 }),
  // Elemental DMG Bonus (per element)
  pyroBonus: Object.freeze({ 4: 6, 5: 7.2 }),
  hydroBonus: Object.freeze({ 4: 6, 5: 7.2 }),
  electroBonus: Object.freeze({ 4: 6, 5: 7.2 }),
  cryoBonus: Object.freeze({ 4: 6, 5: 7.2 }),
  geoBonus: Object.freeze({ 4: 6, 5: 7.2 }),
  anemoBonus: Object.freeze({ 4: 6, 5: 7.2 }),
  dendroBonus: Object.freeze({ 4: 6, 5: 7.2 }),
  physicalBonus: Object.freeze({ 4: 7.5, 5: 9 }),
  energyRecharge: Object.freeze({ 4: 6.7, 5: 8 }),
  elementalMastery: Object.freeze({ 4: 24, 5: 28.8 }),
  healingBonus: Object.freeze({ 4: 4.62, 5: 5.54 }),
  critRate: Object.freeze({ 4: 0, 5: 4.8 }),
  critDamage: Object.freeze({ 4: 0, 5: 9.6 }),
} as const);

const BONUS_ASCENSION_MULTIPLIERS = Object.freeze([0, 0, 1, 2, 2, 3, 4] as const);

export function getAscensionBonusStat(
  key: CharacterStatKey,
  rarity: CharacterRarity,
  ascension: number
): number {
  const baseValues = BONUS_ASCENSION_BASE[key];
  if (!baseValues) {
    return 0;
  }
  const baseValue = baseValues[rarity];
  if (!baseValue) {
    return 0;
  }
  const multiplier = BONUS_ASCENSION_MULTIPLIERS[ascension] || 0;
  return baseValue * multiplier;
}
