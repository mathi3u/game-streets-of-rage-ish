import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class MenuScene extends Phaser.Scene {
  private blinkTimer = 0;
  private pressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // Music
    this.sound.stopAll();
    if (this.cache.audio.exists('music-menu')) {
      this.sound.play('music-menu', { loop: true, volume: 0.5 });
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 60, 'STREETS OF', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffcc00',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 82, 'RAGE-ISH', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 120, '- A BEAT EM UP -', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    // Press start
    this.pressText = this.add.text(GAME_WIDTH / 2, 170, 'PRESS ENTER', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 200, 'WASD Move  J Attack  K Jump  L Special', {
      fontSize: '6px',
      fontFamily: 'monospace',
      color: '#555555',
    }).setOrigin(0.5);

    // Input
    this.input.keyboard!.once('keydown-ENTER', () => {
      if (this.cache.audio.exists('sfx-menu-select')) {
        this.sound.play('sfx-menu-select', { volume: 0.6 });
      }
      this.sound.stopAll();
      this.scene.start('StageIntroScene', { stage: 1 });
    });

    this.blinkTimer = 0;
  }

  update(_time: number, delta: number): void {
    this.blinkTimer += delta;
    this.pressText.setAlpha(Math.sin(this.blinkTimer * 0.005) > 0 ? 1 : 0);
  }
}
