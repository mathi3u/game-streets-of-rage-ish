import { Enemy, EnemyConfig } from '../Enemy';
import { ENEMY_STATS } from '../../constants';
import Phaser from 'phaser';

// Galsia: basic thug. Simple punches, sometimes picks up knife
export class Galsia extends Enemy {
  private hasKnife: boolean;

  constructor(scene: Phaser.Scene, x: number, groundY: number, hasKnife: boolean = false) {
    super({
      scene,
      x,
      groundY,
      texture: 'galsia',
      maxHp: ENEMY_STATS.galsia.hp,
      speed: ENEMY_STATS.galsia.speed,
      damage: ENEMY_STATS.galsia.damage,
      score: ENEMY_STATS.galsia.score,
      type: 'galsia',
    });
    this.hasKnife = hasKnife;
    if (hasKnife) this.damage += 4;
  }
}
