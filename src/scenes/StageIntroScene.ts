import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

const STAGE_NAMES: Record<number, string> = {
  1: 'DOWNTOWN',
  2: 'AMUSEMENT PARK',
  3: 'FACTORY',
};

export class StageIntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StageIntroScene' });
  }

  create(data: { stage: number }): void {
    const stage = data.stage || 1;

    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16, `STAGE ${stage}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffcc00',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, STAGE_NAMES[stage] || 'UNKNOWN', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('GameScene', { stage });
    });
  }
}
