import Phaser from 'phaser';
import { Entity } from './Entity';
import { Player } from './Player';
import { StateMachine } from '../ai/StateMachine';
import {
  KNOCKBACK_SPEED, KNOCKDOWN_DURATION_MS, HURT_STUN_MS,
  DEATH_DURATION_MS, GETUP_DURATION_MS, GROUND_Y_MIN, GROUND_Y_MAX,
  AI_REACT_DELAY_MS,
} from '../constants';

export interface EnemyConfig {
  scene: Phaser.Scene;
  x: number;
  groundY: number;
  texture: string;
  maxHp: number;
  speed: number;
  damage: number;
  score: number;
  type: string;
  blockChance?: number;
  superArmor?: boolean;
}

export class Enemy extends Entity {
  fsm: StateMachine;
  type: string;
  damage: number;
  scoreValue: number;
  canBlock: boolean;
  blockChance: number;
  hasSuperArmor: boolean;
  stateTimer: number = 0;
  knockbackVelX: number = 0;
  player: Player | null = null;

  // AI
  hasAggressionToken: boolean = false;
  assignedSlot: { x: number; y: number } | null = null;

  // Attack callback
  onAttackHit?: (damage: number, knockdown: boolean) => void;
  onDeath?: (enemy: Enemy) => void;

  constructor(config: EnemyConfig) {
    super({
      scene: config.scene,
      x: config.x,
      groundY: config.groundY,
      texture: config.texture,
      maxHp: config.maxHp,
      speed: config.speed,
    });
    this.type = config.type;
    this.damage = config.damage;
    this.scoreValue = config.score;
    this.canBlock = (config.blockChance || 0) > 0;
    this.blockChance = config.blockChance || 0;
    this.hasSuperArmor = config.superArmor || false;
    this.sprite.name = `${config.type}_${Phaser.Math.RND.integer()}`;

    this.fsm = new StateMachine();
    this.setupBaseStates();
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  protected setupBaseStates(): void {
    const self = this;

    this.fsm.addState({
      name: 'idle',
      enter() { self.playAnim(`${self.type}-idle`); self.stateTimer = 500 + Math.random() * 500; },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0 && self.player) {
          self.fsm.setState('approach');
        }
      },
    });

    this.fsm.addState({
      name: 'approach',
      enter() { self.playAnim(`${self.type}-walk`); },
      update(dt) {
        if (!self.player) return;
        const dist = self.distanceTo(self.player);
        const dtSec = dt / 1000;

        // Move toward player (or assigned slot)
        const targetX = self.assignedSlot ? self.assignedSlot.x : self.player.groundX;
        const targetY = self.assignedSlot ? self.assignedSlot.y : self.player.groundY;

        const dx = targetX - self.groundX;
        const dy = targetY - self.groundY;
        const mag = Math.sqrt(dx * dx + dy * dy);

        if (mag > 2) {
          self.groundX += (dx / mag) * self.speed * dtSec;
          self.groundY += (dy / mag) * self.speed * dtSec;
          self.facing = dx > 0 ? 1 : -1;
        }

        // In attack range?
        if (dist.dx < 40 && dist.dy < 14 && self.hasAggressionToken) {
          self.fsm.setState('attackWindup');
        }

        self.updatePosition();
      },
    });

    this.fsm.addState({
      name: 'circle',
      enter() {
        self.playAnim(`${self.type}-walk`);
        self.stateTimer = 800 + Math.random() * 800;
      },
      update(dt) {
        if (!self.player) return;
        self.stateTimer -= dt;
        const dtSec = dt / 1000;

        // Circle around the player
        const circleDir = self.groundY > self.player.groundY ? -1 : 1;
        self.groundY += circleDir * self.speed * 0.5 * dtSec;

        // Maintain distance
        const dx = self.player.groundX - self.groundX;
        self.facing = dx > 0 ? 1 : -1;

        if (self.stateTimer <= 0) {
          if (self.hasAggressionToken) {
            self.fsm.setState('approach');
          } else {
            self.fsm.setState('idle');
          }
        }
        self.updatePosition();
      },
    });

    this.fsm.addState({
      name: 'attackWindup',
      enter() {
        self.stateTimer = AI_REACT_DELAY_MS + Math.random() * 200;
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) {
          self.fsm.setState('attack');
        }
      },
    });

    this.fsm.addState({
      name: 'attack',
      enter() {
        self.playAnim(`${self.type}-attack`);
        self.stateTimer = 500;
        // Face player
        if (self.player) {
          self.facing = self.player.groundX > self.groundX ? 1 : -1;
        }
        self.scene.time.delayedCall(200, () => {
          if (self.fsm.stateName !== 'attack') return;
          self.onAttackHit?.(self.damage, false);
        });
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) self.fsm.setState('recover');
      },
    });

    this.fsm.addState({
      name: 'recover',
      enter() {
        self.playAnim(`${self.type}-idle`);
        self.stateTimer = 600 + Math.random() * 400;
      },
      update(dt) {
        self.stateTimer -= dt;
        // Back away slightly
        if (self.player) {
          const dx = self.groundX - self.player.groundX;
          self.groundX += Math.sign(dx) * self.speed * 0.3 * (dt / 1000);
          self.updatePosition();
        }
        if (self.stateTimer <= 0) {
          self.fsm.setState(self.hasAggressionToken ? 'approach' : 'circle');
        }
      },
    });

    this.fsm.addState({
      name: 'hurt',
      enter() {
        self.playAnim(`${self.type}-hurt`);
        self.stateTimer = HURT_STUN_MS;
      },
      update(dt) {
        self.stateTimer -= dt;
        self.groundX += self.knockbackVelX * (dt / 1000);
        self.updatePosition();
        if (self.stateTimer <= 0) {
          self.knockbackVelX = 0;
          self.fsm.setState(self.alive ? 'idle' : 'death');
        }
      },
    });

    this.fsm.addState({
      name: 'knockdown',
      enter() {
        self.playAnim(`${self.type}-knockdown`);
        self.stateTimer = KNOCKDOWN_DURATION_MS;
        self.zVelocity = -80;
      },
      update(dt) {
        const dtSec = dt / 1000;
        self.stateTimer -= dt;
        self.groundX += self.knockbackVelX * dtSec;

        self.zVelocity += 500 * dtSec;
        self.zHeight -= self.zVelocity * dtSec;
        if (self.zHeight <= 0) {
          self.zHeight = 0;
          self.zVelocity = 0;
          self.knockbackVelX *= 0.5;
        }

        self.updatePosition();
        if (self.stateTimer <= 0) {
          self.knockbackVelX = 0;
          if (self.alive) {
            self.fsm.setState('getup');
          } else {
            self.fsm.setState('death');
          }
        }
      },
    });

    this.fsm.addState({
      name: 'getup',
      enter() {
        self.playAnim(`${self.type}-idle`);
        self.stateTimer = GETUP_DURATION_MS;
        self.invulnerable = true;
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) {
          self.invulnerable = false;
          self.fsm.setState('idle');
        }
      },
    });

    this.fsm.addState({
      name: 'block',
      enter() {
        self.playAnim(`${self.type}-block`);
        self.stateTimer = 400;
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) self.fsm.setState('recover');
      },
    });

    this.fsm.addState({
      name: 'death',
      enter() {
        self.playAnim(`${self.type}-death`);
        if (self.scene.cache.audio.exists('sfx-enemy-death')) {
          self.scene.sound.play('sfx-enemy-death', { volume: 0.5 });
        }
        self.stateTimer = DEATH_DURATION_MS;
        self.alive = false;
      },
      update(dt) {
        self.stateTimer -= dt;
        self.sprite.alpha = Math.max(0, self.stateTimer / DEATH_DURATION_MS);
        if (self.stateTimer <= 0) {
          self.onDeath?.(self);
        }
      },
    });

    // Thrown state (from player grab)
    this.fsm.addState({
      name: 'thrown',
      enter() {
        self.playAnim(`${self.type}-knockdown`);
        self.stateTimer = 800;
        self.zVelocity = -120;
      },
      update(dt) {
        const dtSec = dt / 1000;
        self.stateTimer -= dt;
        self.groundX += self.knockbackVelX * dtSec;
        self.zVelocity += 500 * dtSec;
        self.zHeight -= self.zVelocity * dtSec;
        if (self.zHeight <= 0) {
          self.zHeight = 0;
          self.zVelocity = 0;
          self.knockbackVelX *= 0.3;
        }
        self.updatePosition();
        if (self.stateTimer <= 0) {
          self.knockbackVelX = 0;
          if (self.alive) {
            self.fsm.setState('getup');
          } else {
            self.fsm.setState('death');
          }
        }
      },
    });
  }

  playAnim(key: string): void {
    if (this.scene.anims.exists(key)) {
      this.sprite.play(key, true);
    }
  }

  update(dt: number): void {
    this.fsm.update(dt);
    this.updateInvulnerability(dt);
  }

  hitByPlayer(damage: number, knockdown: boolean, fromX: number): void {
    if (this.invulnerable || !this.alive) return;
    if (this.fsm.isInState('death')) return;

    this.takeDamage(damage);
    this.knockbackVelX = fromX < this.groundX ? KNOCKBACK_SPEED : -KNOCKBACK_SPEED;

    if (knockdown && !this.hasSuperArmor) {
      this.fsm.setState('knockdown');
    } else if (!this.alive) {
      this.fsm.setState('knockdown');
    } else if (!this.hasSuperArmor) {
      this.fsm.setState('hurt');
    }
  }

  onBlocked(): void {
    this.fsm.setState('block');
    this.knockbackVelX = 0;
  }

  isActive(): boolean {
    return this.alive && !this.fsm.isInState('death');
  }
}
