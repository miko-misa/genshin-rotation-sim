import { describe, expect, it, test } from 'vitest';

import { ArtifactSlot } from '../src/data/types';
import { EquippedArtifact } from '../src/entities/artifacts/Artifact';
import { Input, solveArtifact4Substats5Star } from '../src/entities/artifacts/SolveArtifactsGrow';
import Bennett from '../src/entities/characters/Bennett';
import { calcBaseStatAtLevel } from '../src/entities/characters/Character';
import SapwoodBlade from '../src/entities/weapons/SapwoodBlade';
import { calcBaseWeaponStatAtLevel } from '../src/entities/weapons/Weapon';
import { printStats } from '../src/stat/CharacterStats';

interface CustomMatchers<R = unknown> {
  toBeWithinRange(expected: number, range: number): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeWithinRange(received: number, expected: number, range: number) {
    const { isNot } = this;

    // 差分の絶対値を計算
    const diff = Math.abs(received - expected);

    // 判定ロジック: 差が指定範囲(range)より小さいか
    const pass = diff < range;

    return {
      pass,
      // エラー時に表示されるメッセージ
      message: () => {
        // expect(x).not.toBeDifferenceLessThan(...) の場合と
        // expect(x).toBeDifferenceLessThan(...) の場合でメッセージを出し分ける
        return isNot
          ? `Expected value to NOT be within difference of ${range} from ${expected}, but difference was ${diff}`
          : `Expected value to be within difference of ${range} from ${expected}, but difference was ${diff}`;
      },
    };
  },
});

describe('calculate stats', () => {
  it('character base attack', () => {
    const stats = calcBaseStatAtLevel('Bennett', 80);
    expect(stats.hp.base).toBeCloseTo(10987, 0);
  });
  it('weapon base attack', () => {
    const stats = calcBaseWeaponStatAtLevel('SkywardBlade', 90);
    expect(stats.baseAttack).toBeCloseTo(608, 0);
    expect(stats.secondary.stat).toEqual('energyRecharge');
    expect(stats.secondary.value).toBeCloseTo(55.1, 0);
  });
  it('generate bennett only with weapon and artifact', () => {
    const sapwoodBlade = new SapwoodBlade(90);
    const artifacts = [
      {
        name: 'Flower of Life',
        set: 'Adventurer',
        slot: ArtifactSlot.Flower,
        level: 0,
        mainStat: { stat: 'hp', value: 717 },
        subStats: [
          { stat: 'elementalMastery', value: 21 },
          { stat: 'attack', value: 18 },
          { stat: 'energyRecharge', value: 5.8 },
        ],
      },
      {
        name: 'Plume of Death',
        set: 'Adventurer',
        slot: ArtifactSlot.Plume,
        level: 20,
        mainStat: { stat: 'attack', value: 311 },
        subStats: [
          { stat: 'energyRecharge', value: 17.5 },
          { stat: 'hp%', value: 4.7 },
          { stat: 'defense%', value: 19.7 },
          { stat: 'attack%', value: 5.8 },
        ],
      },
      {
        name: 'Sands of Eon',
        set: 'Adventurer',
        slot: ArtifactSlot.Sands,
        level: 20,
        mainStat: { stat: 'energyRecharge', value: 51.8 },
        subStats: [
          { stat: 'critRate', value: 6.3 },
          { stat: 'attack', value: 68 },
          { stat: 'defense', value: 21 },
          { stat: 'attack%', value: 10.5 },
        ],
      },
      {
        name: 'Goblet of Eonothem',
        set: 'Adventurer',
        slot: ArtifactSlot.Goblet,
        level: 20,
        mainStat: { stat: 'attack%', value: 46.6 },
        subStats: [
          { stat: 'hp', value: 239 },
          { stat: 'energyRecharge', value: 18.1 },
          { stat: 'critDamage', value: 14.0 },
          { stat: 'critRate', value: 9.7 },
        ],
      },
      {
        name: 'Circlet of Logos',
        set: 'Adventurer',
        slot: ArtifactSlot.Circlet,
        level: 20,
        mainStat: { stat: 'healingBonus', value: 35.9 },
        subStats: [
          { stat: 'hp', value: 209 },
          { stat: 'attack', value: 14 },
          { stat: 'attack%', value: 15.7 },
          { stat: 'critDamage', value: 25.7 },
        ],
      },
    ] as const satisfies EquippedArtifact[];
    const bennett = new Bennett(86, sapwoodBlade, artifacts);
    expect(bennett.stats.attack.total).toBeWithinRange(1751, 1);
  });
});

test('artifacts solver', () => {
  const input: Input = {
    level: 20,
    initialSubstats: 'unknown',
    substats: [
      { stat: 'critDmg', displayed: 27.2 },
      { stat: 'critRate', displayed: 6.2 },
      { stat: 'defPct', displayed: 5.8 },
      { stat: 'hpFlat', displayed: 299 },
    ],
  };

  /* const sols = */ solveArtifact4Substats5Star(input);
  // console.log(`solutions = ${sols.length}`);
  // console.log(JSON.stringify(sols.slice(0, 1), null, 2)); // show first 10
});

test('character stats print', () => {
  const sapwoodBlade = new SapwoodBlade(90);
  const artifacts = [
    {
      name: 'Flower of Life',
      set: 'Adventurer',
      slot: ArtifactSlot.Flower,
      level: 0,
      mainStat: { stat: 'hp', value: 717 },
      subStats: [
        { stat: 'elementalMastery', value: 21 },
        { stat: 'attack', value: 18 },
        { stat: 'energyRecharge', value: 5.8 },
      ],
    },
    {
      name: 'Plume of Death',
      set: 'Adventurer',
      slot: ArtifactSlot.Plume,
      level: 20,
      mainStat: { stat: 'attack', value: 311 },
      subStats: [
        { stat: 'energyRecharge', value: 17.5 },
        { stat: 'hp%', value: 4.7 },
        { stat: 'defense%', value: 19.7 },
        { stat: 'attack%', value: 5.8 },
      ],
    },
    {
      name: 'Sands of Eon',
      set: 'Adventurer',
      slot: ArtifactSlot.Sands,
      level: 20,
      mainStat: { stat: 'energyRecharge', value: 51.8 },
      subStats: [
        { stat: 'critRate', value: 6.3 },
        { stat: 'attack', value: 68 },
        { stat: 'defense', value: 21 },
        { stat: 'attack%', value: 10.5 },
      ],
    },
    {
      name: 'Goblet of Eonothem',
      set: 'Adventurer',
      slot: ArtifactSlot.Goblet,
      level: 20,
      mainStat: { stat: 'attack%', value: 46.6 },
      subStats: [
        { stat: 'hp', value: 239 },
        { stat: 'energyRecharge', value: 18.1 },
        { stat: 'critDamage', value: 14.0 },
        { stat: 'critRate', value: 9.7 },
      ],
    },
    {
      name: 'Circlet of Logos',
      set: 'Adventurer',
      slot: ArtifactSlot.Circlet,
      level: 20,
      mainStat: { stat: 'healingBonus', value: 35.9 },
      subStats: [
        { stat: 'hp', value: 209 },
        { stat: 'attack', value: 14 },
        { stat: 'attack%', value: 15.7 },
        { stat: 'critDamage', value: 25.7 },
      ],
    },
  ] as const satisfies EquippedArtifact[];
  const bennett = new Bennett(86, sapwoodBlade, artifacts);
  console.log(printStats(bennett.stats));
});
