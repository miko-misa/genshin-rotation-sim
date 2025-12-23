export type StatKind = 'scaling' | 'additive';

export abstract class Stat {
  constructor(public base: number) {}
  abstract readonly kind: StatKind;
  abstract get total(): number;

  addPercentBonus(percent: number): void {
    throw new Error(`Percent bonus (${percent}) is not supported for '${this.kind}' stats.`);
  }

  addFlatBonus(flat: number): void {
    throw new Error(`Flat bonus (${flat}) is not supported for '${this.kind}' stats.`);
  }

  abstract add(other: Stat): void;
}

export class ScalingStat extends Stat {
  override readonly kind: StatKind = 'scaling';
  public percentBonus: number;
  public flatBonus: number;

  constructor(base: number, percentBonus: number = 0, flatBonus: number = 0) {
    super(base);
    this.percentBonus = percentBonus;
    this.flatBonus = flatBonus;
  }

  override get total(): number {
    return this.base * (1 + this.percentBonus / 100) + this.flatBonus;
  }

  override addPercentBonus(percent: number): void {
    this.percentBonus += percent;
  }

  override addFlatBonus(flat: number): void {
    this.flatBonus += flat;
  }

  override add(other: Stat): void {
    if (!(other instanceof ScalingStat)) {
      throw new Error('Cannot add different stat kinds together.');
    }
    this.base += other.base;
    this.percentBonus += other.percentBonus;
    this.flatBonus += other.flatBonus;
  }
}

export class AdditiveStat extends Stat {
  override readonly kind: StatKind = 'additive';
  public flatBonus: number;

  constructor(base: number, flatBonus: number = 0) {
    super(base);
    this.flatBonus = flatBonus;
  }

  override get total(): number {
    return this.base + this.flatBonus;
  }

  override addFlatBonus(flat: number): void {
    this.flatBonus += flat;
  }

  override add(other: Stat): void {
    if (!(other instanceof AdditiveStat)) {
      throw new Error('Cannot add different stat kinds together.');
    }
    this.base += other.base;
    this.flatBonus += other.flatBonus;
  }
}

export class FlatStat extends AdditiveStat {
  constructor(flatBonus: number) {
    super(0, flatBonus);
  }
}
