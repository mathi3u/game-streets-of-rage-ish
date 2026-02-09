import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Loading bar
    const bar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 200, 8, 0x333333);
    const fill = this.add.rectangle(GAME_WIDTH / 2 - 99, GAME_HEIGHT / 2, 0, 6, 0x4488ff);
    this.load.on('progress', (v: number) => {
      fill.width = 198 * v;
      fill.x = GAME_WIDTH / 2 - 99 + fill.width / 2;
    });
    this.load.on('complete', () => { bar.destroy(); fill.destroy(); });

    // Load sprite sheets
    if (this.textures.exists('player')) return;
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('galsia', 'assets/galsia.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('donovan', 'assets/donovan.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('signal', 'assets/signal.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('electra', 'assets/electra.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('bigben', 'assets/bigben.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('barbon', 'assets/barbon.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('jet', 'assets/jet.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('abadede', 'assets/abadede.png', { frameWidth: SPRITE_WIDTH, frameHeight: SPRITE_HEIGHT });
    this.load.spritesheet('weapons', 'assets/weapons.png', { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet('pickups', 'assets/pickups.png', { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet('effects', 'assets/effects.png', { frameWidth: 24, frameHeight: 24 });

    // Background assets
    this.load.image('bg_brick', 'assets/bg_brick.png');
    this.load.image('bg_sidewalk', 'assets/bg_sidewalk.png');
    this.load.image('bg_sky', 'assets/bg_sky.png');
    this.load.image('bg_city', 'assets/bg_city.png');
    this.load.image('bg_props', 'assets/bg_props.png');

    // Audio - Music
    this.load.audio('music-menu', 'assets/audio/menu.ogg');
    this.load.audio('music-stage1', 'assets/audio/stage1.ogg');
    this.load.audio('music-stage2', 'assets/audio/stage2.ogg');
    this.load.audio('music-stage3', 'assets/audio/stage3.ogg');

    // Audio - SFX
    this.load.audio('sfx-punch1', 'assets/audio/punch1.ogg');
    this.load.audio('sfx-punch2', 'assets/audio/punch2.ogg');
    this.load.audio('sfx-punch3', 'assets/audio/punch3.ogg');
    this.load.audio('sfx-kick1', 'assets/audio/kick1.ogg');
    this.load.audio('sfx-kick2', 'assets/audio/kick2.ogg');
    this.load.audio('sfx-hit1', 'assets/audio/hit1.ogg');
    this.load.audio('sfx-hit2', 'assets/audio/hit2.ogg');
    this.load.audio('sfx-heavy-hit', 'assets/audio/heavy_hit1.ogg');
    this.load.audio('sfx-knockdown', 'assets/audio/knockdown.ogg');
    this.load.audio('sfx-throw', 'assets/audio/throw.ogg');
    this.load.audio('sfx-enemy-hit', 'assets/audio/enemy_hit.ogg');
    this.load.audio('sfx-enemy-death', 'assets/audio/enemy_death.ogg');
    this.load.audio('sfx-player-death', 'assets/audio/player_death.ogg');
    this.load.audio('sfx-jump', 'assets/audio/jump.ogg');
    this.load.audio('sfx-pickup', 'assets/audio/pickup.ogg');
    this.load.audio('sfx-game-over', 'assets/audio/game_over.ogg');
    this.load.audio('sfx-menu-select', 'assets/audio/menu_select.ogg');
    this.load.audio('sfx-fall', 'assets/audio/fall.ogg');
  }

  create(): void {
    this.registerAnimations();
    this.scene.start('MenuScene');
  }

  private registerAnimations(): void {
    // Player animations
    this.createAnim('player', 'player-idle', [0, 1], 4, true);
    this.createAnim('player', 'player-walk', [2, 3, 4, 5], 8, true);
    this.createAnim('player', 'player-jump', [6], 1, false);
    this.createAnim('player', 'player-jab1', [7, 8], 12, false);
    this.createAnim('player', 'player-jab2', [9, 10], 12, false);
    this.createAnim('player', 'player-straight', [11, 12], 10, false);
    this.createAnim('player', 'player-kick', [13, 14], 10, false);
    this.createAnim('player', 'player-finisher', [15, 16, 17], 10, false);
    this.createAnim('player', 'player-jump-kick', [18], 8, false);
    this.createAnim('player', 'player-hurt', [19], 1, false);
    this.createAnim('player', 'player-knockdown', [20, 21], 6, false);
    this.createAnim('player', 'player-getup', [22, 23], 6, false);
    this.createAnim('player', 'player-special', [24, 25, 26], 10, false);
    this.createAnim('player', 'player-blitz', [27, 28], 10, false);
    this.createAnim('player', 'player-grab', [29], 1, false);
    this.createAnim('player', 'player-grab-punch', [30, 31], 10, false);
    this.createAnim('player', 'player-throw', [32, 33], 8, false);
    this.createAnim('player', 'player-weapon-attack', [34, 35], 10, false);

    // Enemy animations (shared layout per type)
    const enemyTypes = ['galsia', 'donovan', 'signal', 'electra', 'bigben', 'barbon', 'jet', 'abadede'];
    for (const type of enemyTypes) {
      if (!this.textures.exists(type)) continue;
      this.createAnim(type, `${type}-idle`, [0, 1], 4, true);
      this.createAnim(type, `${type}-walk`, [2, 3, 4, 5], 8, true);
      this.createAnim(type, `${type}-attack`, [6, 7, 8], 10, false);
      this.createAnim(type, `${type}-hurt`, [9], 1, false);
      this.createAnim(type, `${type}-knockdown`, [10, 11], 6, false);
      this.createAnim(type, `${type}-death`, [12, 13], 4, false);
      this.createAnim(type, `${type}-block`, [14], 1, false);
      this.createAnim(type, `${type}-special`, [15, 16, 17], 8, false);
    }

    // Effects
    if (this.textures.exists('effects')) {
      this.createAnim('effects', 'hit-spark', [0, 1, 2, 3], 16, false);
      this.createAnim('effects', 'dust', [4, 5, 6], 12, false);
    }
  }

  private createAnim(texture: string, key: string, frames: number[], frameRate: number, repeat: boolean): void {
    if (this.anims.exists(key)) return;
    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers(texture, { frames }),
      frameRate,
      repeat: repeat ? -1 : 0,
    });
  }
}
