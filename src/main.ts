import Phaser from 'phaser';
import { gameConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { StageIntroScene } from './scenes/StageIntroScene';
import { GameScene } from './scenes/GameScene';
import { StageClearScene } from './scenes/StageClearScene';
import { GameOverScene } from './scenes/GameOverScene';
import { PauseScene } from './scenes/PauseScene';

const config: Phaser.Types.Core.GameConfig = {
  ...gameConfig,
  scene: [BootScene, PreloadScene, MenuScene, StageIntroScene, GameScene, StageClearScene, GameOverScene, PauseScene],
};

new Phaser.Game(config);
