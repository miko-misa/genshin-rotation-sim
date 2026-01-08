import enemiesData from '../../data/enemies.json';
import enemyLevelMultipliers from '../../data/enemyLevelMultipliers.json';
import { EnemyLevel } from '../../data/types';
import { Element } from '../../data/types';

export default abstract class Enemy {
  hasWeakPoint: boolean;
  element: Element | null;
  elementalResistances: Record<Element, number>;
  hpSpecialMultiplier: number | null;
  hp: number;

  constructor(
    public key: string,
    public level: EnemyLevel
  ) {
    assertEnemyLevel(level);

    const enemyData = ENEMIES[this.key];
    if (!enemyData) {
      throw new Error(`Enemy '${this.key}' not found.`);
    }

    this.hasWeakPoint = enemyData.hasWeakPoint ?? false;
    this.element = enemyData.elements?.isElemental ? enemyData.elements.element : null;
    this.elementalResistances = {
      Anemo: 0,
      Geo: 0,
      Electro: 0,
      Dendro: 0,
      Hydro: 0,
      Pyro: 0,
      Cryo: 0,
      Physical: 0,
      ...(enemyData.stats.elementalResistances ?? {}),
    };
    this.hpSpecialMultiplier = null;
    this.hp = calculateEnemyHP(
      enemyData.stats.baseHP,
      enemyData.stats.levelMultiplierType,
      this.level
    );
  }
}

export type EnemyData = {
  displayName: string;
  hasWeakPoint?: boolean;
  elements?: { isElemental: true; element: Element };
  stats: {
    baseHP: number;
    levelMultiplierType: string;
    specialMultiplier?: number;
    elementalResistances?: Partial<Record<Element, number>>;
  };
};

const ENEMIES = enemiesData as unknown as Record<string, EnemyData>;
const LEVEL_MULTIPLIERS = enemyLevelMultipliers as unknown as Record<string, readonly number[]>;


function getLevelMultiplier(type: string, level: number): number {
  const table = LEVEL_MULTIPLIERS[type];
  if (!table) {
    throw new Error(`Unknown levelMultiplierType: ${type}`);
  }
  const mult = table[level];
  if (mult == null) {
    throw new Error(`No multiplier for level ${level} in ${type}`);
  }
  return mult;
}

function calculateEnemyHP(baseHP: number, levelMultiplierType: string, level: number): number {
  const multiplier = getLevelMultiplier(levelMultiplierType, level);
  return baseHP * multiplier;
}

function assertEnemyLevel(level: number): void {
  if (level == null) {
    throw new Error('Enemy level is undefined.');
  }
  if (!Number.isInteger(level) || level < 1 || level > 100) {
    throw new Error(`Enemy level is invalid: ${level}`);
  }
}
