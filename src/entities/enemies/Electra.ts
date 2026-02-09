import { Enemy } from '../Enemy';
import { ENEMY_STATS } from '../../constants';
import Phaser from 'phaser';

// Electra: medium range whip, prefers distance
export class Electra extends Enemy {
  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super({
      scene,
      x,
      groundY,
      texture: 'electra',
      maxHp: ENEMY_STATS.electra.hp,
      speed: ENEMY_STATS.electra.speed,
      damage: ENEMY_STATS.electra.damage,
      score: ENEMY_STATS.electra.score,
      type: 'electra',
    });

    // Override approach to keep distance
    this.fsm.addState({
      name: 'approach',
      enter: () => { this.playAnim('electra-walk'); },
      update: (dt: number) => {
        if (!this.player) return;
        const dist = this.distanceTo(this.player);
        const dtSec = dt / 1000;

        // Electra prefers medium range (40-50 px)
        const idealDist = 56;
        const dx = this.player.groundX - this.groundX;
        const dy = (this.assignedSlot?.y || this.player.groundY) - this.groundY;

        if (dist.dx > idealDist + 10) {
          this.groundX += Math.sign(dx) * this.speed * dtSec;
        } else if (dist.dx < idealDist - 10) {
          // Back away
          this.groundX -= Math.sign(dx) * this.speed * 0.5 * dtSec;
        }

        if (Math.abs(dy) > 4) {
          this.groundY += Math.sign(dy) * this.speed * 0.6 * dtSec;
        }

        this.facing = dx > 0 ? 1 : -1;
        this.updatePosition();

        // Attack from range
        if (dist.dx < 66 && dist.dx > 28 && dist.dy < 14 && this.hasAggressionToken) {
          this.fsm.setState('attackWindup');
        }
      },
    });

    // Whip attack - longer range
    this.fsm.addState({
      name: 'attack',
      enter: () => {
        this.playAnim('electra-attack');
        this.stateTimer = 600;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
        // Whip has longer reach
        this.scene.time.delayedCall(250, () => {
          if (this.fsm.stateName !== 'attack') return;
          this.onAttackHit?.(this.damage, false);
        });
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          // Electra backs away after attacking
          this.fsm.setState('retreat');
        }
      },
    });

    // Retreat state
    this.fsm.addState({
      name: 'retreat',
      enter: () => {
        this.playAnim('electra-walk');
        this.stateTimer = 400;
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        this.groundX -= this.facing * this.speed * (dt / 1000);
        this.updatePosition();
        if (this.stateTimer <= 0) this.fsm.setState('circle');
      },
    });
  }
}
