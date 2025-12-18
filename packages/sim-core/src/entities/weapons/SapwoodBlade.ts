import { WeaponLevel } from '../../data/types';
import EventBus from '../../event/EventBus';
import { CharacterStats } from '../../stat/CharacterStats';
import { Weapon } from './Weapon';

export default class SapwoodBlade extends Weapon {
  constructor(level: WeaponLevel) {
    super('SapwoodBlade', level);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyPassiveModifiers(newStats: CharacterStats): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyEffects(bus: EventBus): void {}
}
