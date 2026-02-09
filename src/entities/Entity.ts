import Phaser from 'phaser';
import { GROUND_Y_MIN, GROUND_Y_MAX, SPRITE_WIDTH, SPRITE_HEIGHT } from '../constants';

export interface EntityConfig {
  scene: Phaser.Scene;
  x: number;
  groundY: number;
  texture: string;
  maxHp: number;
  speed: number;
}

export class Entity {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Ellipse;

  groundX: number;
  groundY: number;
  zHeight: number = 0;
  zVelocity: number = 0;

  maxHp: number;
  hp: number;
  speed: number;
  facing: number = 1; // 1 = right, -1 = left
  alive: boolean = true;
  invulnerable: boolean = false;
  invulnTimer: number = 0;

  constructor(config: EntityConfig) {
    this.scene = config.scene;
    this.groundX = config.x;
    this.groundY = config.groundY;
    this.maxHp = config.maxHp;
    this.hp = config.maxHp;
    this.speed = config.speed;

    this.sprite = config.scene.add.sprite(config.x, config.groundY, config.texture);
    this.sprite.setOrigin(0.5, 1);

    // Shadow
    this.shadow = config.scene.add.ellipse(config.x, config.groundY, 28, 8, 0x000000, 0.3);
    this.shadow.depth = config.groundY - 0.1;
  }

  updatePosition(): void {
    // Clamp groundY to walkable area
    this.groundY = Phaser.Math.Clamp(this.groundY, GROUND_Y_MIN, GROUND_Y_MAX);

    // Visual position: sprite drawn at groundY - zHeight
    this.sprite.x = this.groundX;
    this.sprite.y = this.groundY - this.zHeight;
    this.sprite.depth = this.groundY;

    // Flip based on facing
    this.sprite.flipX = this.facing < 0;

    // Shadow always on ground
    this.shadow.x = this.groundX;
    this.shadow.y = this.groundY;
    this.shadow.depth = this.groundY - 0.1;
    // Scale shadow based on height
    const shadowScale = Math.max(0.5, 1 - this.zHeight / 80);
    this.shadow.setScale(shadowScale, shadowScale);
  }

  isOnGround(): boolean {
    return this.zHeight <= 0;
  }

  takeDamage(amount: number): void {
    if (this.invulnerable || !this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  heal(amount: number): void {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  distanceTo(other: Entity): { dx: number; dy: number; dz: number } {
    return {
      dx: Math.abs(this.groundX - other.groundX),
      dy: Math.abs(this.groundY - other.groundY),
      dz: Math.abs(this.zHeight - other.zHeight),
    };
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
  }

  setInvulnerable(durationMs: number): void {
    this.invulnerable = true;
    this.invulnTimer = durationMs;
  }

  updateInvulnerability(delta: number): void {
    if (!this.invulnerable) return;
    this.invulnTimer -= delta;
    // Flash effect
    this.sprite.alpha = Math.sin(this.invulnTimer * 0.02) > 0 ? 1 : 0.3;
    if (this.invulnTimer <= 0) {
      this.invulnerable = false;
      this.sprite.alpha = 1;
    }
  }
}
