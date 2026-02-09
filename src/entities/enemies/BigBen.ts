import { Enemy } from '../Enemy';
import { ENEMY_STATS } from '../../constants';
import Phaser from 'phaser';

// BigBen: body splash, fire breath, super armor
export class BigBen extends Enemy {
  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super({
      scene,
      x,
      groundY,
      texture: 'bigben',
      maxHp: ENEMY_STATS.bigben.hp,
      speed: ENEMY_STATS.bigben.speed,
      damage: ENEMY_STATS.bigben.damage,
      score: ENEMY_STATS.bigben.score,
      type: 'bigben',
      superArmor: ENEMY_STATS.bigben.superArmor,
    });

    // Body splash attack
    this.fsm.addState({
      name: 'bodySplash',
      enter: () => {
        this.playAnim('bigben-special');
        this.stateTimer = 800;
        this.zVelocity = -150;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
      },
      update: (dt: number) => {
        const dtSec = dt / 1000;
        this.stateTimer -= dt;

        // Jump arc toward player
        this.groundX += this.facing * this.speed * 2 * dtSec;
        this.zVelocity += 400 * dtSec;
        this.zHeight -= this.zVelocity * dtSec;

        if (this.zHeight <= 0 && this.zVelocity > 0) {
          this.zHeight = 0;
          this.zVelocity = 0;
          // Landing damage in area
          this.onAttackHit?.(this.damage + 4, true);
          this.scene.cameras.main.shake(150, 0.01);
          this.fsm.setState('recover');
        }
        this.updatePosition();
      },
    });

    // Fire breath attack
    this.fsm.addState({
      name: 'fireBreath',
      enter: () => {
        this.playAnim('bigben-special');
        this.stateTimer = 900;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
        // Create fire visual
        const fireX = this.groundX + this.facing * 28;
        const fireY = this.groundY - 28;
        const fire = this.scene.add.rectangle(fireX, fireY, 40, 10, 0xff4400, 0.8);
        fire.depth = this.groundY + 1;
        this.scene.tweens.add({
          targets: fire,
          x: fireX + this.facing * 56,
          alpha: 0,
          scaleX: 2,
          duration: 500,
          onComplete: () => fire.destroy(),
        });
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer > 400 && this.stateTimer < 700) {
          this.onAttackHit?.(this.damage, false);
        }
        if (this.stateTimer <= 0) this.fsm.setState('recover');
      },
    });

    // Override attackWindup to choose between attacks
    this.fsm.addState({
      name: 'attackWindup',
      enter: () => { this.stateTimer = 400; },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.3) {
            this.fsm.setState('bodySplash');
          } else if (roll < 0.6) {
            this.fsm.setState('fireBreath');
          } else {
            this.fsm.setState('attack');
          }
        }
      },
    });
  }
}
