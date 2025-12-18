import { WeaponLevel } from '../../data/types';
import EventBus from '../../event/EventBus';
import { CharacterStats } from '../../stat/CharacterStats';
import { FlatStat } from '../../stat/Stat';
import { FixedStatModifier } from '../../stat/StatModifier';
import { Weapon } from './Weapon';

export class SkywardBlade extends Weapon {
  constructor(level: WeaponLevel) {
    super('Skyward Blade', level);
  }
  applyPassiveModifiers(newStats: CharacterStats): void {
    // CRIT Rate +4.0%
    new FixedStatModifier(0, Infinity, 'critRate', new FlatStat(4.0)).modify(newStats);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyEffects(bus: EventBus): void {}
}
