import Phaser from 'phaser';
import { PICKUP_APPLE_HP, PICKUP_CHICKEN_HP } from '../constants';

const PICKUP_FRAME_MAP: Record<string, number> = {
  apple: 0,
  chicken: 1,
  money: 2,
  '1up': 3,
};

export class Pickup {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
  groundX: number;
  groundY: number;
  type: string;
  collected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, groundY: number, type: string) {
    this.groundX = x;
    this.groundY = groundY;
    this.type = type;

    if (scene.textures.exists('pickups')) {
      const frame = PICKUP_FRAME_MAP[type] ?? 0;
      this.sprite = scene.add.sprite(x, groundY - 12, 'pickups', frame);
      this.sprite.setOrigin(0.5, 1);
      this.sprite.depth = groundY - 0.5;
    } else {
      const color = type === 'apple' ? 0xcc2222 : type === 'chicken' ? 0xcc8844 : type === 'money' ? 0xffcc00 : 0x44ff44;
      this.sprite = scene.add.rectangle(x, groundY - 8, 12, 12, color);
      this.sprite.depth = groundY - 0.5;
    }
  }

  getHealAmount(): number {
    switch (this.type) {
      case 'apple': return PICKUP_APPLE_HP;
      case 'chicken': return PICKUP_CHICKEN_HP;
      default: return 0;
    }
  }

  getScoreValue(): number {
    switch (this.type) {
      case 'money': return 1000;
      default: return 100;
    }
  }

  collect(): void {
    this.collected = true;
    this.sprite.destroy();
  }

  isNear(x: number, y: number): boolean {
    return Math.abs(this.groundX - x) < 20 && Math.abs(this.groundY - y) < 14;
  }
}
