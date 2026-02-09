import { Enemy } from '../Enemy';
import { ENEMY_STATS } from '../../constants';
import Phaser from 'phaser';

// Signal: mobile, slide kick, orbital movement
export class Signal extends Enemy {
  private circleAngle: number = 0;

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super({
      scene,
      x,
      groundY,
      texture: 'signal',
      maxHp: ENEMY_STATS.signal.hp,
      speed: ENEMY_STATS.signal.speed,
      damage: ENEMY_STATS.signal.damage,
      score: ENEMY_STATS.signal.score,
      type: 'signal',
    });

    // Override circle state with orbital movement
    this.fsm.addState({
      name: 'circle',
      enter: () => {
        this.playAnim('signal-walk');
        this.stateTimer = 1000 + Math.random() * 600;
        this.circleAngle = Math.atan2(
          this.groundY - (this.player?.groundY || 160),
          this.groundX - (this.player?.groundX || 160)
        );
      },
      update: (dt: number) => {
        if (!this.player) return;
        this.stateTimer -= dt;
        const dtSec = dt / 1000;

        // Orbit around player
        this.circleAngle += 1.5 * dtSec;
        const orbitRadius = 50;
        const targetX = this.player.groundX + Math.cos(this.circleAngle) * orbitRadius;
        const targetY = this.player.groundY + Math.sin(this.circleAngle) * orbitRadius * 0.4;

        const dx = targetX - this.groundX;
        const dy = targetY - this.groundY;
        this.groundX += dx * 3 * dtSec;
        this.groundY += dy * 3 * dtSec;
        this.facing = this.player.groundX > this.groundX ? 1 : -1;

        this.updatePosition();
        if (this.stateTimer <= 0) {
          this.fsm.setState(this.hasAggressionToken ? 'slideKick' : 'idle');
        }
      },
    });

    // Slide kick - unique attack
    this.fsm.addState({
      name: 'slideKick',
      enter: () => {
        this.playAnim('signal-special');
        this.stateTimer = 500;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        this.groundX += this.facing * this.speed * 2.5 * (dt / 1000);
        this.updatePosition();

        // Hit detection during slide
        if (this.stateTimer > 200 && this.stateTimer < 400) {
          this.onAttackHit?.(this.damage, true);
        }

        if (this.stateTimer <= 0) this.fsm.setState('recover');
      },
    });

    // Override attack to sometimes use slide kick
    this.fsm.addState({
      name: 'attackWindup',
      enter: () => {
        this.stateTimer = 200 + Math.random() * 200;
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          // 40% chance of slide kick
          this.fsm.setState(Math.random() < 0.4 ? 'slideKick' : 'attack');
        }
      },
    });
  }
}
