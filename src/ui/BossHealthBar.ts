import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants';
import { Enemy } from '../entities/Enemy';

export class BossHealthBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private boss: Enemy | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.depth = 900;
    this.container.setVisible(false);

    this.nameText = scene.add.text(GAME_WIDTH / 2, 206, '', {
      fontSize: '6px', fontFamily: 'monospace', color: '#ff4444',
    }).setOrigin(0.5, 0);

    this.hpBarBg = scene.add.rectangle(GAME_WIDTH / 2 - 50, 214, 100, 4, 0x333333);
    this.hpBarBg.setOrigin(0, 0);

    this.hpBar = scene.add.rectangle(GAME_WIDTH / 2 - 50, 214, 100, 4, 0xff4444);
    this.hpBar.setOrigin(0, 0);

    this.container.add([this.nameText, this.hpBarBg, this.hpBar]);
  }

  show(boss: Enemy): void {
    this.boss = boss;
    this.nameText.setText(boss.type.toUpperCase());
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
    this.boss = null;
  }

  update(): void {
    if (!this.boss) return;
    const ratio = this.boss.hp / this.boss.maxHp;
    this.hpBar.width = 100 * ratio;
  }
}
