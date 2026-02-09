import { Enemy } from '../Enemy';
import { BOSS_STATS } from '../../constants';
import Phaser from 'phaser';

// Barbon: Stage 1 boss. Punches/kicks/grabs, 2 phases
export class Barbon extends Enemy {
  private phase: number = 1;

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super({
      scene,
      x,
      groundY,
      texture: 'barbon',
      maxHp: BOSS_STATS.barbon.hp,
      speed: BOSS_STATS.barbon.speed,
      damage: BOSS_STATS.barbon.damage,
      score: BOSS_STATS.barbon.score,
      type: 'barbon',
    });

    // Barbon's approach - more aggressive
    this.fsm.addState({
      name: 'approach',
      enter: () => { this.playAnim('barbon-walk'); },
      update: (dt: number) => {
        if (!this.player) return;
        const dist = this.distanceTo(this.player);
        const dtSec = dt / 1000;
        const spd = this.phase === 2 ? this.speed * 1.3 : this.speed;

        const dx = this.player.groundX - this.groundX;
        const dy = this.player.groundY - this.groundY;
        const mag = Math.sqrt(dx * dx + dy * dy);

        if (mag > 2) {
          this.groundX += (dx / mag) * spd * dtSec;
          this.groundY += (dy / mag) * spd * 0.6 * dtSec;
          this.facing = dx > 0 ? 1 : -1;
        }

        if (dist.dx < 38 && dist.dy < 14) {
          this.fsm.setState('attackWindup');
        }
        this.updatePosition();
      },
    });

    // Boss grab
    this.fsm.addState({
      name: 'bossGrab',
      enter: () => {
        this.playAnim('barbon-special');
        this.stateTimer = 700;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
        // Lunge forward
        this.scene.time.delayedCall(200, () => {
          if (this.fsm.stateName !== 'bossGrab') return;
          this.groundX += this.facing * 15;
          this.onAttackHit?.(this.damage + 4, true);
          this.updatePosition();
        });
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) this.fsm.setState('recover');
      },
    });

    // Override attackWindup for boss attack patterns
    this.fsm.addState({
      name: 'attackWindup',
      enter: () => { this.stateTimer = 200 + Math.random() * 200; },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          const roll = Math.random();
          if (this.phase === 2 && roll < 0.35) {
            this.fsm.setState('bossGrab');
          } else {
            this.fsm.setState('attack');
          }
        }
      },
    });
  }

  override takeDamage(amount: number): void {
    super.takeDamage(amount);
    // Phase 2 at 50% HP
    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.speed *= 1.2;
      // Flash red briefly
      this.sprite.setTint(0xff4444);
      this.scene.time.delayedCall(500, () => {
        if (this.sprite) this.sprite.clearTint();
      });
    }
  }
}
