import Phaser from 'phaser';

const WEAPON_FRAME_MAP: Record<string, number> = {
  knife: 0,
  pipe: 1,
};

export class WeaponPickup {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
  groundX: number;
  groundY: number;
  type: string;
  collected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, groundY: number, type: string) {
    this.groundX = x;
    this.groundY = groundY;
    this.type = type;

    if (scene.textures.exists('weapons')) {
      const frame = WEAPON_FRAME_MAP[type] ?? 0;
      this.sprite = scene.add.sprite(x, groundY - 8, 'weapons', frame);
      this.sprite.setOrigin(0.5, 1);
      this.sprite.depth = groundY - 0.5;
    } else {
      const color = type === 'knife' ? 0xcccccc : 0x888888;
      this.sprite = scene.add.rectangle(x, groundY - 6, 14, 6, color);
      this.sprite.depth = groundY - 0.5;
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
