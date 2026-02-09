import Phaser from 'phaser';
import { GAME_WIDTH, PLAYER_HP } from '../constants';
import { Player } from '../entities/Player';

export class HUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  private hpBar!: Phaser.GameObjects.Rectangle;
  private hpBarBg!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  private timer: number = 99;
  private timerAccum: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.depth = 900;

    // Player label
    const label = scene.add.text(4, 2, 'PLAYER', {
      fontSize: '6px', fontFamily: 'monospace', color: '#ffffff',
    });

    // HP bar background
    this.hpBarBg = scene.add.rectangle(4, 10, 80, 4, 0x333333);
    this.hpBarBg.setOrigin(0, 0);

    // HP bar fill
    this.hpBar = scene.add.rectangle(4, 10, 80, 4, 0x44cc44);
    this.hpBar.setOrigin(0, 0);

    // Score
    this.scoreText = scene.add.text(4, 16, 'SCORE: 0', {
      fontSize: '6px', fontFamily: 'monospace', color: '#ffcc00',
    });

    // Lives
    this.livesText = scene.add.text(100, 2, '', {
      fontSize: '6px', fontFamily: 'monospace', color: '#ffffff',
    });

    // Timer
    this.timerText = scene.add.text(GAME_WIDTH - 30, 2, '99', {
      fontSize: '8px', fontFamily: 'monospace', color: '#ffffff',
    });

    this.container.add([label, this.hpBarBg, this.hpBar, this.scoreText, this.livesText, this.timerText]);
  }

  update(player: Player, dt: number): void {
    // HP bar
    const hpRatio = player.hp / player.maxHp;
    this.hpBar.width = 80 * hpRatio;
    this.hpBar.fillColor = hpRatio > 0.5 ? 0x44cc44 : hpRatio > 0.25 ? 0xcccc44 : 0xcc4444;

    // Score
    this.scoreText.setText(`SCORE: ${player.score}`);

    // Lives
    let livesStr = '';
    for (let i = 0; i < player.lives; i++) livesStr += 'x ';
    this.livesText.setText(livesStr.trim());

    // Timer countdown
    this.timerAccum += dt;
    if (this.timerAccum >= 1000) {
      this.timerAccum -= 1000;
      this.timer = Math.max(0, this.timer - 1);
    }
    this.timerText.setText(`${this.timer}`);
    this.timerText.setColor(this.timer <= 10 ? '#ff4444' : '#ffffff');
  }

  resetTimer(): void {
    this.timer = 99;
    this.timerAccum = 0;
  }

  getTimer(): number {
    return this.timer;
  }
}
