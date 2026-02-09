import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class StageClearScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StageClearScene' });
  }

  create(data: { stage: number; score: number }): void {
    const { stage, score } = data;
    this.sound.stopAll();
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(GAME_WIDTH / 2, 60, 'STAGE CLEAR!', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#44ff44',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 100, `SCORE: ${score}`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      if (stage < 3) {
        this.scene.start('StageIntroScene', { stage: stage + 1 });
      } else {
        // Game complete
        this.add.text(GAME_WIDTH / 2, 140, 'CONGRATULATIONS!', {
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#ffcc00',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 160, 'YOU SAVED THE CITY', {
          fontSize: '8px',
          fontFamily: 'monospace',
          color: '#ffffff',
        }).setOrigin(0.5);

        this.time.delayedCall(5000, () => {
          this.scene.start('MenuScene');
        });
      }
    });
  }
}
