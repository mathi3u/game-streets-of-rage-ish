import { Enemy } from '../Enemy';
import { BOSS_STATS } from '../../constants';
import Phaser from 'phaser';

// Abadede: Stage 3 final boss. Charge attack, super armor, power slam
export class Abadede extends Enemy {
  private phase: number = 1;
  private chargeSpeed: number = 0;

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super({
      scene,
      x,
      groundY,
      texture: 'abadede',
      maxHp: BOSS_STATS.abadede.hp,
      speed: BOSS_STATS.abadede.speed,
      damage: BOSS_STATS.abadede.damage,
      score: BOSS_STATS.abadede.score,
      type: 'abadede',
      superArmor: BOSS_STATS.abadede.superArmor,
    });

    // Charge attack - runs at player
    this.fsm.addState({
      name: 'charge',
      enter: () => {
        this.playAnim('abadede-special');
        this.stateTimer = 100; // wind up
        this.chargeSpeed = 0;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
        // Flash red warning
        this.sprite.setTint(0xff4444);
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer > 0) return; // wind up

        this.sprite.clearTint();
        this.chargeSpeed = Math.min(this.chargeSpeed + 300 * (dt / 1000), 200);
        this.groundX += this.facing * this.chargeSpeed * (dt / 1000);
        this.updatePosition();

        // Hit during charge
        this.onAttackHit?.(this.damage + 6, true);

        // Stop after traveling far enough or hitting wall
        if (this.chargeSpeed >= 200) {
          this.stateTimer -= dt;
          if (this.stateTimer < -800) {
            this.scene.cameras.main.shake(100, 0.008);
            this.fsm.setState('recover');
          }
        }
      },
    });

    // Power slam - jumps and slams ground
    this.fsm.addState({
      name: 'powerSlam',
      enter: () => {
        this.playAnim('abadede-special');
        this.stateTimer = 1000;
        this.zVelocity = -200;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
      },
      update: (dt: number) => {
        const dtSec = dt / 1000;
        this.stateTimer -= dt;

        this.groundX += this.facing * 40 * dtSec;
        this.zVelocity += 500 * dtSec;
        this.zHeight -= this.zVelocity * dtSec;

        if (this.zHeight <= 0 && this.zVelocity > 0) {
          this.zHeight = 0;
          this.zVelocity = 0;
          this.onAttackHit?.(this.damage + 8, true);
          this.scene.cameras.main.shake(200, 0.015);
          this.fsm.setState('recover');
        }
        this.updatePosition();
      },
    });

    // Override attackWindup for boss patterns
    this.fsm.addState({
      name: 'attackWindup',
      enter: () => { this.stateTimer = 300; },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          const roll = Math.random();
          if (this.phase >= 2 && roll < 0.25) {
            this.fsm.setState('charge');
          } else if (this.phase >= 2 && roll < 0.45) {
            this.fsm.setState('powerSlam');
          } else if (roll < 0.3) {
            this.fsm.setState('charge');
          } else {
            this.fsm.setState('attack');
          }
        }
      },
    });

    // Override approach to be more aggressive
    this.fsm.addState({
      name: 'approach',
      enter: () => { this.playAnim('abadede-walk'); },
      update: (dt: number) => {
        if (!this.player) return;
        const dist = this.distanceTo(this.player);
        const dtSec = dt / 1000;
        const spd = this.phase >= 3 ? this.speed * 1.4 : this.speed;

        const dx = this.player.groundX - this.groundX;
        const dy = this.player.groundY - this.groundY;
        const mag = Math.sqrt(dx * dx + dy * dy);

        if (mag > 2) {
          this.groundX += (dx / mag) * spd * dtSec;
          this.groundY += (dy / mag) * spd * 0.5 * dtSec;
          this.facing = dx > 0 ? 1 : -1;
        }

        if (dist.dx < 40 && dist.dy < 14) {
          this.fsm.setState('attackWindup');
        }
        this.updatePosition();
      },
    });
  }

  override takeDamage(amount: number): void {
    // Super armor: only flinch on big hits
    super.takeDamage(amount);

    // Phase transitions
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.66 && this.phase === 1) {
      this.phase = 2;
      this.speed *= 1.15;
      this.sprite.setTint(0xff8844);
      this.scene.time.delayedCall(300, () => {
        if (this.sprite) this.sprite.clearTint();
      });
    }
    if (hpRatio <= 0.33 && this.phase === 2) {
      this.phase = 3;
      this.speed *= 1.15;
      this.damage += 4;
      this.sprite.setTint(0xff2222);
      this.scene.time.delayedCall(500, () => {
        if (this.sprite) this.sprite.clearTint();
      });
    }
  }
}
