import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, CAMERA_DEAD_ZONE_X } from '../constants';
import { Player } from '../entities/Player';

export class ScrollManager {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;

  // Arena lock
  arenaLocked: boolean = false;
  private arenaMinX: number = 0;
  private arenaMaxX: number = 99999;

  // Stage bounds
  private stageMinX: number = 0;
  private stageMaxX: number = 1600;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  setup(stageMaxX: number, _farColor: string, _midColor: string, _nearColor: string): void {
    this.stageMaxX = stageMaxX;

    // Camera setup
    this.camera.setBounds(this.stageMinX, 0, stageMaxX, GAME_HEIGHT);
    this.camera.setRoundPixels(true);
  }

  followPlayer(player: Player): void {
    const targetX = player.groundX - GAME_WIDTH / 2 + CAMERA_DEAD_ZONE_X;

    if (!this.arenaLocked) {
      // Only scroll right (no backtracking)
      const newX = Math.max(this.camera.scrollX, targetX);
      this.camera.scrollX = Phaser.Math.Clamp(newX, this.stageMinX, this.stageMaxX - GAME_WIDTH);
    } else {
      this.camera.scrollX = Phaser.Math.Clamp(this.camera.scrollX, this.arenaMinX, this.arenaMaxX - GAME_WIDTH);
    }
  }

  lockArena(minX: number, maxX: number): void {
    this.arenaLocked = true;
    this.arenaMinX = minX;
    this.arenaMaxX = maxX;
  }

  unlockArena(): void {
    this.arenaLocked = false;
  }

  get cameraX(): number {
    return this.camera.scrollX;
  }

  get visibleMinX(): number {
    return this.camera.scrollX;
  }

  get visibleMaxX(): number {
    return this.camera.scrollX + GAME_WIDTH;
  }

  clampPlayerX(player: Player): void {
    const minX = this.camera.scrollX + 24;
    const maxX = this.camera.scrollX + GAME_WIDTH - 24;
    player.groundX = Phaser.Math.Clamp(player.groundX, minX, maxX);
  }
}
