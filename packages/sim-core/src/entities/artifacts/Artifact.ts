import { ArtifactLevel, ArtifactSlot } from '../../data/types';
import { CharacterStatKey, CharacterStats, STAT_KINDS } from '../../stat/CharacterStats';

export abstract class ArtifactSet {
  constructor(public set: string) {}
  onEquip2(): void {}
  onEquip4(): void {}
}

// ArtifactMainStat は既存のものを流用/修正
type ArtifactMainStat =
  | 'hp' // flat
  | 'attack' // flat
  | 'defense' // flat
  | 'hp%'
  | 'attack%'
  | 'defense%'
  | 'elementalMastery'
  | 'energyRecharge'
  | 'critRate'
  | 'critDamage'
  | 'healingBonus'
  | 'physicalBonus'
  | 'pyroBonus'
  | 'hydroBonus'
  | 'electroBonus'
  | 'cryoBonus'
  | 'anemoBonus'
  | 'geoBonus'
  | 'dendroBonus';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MAIN_STATS_BY_SLOT = {
  [ArtifactSlot.Flower]: ['hp'],
  [ArtifactSlot.Plume]: ['attack'],
  [ArtifactSlot.Sands]: ['hp%', 'attack%', 'defense%', 'elementalMastery', 'energyRecharge'],
  [ArtifactSlot.Goblet]: [
    'hp%',
    'attack%',
    'defense%',
    'elementalMastery',
    'physicalBonus',
    'pyroBonus',
    'hydroBonus',
    'electroBonus',
    'cryoBonus',
    'anemoBonus',
    'geoBonus',
    'dendroBonus',
  ],
  [ArtifactSlot.Circlet]: [
    'hp%',
    'attack%',
    'defense%',
    'elementalMastery',
    'critRate',
    'critDamage',
    'healingBonus',
  ],
} as const satisfies Record<ArtifactSlot, readonly ArtifactMainStat[]>;

type MainStatForSlot<S extends ArtifactSlot> = (typeof MAIN_STATS_BY_SLOT)[S][number];

export type EquippedArtifact<S extends ArtifactSlot = ArtifactSlot> = {
  name: string;
  set: string;
  slot: S;
  level: ArtifactLevel;
  mainStat: {
    stat: MainStatForSlot<S>;
    value: number;
  };
  subStats: { stat: ArtifactSubStat; value: number }[];
};

export type ArtifactSubStat =
  | 'hp'
  | 'hp%'
  | 'attack'
  | 'attack%'
  | 'defense'
  | 'defense%'
  | 'elementalMastery'
  | 'energyRecharge'
  | 'critRate'
  | 'critDamage';

export function loadArtifactsStats(
  characterStats: CharacterStats,
  equippedArtifacts: EquippedArtifact[]
): void {
  for (const artifact of equippedArtifacts) {
    applyStat(characterStats, artifact.mainStat.stat, artifact.mainStat.value);
    for (const subStat of artifact.subStats) {
      applyStat(characterStats, subStat.stat, subStat.value);
    }
  }
}

// Artifact側のキーと、CharacterStats側の対象キーの対応表（1箇所で集中管理）。
// 適用の方法（percent か flat）は STAT_KINDS と組み合わせて決定する。
type ArtifactAnyStat = ArtifactSubStat | ArtifactMainStat;
const ARTIFACT_TO_CHARACTER: Readonly<Record<ArtifactAnyStat, CharacterStatKey>> = {
  // scaling系（平坦/割合の2形態が存在）
  'hp': 'hp',
  'hp%': 'hp',
  'attack': 'attack',
  'attack%': 'attack',
  'defense': 'defense',
  'defense%': 'defense',
  // additive系（加算のみ）
  'elementalMastery': 'elementalMastery',
  'energyRecharge': 'energyRecharge',
  'critRate': 'critRate',
  'critDamage': 'critDamage',
  'healingBonus': 'healingBonus',
  'physicalBonus': 'physicalBonus',
  'pyroBonus': 'pyroBonus',
  'hydroBonus': 'hydroBonus',
  'electroBonus': 'electroBonus',
  'cryoBonus': 'cryoBonus',
  'anemoBonus': 'anemoBonus',
  'geoBonus': 'geoBonus',
  'dendroBonus': 'dendroBonus',
} as const;

function applyStat(
  characterStats: CharacterStats,
  stat: ArtifactSubStat | ArtifactMainStat,
  value: number
) {
  const target = ARTIFACT_TO_CHARACTER[stat];
  const kind = STAT_KINDS[target];

  // scaling系かつ、ArtifactのキーがCharacterStatKeyと異なる（=割合形態）場合は%加算
  if (kind === 'scaling' && stat !== target) {
    characterStats[target].addPercentBonus(value);
    return;
  }

  // それ以外はフラット加算
  characterStats[target].addFlatBonus(value);
}
