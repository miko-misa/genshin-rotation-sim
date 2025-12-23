/**
 * Genshin Artifact 4-substats solver (5★, +4 or higher)
 * - Input: 4 displayed substats (the in-game shown values)
 * - Output: all feasible internal totals (0.01 precision) and roll decompositions
 *
 * Assumptions (5★):
 * - At +0, artifact starts with either 3 or 4 substats.
 * - Every 4 levels: if fewer than 4 substats -> adds a new one; else -> upgrades one substat by one roll.
 * - Substat roll values are fixed candidates (4 tiers) per stat.
 * - Internal values are precise to 0.01; displayed values are rounded half-up:
 *    - Flat stats shown as integer
 *    - Percent stats shown with 1 decimal
 */

type Substat =
  | 'hpFlat'
  | 'atkFlat'
  | 'defFlat'
  | 'em'
  | 'hpPct'
  | 'atkPct'
  | 'defPct'
  | 'erPct'
  | 'critRate'
  | 'critDmg';

export type Input = {
  level: number; // 0..20
  // 3/4 or unknown. If omitted, solver tries both.
  initialSubstats?: 3 | 4 | 'unknown';
  substats: Array<{ stat: Substat; displayed: number }>; // must be length 4, unique stats
};

type RollDecomp = {
  // counts per tier (same order as rollValues array)
  counts: number[];
  sum100: number; // internal sum scaled by 100
};

type StatSolution = RollDecomp & {
  rolls: number; // total roll count for this stat
};

type FullSolution = {
  initialSubstats: 3 | 4;
  totalRolls: number;
  // per stat (aligned with input order)
  perStat: Array<{
    stat: Substat;
    displayed: number;
    internal: number; // = sum100 / 100
    rolls: number;
    tierCounts: number[];
    rollValues: number[]; // internal tier values (as float)
  }>;
};

const DECIMALS: Record<Substat, 0 | 1> = {
  hpFlat: 0,
  atkFlat: 0,
  defFlat: 0,
  em: 0,
  hpPct: 1,
  atkPct: 1,
  defPct: 1,
  erPct: 1,
  critRate: 1,
  critDmg: 1,
};

// 5★ roll values (internal, exact to 0.01). Source: KQM / Genshin wiki tables.
const ROLL_5STAR: Record<Substat, number[]> = {
  hpFlat: [209.13, 239.0, 268.88, 298.75],
  atkFlat: [13.62, 15.56, 17.51, 19.45],
  defFlat: [16.2, 18.52, 20.83, 23.15],
  hpPct: [4.08, 4.66, 5.25, 5.83],
  atkPct: [4.08, 4.66, 5.25, 5.83],
  defPct: [5.1, 5.83, 6.56, 7.29],
  em: [16.32, 18.65, 20.98, 23.31],
  erPct: [4.53, 5.18, 5.83, 6.48],
  critRate: [2.72, 3.11, 3.5, 3.89],
  critDmg: [5.44, 6.22, 6.99, 7.77],
};

/**
 * Small epsilon value used to guard against floating-point representation issues.
 * Chosen to be:
 * - Small enough to be negligible for our rounding scales (< 0.0001), and
 * - Large enough to comfortably exceed typical IEEE 754 double-precision noise
 *   around these magnitudes (~1e-15) with a conservative safety margin.
 * This helps ensure that values like 0.5 or 1.5 (which may be represented as
 * 0.499...9 or 1.499...9 in binary) round correctly in half-up operations.
 */
const FLOAT_EPSILON = 1e-12;

// ----- rounding helpers (half-up) -----
function roundHalfUp(x: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.floor(x * f + 0.5 + FLOAT_EPSILON) / f;
}

// Convert displayed value -> allowed internal range (scaled by 100) inclusive: [lo, hi]
function internalRange100(displayed: number, decimals: 0 | 1): [number, number] {
  if (decimals === 1) {
    const tenth = Math.round(displayed * 10 + FLOAT_EPSILON); // e.g. 11.5 -> 115
    const center = tenth * 10; // back to hundredths
    // half-up to 0.1 means internal in [d-0.05, d+0.05)
    // in hundredths: [center-5, center+4] inclusive
    return [center - 5, center + 4];
  } else {
    const integer = Math.round(displayed + FLOAT_EPSILON);
    const center = integer * 100;
    // half-up to integer means internal in [D-0.5, D+0.5)
    // in hundredths: [center-50, center+49] inclusive
    return [center - 50, center + 49];
  }
}

// Enumerate all nonnegative integer vectors of length n summing to k
function enumerateCounts(k: number, n: number): number[][] {
  const out: number[][] = [];
  const cur = new Array(n).fill(0);

  function dfs(i: number, remaining: number) {
    if (i === n - 1) {
      cur[i] = remaining;
      out.push([...cur]);
      return;
    }
    for (let c = 0; c <= remaining; c++) {
      cur[i] = c;
      dfs(i + 1, remaining - c);
    }
  }
  dfs(0, k);
  return out;
}

// Generate per-stat feasible sums for a fixed roll count, filtered by displayed range + exact rounding check
function feasibleStatSolutions(stat: Substat, displayed: number, rolls: number): StatSolution[] {
  const decimals = DECIMALS[stat];
  const [lo, hi] = internalRange100(displayed, decimals);
  const tiers = ROLL_5STAR[stat].map((v) => Math.round(v * 100)); // store as int hundredths
  const countVectors = enumerateCounts(rolls, tiers.length);

  const sols: StatSolution[] = [];
  for (const counts of countVectors) {
    let sum = 0;
    for (let i = 0; i < tiers.length; i++) sum += counts[i] * tiers[i];
    if (sum < lo || sum > hi) continue;

    const internal = sum / 100;
    if (roundHalfUp(internal, decimals) !== displayed) continue;

    sols.push({ rolls, counts, sum100: sum });
  }

  // Deduplicate by (sum, counts)
  const uniq = new Map<string, StatSolution>();
  for (const s of sols) {
    uniq.set(`${s.sum100}|${s.counts.join(',')}`, s);
  }
  return [...uniq.values()].sort((a, b) => a.sum100 - b.sum100);
}

// Enumerate roll-count vectors (k1..k4) with constraints
function enumerateRollVectors(totalRolls: number, maxPerStat: number): number[][] {
  const out: number[][] = [];
  // 4 stats, each >=1
  for (let k1 = 1; k1 <= maxPerStat; k1++) {
    for (let k2 = 1; k2 <= maxPerStat; k2++) {
      for (let k3 = 1; k3 <= maxPerStat; k3++) {
        const k4 = totalRolls - (k1 + k2 + k3);
        if (k4 < 1 || k4 > maxPerStat) continue;
        out.push([k1, k2, k3, k4]);
      }
    }
  }
  return out;
}

function validateInput(input: Input) {
  if (input.substats.length !== 4) throw new Error('substats must be length 4');
  const seen = new Set<string>();
  for (const s of input.substats) {
    if (seen.has(s.stat)) throw new Error('substats must be unique (no duplicates)');
    seen.add(s.stat);
    if (!Number.isFinite(s.displayed)) throw new Error('displayed must be finite number');
  }
  if (!Number.isInteger(input.level) || input.level < 0 || input.level > 20) {
    throw new Error('level must be an integer in [0, 20] for 5★');
  }
  // For 4 substats visible, you need at least +4 if it started as 3-liner.
  // We allow level >= 4 generally; if level < 4, only initial=4 is possible (still 4 substats at +0).
}

export function solveArtifact4Substats5Star(input: Input): FullSolution[] {
  validateInput(input);

  const level = input.level;
  const events = Math.floor(level / 4); // number of "every 4 levels" triggers (0..5)
  const initMode = input.initialSubstats ?? 'unknown';
  const initCandidates: Array<3 | 4> = initMode === 'unknown' ? [3, 4] : [initMode];

  const results: FullSolution[] = [];
  const stats = input.substats;

  for (const initialSubstats of initCandidates) {
    // Need 4 substats present at current level; if initial=3 and level<4 => impossible.
    if (initialSubstats === 3 && level < 4) continue;

    // Total rolls accounting:
    // base 4 rolls (one per visible substat)
    // + initial=4: all events are upgrades => +events
    // + initial=3: first event is "unlock 4th substat" (already included in base 4), remaining events-1 are upgrades => +(events-1)
    const totalRolls = initialSubstats === 4 ? 4 + events : 4 + Math.max(0, events - 1);

    // Maximum rolls a single stat can have:
    // base 1 + number of upgrades it could receive (events or events-1)
    const maxPerStat = initialSubstats === 4 ? 1 + events : 1 + Math.max(0, events - 1);

    // Precompute feasible per-stat solutions grouped by roll count
    const perStatByRolls: Array<Map<number, StatSolution[]>> = stats.map(({ stat, displayed }) => {
      const m = new Map<number, StatSolution[]>();
      for (let r = 1; r <= maxPerStat; r++) {
        const sols = feasibleStatSolutions(stat, displayed, r);
        if (sols.length > 0) m.set(r, sols);
      }
      return m;
    });

    // Enumerate roll-count vectors
    const rollVectors = enumerateRollVectors(totalRolls, maxPerStat);

    for (const kv of rollVectors) {
      // Quick prune: all stats must have at least one candidate with that roll count
      let ok = true;
      for (let i = 0; i < 4; i++) {
        if (!perStatByRolls[i].has(kv[i])) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      // Combine candidates across 4 stats
      const lists = kv.map((k, i) => perStatByRolls[i].get(k)!) as StatSolution[][];

      for (const s0 of lists[0]) {
        for (const s1 of lists[1]) {
          for (const s2 of lists[2]) {
            for (const s3 of lists[3]) {
              results.push({
                initialSubstats,
                totalRolls,
                perStat: [
                  {
                    stat: stats[0].stat,
                    displayed: stats[0].displayed,
                    internal: s0.sum100 / 100,
                    rolls: s0.rolls,
                    tierCounts: s0.counts,
                    rollValues: ROLL_5STAR[stats[0].stat],
                  },
                  {
                    stat: stats[1].stat,
                    displayed: stats[1].displayed,
                    internal: s1.sum100 / 100,
                    rolls: s1.rolls,
                    tierCounts: s1.counts,
                    rollValues: ROLL_5STAR[stats[1].stat],
                  },
                  {
                    stat: stats[2].stat,
                    displayed: stats[2].displayed,
                    internal: s2.sum100 / 100,
                    rolls: s2.rolls,
                    tierCounts: s2.counts,
                    rollValues: ROLL_5STAR[stats[2].stat],
                  },
                  {
                    stat: stats[3].stat,
                    displayed: stats[3].displayed,
                    internal: s3.sum100 / 100,
                    rolls: s3.rolls,
                    tierCounts: s3.counts,
                    rollValues: ROLL_5STAR[stats[3].stat],
                  },
                ],
              });
            }
          }
        }
      }
    }
  }

  return results;
}
