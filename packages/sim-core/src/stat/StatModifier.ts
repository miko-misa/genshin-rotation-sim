import { CharacterStatKey, CharacterStats } from './CharacterStats';
import { Stat } from './Stat';

export default abstract class StatModifier {
  abstract baseStats: CharacterStats | null;
  abstract startTime: number;
  abstract endTime: number;
  abstract modify(newStat: CharacterStats): void;
}

/**
 * 単純にパーセンテージもしくは固定値でステータスを増加させるバフ
 * 例: 攻撃力+20%、会心率+15%
 * 変換ステータスではない
 */
export class FixedStatModifier extends StatModifier {
  baseStats: CharacterStats | null = null;
  constructor(
    public startTime: number,
    public endTime: number,
    public targetKey: CharacterStatKey,
    public inscrease: Stat
  ) {
    super();
  }

  modify(newStat: CharacterStats): void {
    newStat[this.targetKey].add(this.inscrease);
  }
}
