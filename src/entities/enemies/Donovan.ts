import { Enemy } from '../Enemy';
import { Player } from '../Player';
import { ENEMY_STATS } from '../../constants';
import Phaser from 'phaser';

// Donovan: tougher, uppercuts, 30% block chance
export class Donovan extends Enemy {
  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super({
      scene,
      x,
      groundY,
      texture: 'donovan',
      maxHp: ENEMY_STATS.donovan.hp,
      speed: ENEMY_STATS.donovan.speed,
      damage: ENEMY_STATS.donovan.damage,
      score: ENEMY_STATS.donovan.score,
      type: 'donovan',
      blockChance: ENEMY_STATS.donovan.blockChance,
    });

    // Override attack state with uppercut variant
    this.fsm.addState({
      name: 'attack',
      enter: () => {
        this.playAnim('donovan-attack');
        this.stateTimer = 600;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
        // Uppercut has slight forward movement
        this.scene.time.delayedCall(250, () => {
          if (this.fsm.stateName !== 'attack') return;
          this.groundX += this.facing * 8;
          this.onAttackHit?.(this.damage, Math.random() < 0.3); // 30% knockdown
          this.updatePosition();
        });
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) this.fsm.setState('recover');
      },
    });
  }
}
