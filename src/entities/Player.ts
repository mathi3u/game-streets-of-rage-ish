import Phaser from 'phaser';
import { Entity } from './Entity';
import { StateMachine } from '../ai/StateMachine';
import { InputManager } from '../utils/InputManager';
import {
  PLAYER_HP, PLAYER_SPEED, PLAYER_DEPTH_SPEED, PLAYER_JUMP_VELOCITY,
  PLAYER_GRAVITY, PLAYER_LIVES, COMBO_WINDOW_MS, COMBO_CHAIN,
  SPECIAL_DAMAGE, SPECIAL_HP_COST, SPECIAL_INVULN_MS,
  BLITZ_DAMAGE, BLITZ_SPEED, BLITZ_DURATION_MS,
  GRAB_PUNCH_DAMAGE, GRAB_THROW_DAMAGE,
  GROUND_Y_MIN, GROUND_Y_MAX, KNOCKDOWN_DURATION_MS, GETUP_DURATION_MS,
  HURT_STUN_MS, INVULN_FLASH_MS, KNOCKBACK_SPEED, KNOCKBACK_DURATION_MS,
  WEAPON_KNIFE_DAMAGE, WEAPON_PIPE_DAMAGE, WEAPON_DURABILITY,
} from '../constants';

export class Player extends Entity {
  fsm: StateMachine;
  input: InputManager;

  lives: number = PLAYER_LIVES;
  score: number = 0;
  comboIndex: number = 0;
  comboTimer: number = 0;
  stateTimer: number = 0;
  knockbackVelX: number = 0;
  knockbackVelY: number = 0;

  // Grab state
  grabbedEnemy: Entity | null = null;
  grabPunchCount: number = 0;

  // Weapon state
  weapon: string | null = null;
  weaponUses: number = 0;

  // Blitz
  blitzDirection: number = 0;

  // Callbacks set by GameScene
  onAttackHit?: (damage: number, knockdown: boolean, isSpecial?: boolean) => void;
  onGrabCheck?: () => Entity | null;
  onThrow?: (enemy: Entity, dirX: number) => void;

  constructor(scene: Phaser.Scene, x: number, groundY: number, input: InputManager) {
    super({ scene, x, groundY, texture: 'player', maxHp: PLAYER_HP, speed: PLAYER_SPEED });
    this.input = input;
    this.fsm = new StateMachine();
    this.setupStates();
    this.fsm.setState('idle');
  }

  private setupStates(): void {
    const self = this;

    this.fsm.addState({
      name: 'idle',
      enter() { self.playAnim('player-idle'); self.comboTimer = 0; },
      update(dt) {
        // Combo timer decay
        if (self.comboTimer > 0) {
          self.comboTimer -= dt;
          if (self.comboTimer <= 0) self.comboIndex = 0;
        }

        if (self.input.specialJustPressed) { self.fsm.setState('special'); return; }
        if (self.input.attackAndJumpPressed) { self.fsm.setState('backAttack'); return; }
        if (self.input.attackJustPressed) { self.fsm.setState('attack'); return; }
        if (self.input.jumpJustPressed) { self.fsm.setState('jumpStart'); return; }
        if (self.input.moveX !== 0 || self.input.moveY !== 0) {
          // Check for blitz (double-tap + attack)
          self.fsm.setState('walk');
          return;
        }
      },
    });

    this.fsm.addState({
      name: 'walk',
      enter() { self.playAnim('player-walk'); },
      update(dt) {
        const mx = self.input.moveX;
        const my = self.input.moveY;

        if (mx === 0 && my === 0) { self.fsm.setState('idle'); return; }
        if (self.input.specialJustPressed) { self.fsm.setState('special'); return; }
        if (self.input.attackAndJumpPressed) { self.fsm.setState('backAttack'); return; }
        if (self.input.attackJustPressed) {
          // Check for blitz attack (double-tap direction + attack)
          if (self.input.wasDoubleTapConsumed(mx > 0 ? 'right' : 'left') ||
              self.input.isDoubleTap(mx > 0 ? 'right' : 'left')) {
            self.input.consumeDoubleTap(mx > 0 ? 'right' : 'left');
            self.blitzDirection = mx;
            self.fsm.setState('blitz');
            return;
          }
          self.fsm.setState('attack'); return;
        }
        if (self.input.jumpJustPressed) { self.fsm.setState('jumpStart'); return; }

        if (mx !== 0) self.facing = mx;
        self.groundX += mx * PLAYER_SPEED * (dt / 1000);
        self.groundY += my * PLAYER_DEPTH_SPEED * (dt / 1000);
        self.updatePosition();
      },
    });

    this.fsm.addState({
      name: 'attack',
      enter() {
        const combo = COMBO_CHAIN[self.comboIndex];
        self.playAnim(`player-${combo.name}`);
        self.stateTimer = (combo.frames / 10) * 1000; // convert frames to ms at ~10fps
        // Hit on the "middle" of the animation
        const hitDelay = self.stateTimer * 0.4;
        self.scene.time.delayedCall(hitDelay, () => {
          if (self.fsm.stateName !== 'attack') return;
          // Check for grab first
          if (self.comboIndex === 0 && self.onGrabCheck) {
            const enemy = self.onGrabCheck();
            if (enemy) {
              self.grabbedEnemy = enemy;
              self.grabPunchCount = 0;
              self.fsm.setState('grab');
              return;
            }
          }
          self.onAttackHit?.(combo.damage, 'knockdown' in combo && !!(combo as any).knockdown);
        });
      },
      update(dt) {
        self.stateTimer -= dt;
        // Buffer next attack
        if (self.input.attackJustPressed) self.input.bufferAttack();

        if (self.stateTimer <= 0) {
          const nextCombo = self.comboIndex + 1;
          if (nextCombo < COMBO_CHAIN.length && self.input.consumeAttackBuffer()) {
            self.comboIndex = nextCombo;
            self.comboTimer = COMBO_WINDOW_MS;
            self.fsm.setState('idle'); // force re-enter
            self.fsm.setState('attack');
          } else {
            self.comboIndex = 0;
            self.comboTimer = COMBO_WINDOW_MS;
            self.fsm.setState('idle');
          }
        }
      },
    });

    this.fsm.addState({
      name: 'jumpStart',
      enter() {
        self.zVelocity = PLAYER_JUMP_VELOCITY;
        self.playAnim('player-jump');
        self.playSfx('sfx-jump');
        self.fsm.setState('airborne');
      },
    });

    this.fsm.addState({
      name: 'airborne',
      enter() { self.playAnim('player-jump'); },
      update(dt) {
        const dtSec = dt / 1000;
        self.zVelocity += PLAYER_GRAVITY * dtSec;
        self.zHeight -= self.zVelocity * dtSec;

        // Air movement
        self.groundX += self.input.moveX * PLAYER_SPEED * 0.6 * dtSec;
        self.groundY += self.input.moveY * PLAYER_DEPTH_SPEED * 0.6 * dtSec;

        // Jump kick
        if (self.input.attackJustPressed) {
          self.fsm.setState('jumpKick');
          return;
        }

        if (self.zHeight <= 0) {
          self.zHeight = 0;
          self.zVelocity = 0;
          self.fsm.setState('idle');
        }
        self.updatePosition();
      },
    });

    this.fsm.addState({
      name: 'jumpKick',
      enter() { self.playAnim('player-jump-kick'); },
      update(dt) {
        const dtSec = dt / 1000;
        self.zVelocity += PLAYER_GRAVITY * dtSec;
        self.zHeight -= self.zVelocity * dtSec;
        self.groundX += self.facing * PLAYER_SPEED * 0.4 * dtSec;

        self.onAttackHit?.(8, false);

        if (self.zHeight <= 0) {
          self.zHeight = 0;
          self.zVelocity = 0;
          self.fsm.setState('idle');
        }
        self.updatePosition();
      },
    });

    this.fsm.addState({
      name: 'hurt',
      enter() {
        self.playAnim('player-hurt');
        const hitSfx = ['sfx-hit1', 'sfx-hit2'];
        self.playSfx(hitSfx[Math.floor(Math.random() * hitSfx.length)]);
        self.stateTimer = HURT_STUN_MS;
      },
      update(dt) {
        self.stateTimer -= dt;
        // Apply knockback
        self.groundX += self.knockbackVelX * (dt / 1000);
        if (self.stateTimer <= 0) self.fsm.setState('idle');
      },
    });

    this.fsm.addState({
      name: 'knockdown',
      enter() {
        self.playAnim('player-knockdown');
        self.playSfx('sfx-knockdown');
        self.stateTimer = KNOCKDOWN_DURATION_MS;
        self.zVelocity = -80;
      },
      update(dt) {
        const dtSec = dt / 1000;
        self.stateTimer -= dt;
        self.groundX += self.knockbackVelX * dtSec;

        // Bounce physics
        self.zVelocity += PLAYER_GRAVITY * dtSec;
        self.zHeight -= self.zVelocity * dtSec;
        if (self.zHeight <= 0) {
          self.zHeight = 0;
          self.zVelocity = 0;
          self.knockbackVelX = 0;
        }

        if (self.stateTimer <= 0) {
          if (self.alive) {
            self.fsm.setState('getup');
          } else {
            self.fsm.setState('dead');
          }
        }
        self.updatePosition();
      },
    });

    this.fsm.addState({
      name: 'getup',
      enter() {
        self.playAnim('player-getup');
        self.stateTimer = GETUP_DURATION_MS;
        self.setInvulnerable(INVULN_FLASH_MS);
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) self.fsm.setState('idle');
      },
    });

    this.fsm.addState({
      name: 'dead',
      enter() {
        self.playAnim('player-knockdown');
        self.playSfx('sfx-player-death');
        self.stateTimer = 1500;
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) {
          self.lives--;
          if (self.lives > 0) {
            self.hp = self.maxHp;
            self.alive = true;
            self.setInvulnerable(INVULN_FLASH_MS);
            self.fsm.setState('getup');
          }
          // GameScene handles lives === 0 → GameOver
        }
      },
    });

    this.fsm.addState({
      name: 'special',
      enter() {
        if (self.hp <= SPECIAL_HP_COST) {
          self.fsm.setState('idle');
          return;
        }
        self.hp -= SPECIAL_HP_COST;
        self.setInvulnerable(SPECIAL_INVULN_MS);
        self.playAnim('player-special');
        self.stateTimer = 600;
        self.scene.time.delayedCall(300, () => {
          if (self.fsm.stateName !== 'special') return;
          self.onAttackHit?.(SPECIAL_DAMAGE, true, true);
        });
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) self.fsm.setState('idle');
      },
    });

    this.fsm.addState({
      name: 'blitz',
      enter() {
        self.playAnim('player-blitz');
        self.facing = self.blitzDirection || self.facing;
        self.stateTimer = BLITZ_DURATION_MS;
      },
      update(dt) {
        self.stateTimer -= dt;
        self.groundX += self.facing * BLITZ_SPEED * (dt / 1000);
        self.onAttackHit?.(BLITZ_DAMAGE, true);
        if (self.stateTimer <= 0) self.fsm.setState('idle');
        self.updatePosition();
      },
    });

    this.fsm.addState({
      name: 'backAttack',
      enter() {
        self.playAnim('player-finisher');
        self.stateTimer = 400;
        self.scene.time.delayedCall(200, () => {
          if (self.fsm.stateName !== 'backAttack') return;
          self.onAttackHit?.(10, true);
        });
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) self.fsm.setState('idle');
      },
    });

    this.fsm.addState({
      name: 'grab',
      enter() {
        self.playAnim('player-grab');
        self.grabPunchCount = 0;
      },
      update(_dt) {
        if (!self.grabbedEnemy || !self.grabbedEnemy.alive) {
          self.grabbedEnemy = null;
          self.fsm.setState('idle');
          return;
        }
        if (self.input.attackJustPressed) {
          self.grabPunchCount++;
          if (self.grabPunchCount >= 3) {
            // Auto-throw after 3 punches
            self.fsm.setState('throw');
            return;
          }
          self.playAnim('player-grab-punch');
          self.grabbedEnemy.takeDamage(GRAB_PUNCH_DAMAGE);
          self.scene.time.delayedCall(200, () => {
            if (self.fsm.stateName === 'grab') self.playAnim('player-grab');
          });
        }
        // Throw on direction + attack or jump
        if (self.input.jumpJustPressed || (self.input.moveX !== 0 && self.input.attackJustPressed)) {
          self.fsm.setState('throw');
          return;
        }
      },
    });

    this.fsm.addState({
      name: 'throw',
      enter() {
        self.playAnim('player-throw');
        self.playSfx('sfx-throw');
        self.stateTimer = 400;
        if (self.grabbedEnemy) {
          const throwDir = self.input.moveX !== 0 ? self.input.moveX : self.facing;
          self.grabbedEnemy.takeDamage(GRAB_THROW_DAMAGE);
          self.onThrow?.(self.grabbedEnemy, throwDir);
          self.grabbedEnemy = null;
        }
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) self.fsm.setState('idle');
      },
    });

    this.fsm.addState({
      name: 'weaponAttack',
      enter() {
        self.playAnim('player-weapon-attack');
        const damage = self.weapon === 'knife' ? WEAPON_KNIFE_DAMAGE : WEAPON_PIPE_DAMAGE;
        self.stateTimer = 400;
        self.scene.time.delayedCall(150, () => {
          if (self.fsm.stateName !== 'weaponAttack') return;
          self.onAttackHit?.(damage, false);
          self.weaponUses--;
          if (self.weaponUses <= 0) self.weapon = null;
        });
      },
      update(dt) {
        self.stateTimer -= dt;
        if (self.stateTimer <= 0) self.fsm.setState('idle');
      },
    });
  }

  playAnim(key: string): void {
    if (this.scene.anims.exists(key)) {
      this.sprite.play(key, true);
    }
  }

  update(dt: number): void {
    this.input.update(dt);
    this.fsm.update(dt);
    this.updateInvulnerability(dt);
    this.updatePosition();
  }

  hitByEnemy(damage: number, knockdown: boolean, fromX: number): void {
    if (this.invulnerable) return;
    if (this.fsm.isInState('hurt', 'knockdown', 'dead', 'getup')) return;

    this.takeDamage(damage);
    this.knockbackVelX = fromX < this.groundX ? KNOCKBACK_SPEED : -KNOCKBACK_SPEED;

    if (knockdown || !this.alive) {
      this.fsm.setState('knockdown');
    } else {
      this.fsm.setState('hurt');
    }
  }

  private playSfx(key: string): void {
    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { volume: 0.5 });
    }
  }

  pickupWeapon(type: string): void {
    this.weapon = type;
    this.weaponUses = WEAPON_DURABILITY;
    this.playSfx('sfx-pickup');
  }

  isAttacking(): boolean {
    return this.fsm.isInState('attack', 'jumpKick', 'special', 'blitz', 'backAttack', 'weaponAttack');
  }

  isGrabbing(): boolean {
    return this.fsm.isInState('grab', 'throw');
  }

  canBeHit(): boolean {
    return !this.invulnerable && this.alive && !this.fsm.isInState('knockdown', 'dead', 'getup');
  }
}
