import { CharacterLevel } from '../../data/types';
import { EquippedArtifact } from '../artifacts/Artifact';
import { Weapon } from '../weapons/Weapon';
import Character from './Character';

export default class Bennett extends Character {
  constructor(
    level: CharacterLevel,
    equippedWeapon: Weapon,
    equippedArtifacts: EquippedArtifact[] = []
  ) {
    super('Bennett', level, equippedWeapon, equippedArtifacts);
  }
}
