import { Enemy } from '../Enemy';
import { BOSS_STATS, GROUND_Y_MIN, GROUND_Y_MAX } from '../../constants';
import Phaser from 'phaser';

// Jet: Stage 2 boss. Jetpack flight, dive kicks
export class Jet extends Enemy {
  private flightTimer: number = 0;
  private isFlying: boolean = false;

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super({
      scene,
      x,
      groundY,
      texture: 'jet',
      maxHp: BOSS_STATS.jet.hp,
      speed: BOSS_STATS.jet.speed,
      damage: BOSS_STATS.jet.damage,
      score: BOSS_STATS.jet.score,
      type: 'jet',
    });

    // Fly state - hover above ground
    this.fsm.addState({
      name: 'fly',
      enter: () => {
        this.playAnim('jet-walk');
        this.isFlying = true;
        this.flightTimer = 2000 + Math.random() * 1000;
        this.zHeight = 30;
      },
      update: (dt: number) => {
        if (!this.player) return;
        const dtSec = dt / 1000;
        this.flightTimer -= dt;

        // Hover and move toward player
        const dx = this.player.groundX - this.groundX;
        const dy = this.player.groundY - this.groundY;
        this.groundX += Math.sign(dx) * this.speed * 1.2 * dtSec;
        this.groundY += Math.sign(dy) * this.speed * 0.4 * dtSec;
        this.facing = dx > 0 ? 1 : -1;

        // Bob up and down
        this.zHeight = 30 + Math.sin(this.flightTimer * 0.005) * 5;

        this.updatePosition();

        if (this.flightTimer <= 0) {
          const dist = this.distanceTo(this.player);
          if (dist.dx < 80) {
            this.fsm.setState('diveKick');
          } else {
            this.fsm.setState('fly'); // re-enter to reset timer
          }
        }
      },
    });

    // Dive kick - fast diagonal attack
    this.fsm.addState({
      name: 'diveKick',
      enter: () => {
        this.playAnim('jet-special');
        this.stateTimer = 600;
        if (this.player) {
          this.facing = this.player.groundX > this.groundX ? 1 : -1;
        }
      },
      update: (dt: number) => {
        const dtSec = dt / 1000;
        this.stateTimer -= dt;

        // Dive down and forward
        this.groundX += this.facing * this.speed * 3 * dtSec;
        this.zHeight -= 100 * dtSec;

        if (this.zHeight <= 0) {
          this.zHeight = 0;
          this.onAttackHit?.(this.damage + 2, true);
          this.scene.cameras.main.shake(100, 0.005);
          this.isFlying = false;
          this.fsm.setState('recover');
        }
        this.updatePosition();
      },
    });

    // Override idle to take flight
    this.fsm.addState({
      name: 'idle',
      enter: () => {
        this.playAnim('jet-idle');
        this.stateTimer = 300 + Math.random() * 400;
      },
      update: (dt: number) => {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          // Jet prefers to be airborne
          this.fsm.setState(Math.random() < 0.6 ? 'fly' : 'approach');
        }
      },
    });

    // Override approach
    this.fsm.addState({
      name: 'approach',
      enter: () => { this.playAnim('jet-walk'); },
      update: (dt: number) => {
        if (!this.player) return;
        const dist = this.distanceTo(this.player);
        const dtSec = dt / 1000;

        const dx = this.player.groundX - this.groundX;
        const dy = this.player.groundY - this.groundY;
        this.groundX += Math.sign(dx) * this.speed * dtSec;
        this.groundY += Math.sign(dy) * this.speed * 0.5 * dtSec;
        this.facing = dx > 0 ? 1 : -1;

        if (dist.dx < 40 && dist.dy < 14 && this.hasAggressionToken) {
          this.fsm.setState('attackWindup');
        }

        // Random chance to take flight
        if (Math.random() < 0.005) {
          this.fsm.setState('fly');
        }

        this.updatePosition();
      },
    });
  }

  override hitByPlayer(damage: number, knockdown: boolean, fromX: number): void {
    if (this.isFlying) {
      // Reduced damage while flying
      damage = Math.floor(damage * 0.7);
      // Knockdown grounds Jet
      if (knockdown) {
        this.isFlying = false;
        this.zVelocity = 100;
      }
    }
    super.hitByPlayer(damage, knockdown, fromX);
  }
}
