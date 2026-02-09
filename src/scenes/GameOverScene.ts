import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class GameOverScene extends Phaser.Scene {
  private countdown = 10;
  private countText!: Phaser.GameObjects.Text;
  private timer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { stage: number; score: number }): void {
    const { stage, score } = data;
    this.countdown = 10;

    this.sound.stopAll();
    if (this.cache.audio.exists('sfx-game-over')) {
      this.sound.play('sfx-game-over', { volume: 0.7 });
    }

    this.cameras.main.setBackgroundColor('#0a0000');

    this.add.text(GAME_WIDTH / 2, 60, 'GAME OVER', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ff4444',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 100, `SCORE: ${score}`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 140, 'CONTINUE?', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffcc00',
    }).setOrigin(0.5);

    this.countText = this.add.text(GAME_WIDTH / 2, 165, `${this.countdown}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        this.countdown--;
        this.countText.setText(`${this.countdown}`);
        if (this.countdown <= 0) {
          this.scene.start('MenuScene');
        }
      },
    });

    this.input.keyboard!.once('keydown-ENTER', () => {
      if (this.cache.audio.exists('sfx-menu-select')) {
        this.sound.play('sfx-menu-select', { volume: 0.6 });
      }
      this.timer?.remove();
      this.scene.start('StageIntroScene', { stage });
    });
  }
}
