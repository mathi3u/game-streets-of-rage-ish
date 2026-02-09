import Phaser from 'phaser';

export class DepthSorter {
  static sort(entities: Phaser.GameObjects.Sprite[]): void {
    for (const entity of entities) {
      // depth = groundY for proper y-sorting in 2.5D
      entity.depth = entity.y + entity.height / 2;
    }
  }
}
