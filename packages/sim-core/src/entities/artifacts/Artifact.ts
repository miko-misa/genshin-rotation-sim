import { ArtifactLevel, ArtifactSlot } from '../../data/types';
import { CharacterStatKey, CharacterStats } from '../../stat/CharacterStats';

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

function applyStat(
  characterStats: CharacterStats,
  stat: ArtifactSubStat | ArtifactMainStat,
  value: number
) {
  if (stat.endsWith('%')) {
    const key = stat.slice(0, -1) as CharacterStatKey;
    characterStats[key].addPercentBonus(value);
    return;
  } else {
    const key = stat as CharacterStatKey;
    characterStats[key].addFlatBonus(value);
  }
}
