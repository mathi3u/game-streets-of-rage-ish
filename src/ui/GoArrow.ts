import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class GoArrow {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private text: Phaser.GameObjects.Text;
  private arrow: Phaser.GameObjects.Text;
  private blinkTimer: number = 0;
  private visible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.depth = 800;
    this.container.setVisible(false);

    this.text = scene.add.text(GAME_WIDTH - 40, GAME_HEIGHT / 2, 'GO', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffcc00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.arrow = scene.add.text(GAME_WIDTH - 24, GAME_HEIGHT / 2, '>>', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffcc00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.container.add([this.text, this.arrow]);
  }

  show(): void {
    this.visible = true;
    this.container.setVisible(true);
    this.blinkTimer = 0;
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  update(dt: number): void {
    if (!this.visible) return;
    this.blinkTimer += dt;
    const alpha = Math.sin(this.blinkTimer * 0.006) > 0 ? 1 : 0.2;
    this.text.setAlpha(alpha);
    this.arrow.setAlpha(alpha);
    // Bounce arrow
    this.arrow.x = GAME_WIDTH - 24 + Math.sin(this.blinkTimer * 0.008) * 3;
  }
}
