import { CharacterLevel, WeaponLevel } from './data/types';

// ヘルパー関数: レベルと突破段階を計算
export function getLevelAndAscension(level: CharacterLevel | WeaponLevel): {
  levelNum: number;
  ascension: number;
} {
  const levelNum = Math.floor(level);
  // レベル90以上は最大突破段階(6)とする
  if (levelNum >= 90) return { levelNum, ascension: 6 };

  // 突破段階の計算: レベル20以下は0、それ以降はレベルに応じて計算
  const ascension = level > 20 ? Math.max(1, Math.ceil(level / 10) - 3) : 0;
  return { levelNum, ascension };
}
