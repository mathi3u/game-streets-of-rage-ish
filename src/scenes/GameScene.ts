import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy, EnemyConfig } from '../entities/Enemy';
import { Galsia } from '../entities/enemies/Galsia';
import { Donovan } from '../entities/enemies/Donovan';
import { Signal } from '../entities/enemies/Signal';
import { Electra } from '../entities/enemies/Electra';
import { BigBen } from '../entities/enemies/BigBen';
import { Barbon } from '../entities/bosses/Barbon';
import { Jet } from '../entities/bosses/Jet';
import { Abadede } from '../entities/bosses/Abadede';
import { Pickup } from '../entities/Pickup';
import { WeaponPickup } from '../entities/Weapon';
import { InputManager } from '../utils/InputManager';
import { CombatManager } from '../combat/CombatManager';
import { AggressionManager } from '../ai/AggressionManager';
import { PositionSlotManager } from '../ai/PositionSlotManager';
import { LevelManager } from '../levels/LevelManager';
import { ScrollManager } from '../levels/ScrollManager';
import { SpawnManager } from '../levels/SpawnManager';
import { HUD } from '../ui/HUD';
import { BossHealthBar } from '../ui/BossHealthBar';
import { GoArrow } from '../ui/GoArrow';
import { ENEMY_STATS, BOSS_STATS, GAME_WIDTH, GAME_HEIGHT, SECTION_HEAL_HP, GROUND_Y_MIN, GROUND_Y_MAX } from '../constants';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private combatManager!: CombatManager;
  private aggressionManager!: AggressionManager;
  private positionSlotManager!: PositionSlotManager;
  private levelManager!: LevelManager;
  private scrollManager!: ScrollManager;
  private spawnManager!: SpawnManager;
  private hud!: HUD;
  private bossHealthBar!: BossHealthBar;
  private goArrow!: GoArrow;

  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private weapons: WeaponPickup[] = [];
  private currentBoss: Enemy | null = null;

  private stageNumber: number = 1;
  private arenaWaveActive: boolean = false;
  private lastSectionIndex: number = 0;
  private sectionTransitioning: boolean = false;
  private allWavesCleared: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data: { stage: number }): void {
    this.stageNumber = data.stage || 1;
    this.enemies = [];
    this.pickups = [];
    this.weapons = [];
    this.currentBoss = null;
    this.arenaWaveActive = false;
    this.lastSectionIndex = 0;
    this.sectionTransitioning = false;
    this.allWavesCleared = false;

    // Systems
    this.inputManager = new InputManager(this);
    this.combatManager = new CombatManager(this);
    this.aggressionManager = new AggressionManager();
    this.positionSlotManager = new PositionSlotManager();

    // Level
    this.levelManager = new LevelManager(this.stageNumber);
    this.scrollManager = new ScrollManager(this);
    const colors = this.levelManager.getParallaxColors();
    this.scrollManager.setup(this.levelManager.getMaxX(), colors.far, colors.mid, colors.near);

    // Draw background
    this.drawBackground();

    // Spawn manager
    this.spawnManager = new SpawnManager(this.levelManager.getSections());
    this.spawnManager.onSpawnWave = (event) => this.handleWaveSpawn(event);

    // Spawn pickups and weapons from level data
    for (const section of this.levelManager.getSections()) {
      if (section.pickups) {
        for (const p of section.pickups) {
          this.pickups.push(new Pickup(this, section.startX + p.x, p.groundY, p.type));
        }
      }
      if (section.weapons) {
        for (const w of section.weapons) {
          this.weapons.push(new WeaponPickup(this, section.startX + w.x, w.groundY, w.type));
        }
      }
    }

    // Player
    this.player = new Player(this, 40, 160, this.inputManager);
    this.player.onAttackHit = (damage, knockdown, isSpecial) => {
      const hitEnemies = this.combatManager.checkPlayerAttackHits(this.player, this.enemies, damage, knockdown, isSpecial);
      if (hitEnemies.length > 0) {
        this.combatManager.shakeCamera(0.003, 50);
      }
      // Check big hits
      if (knockdown && hitEnemies.length > 0) {
        this.combatManager.shakeCamera(0.008, 100);
      }
    };
    this.player.onGrabCheck = () => {
      return this.combatManager.checkGrabProximity(this.player, this.enemies);
    };
    this.player.onThrow = (enemy, dirX) => {
      if (enemy instanceof Enemy) {
        enemy.knockbackVelX = dirX * 200;
        enemy.fsm.setState('thrown');
      }
    };

    // UI
    this.hud = new HUD(this);
    this.bossHealthBar = new BossHealthBar(this);
    this.goArrow = new GoArrow(this);

    // Music
    const musicKey = `music-stage${this.stageNumber}`;
    if (this.cache.audio.exists(musicKey)) {
      this.sound.play(musicKey, { loop: true, volume: 0.4 });
    }

    // Pause
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  private drawBackground(): void {
    const stageMaxX = this.levelManager.getMaxX();
    const colors = this.levelManager.getParallaxColors();

    // Stage tints for color theming
    const stageTints: Record<number, number> = {
      1: 0xffffff,  // Downtown: default
      2: 0xff8866,  // Amusement Park: warm
      3: 0x88aa88,  // Factory: green/gray
    };
    const tint = stageTints[this.stageNumber] || 0xffffff;

    // === FAR LAYER (depth -100, scroll 0.2): Sky ===
    if (this.textures.exists('bg_sky')) {
      // Tile the sky image across the full width
      const skyTile = this.add.tileSprite(0, 0, stageMaxX / 0.2 + GAME_WIDTH, 70, 'bg_sky');
      skyTile.setOrigin(0, 0);
      skyTile.depth = -100;
      skyTile.setScrollFactor(0.2);
      if (tint !== 0xffffff) skyTile.setTint(tint);
    } else {
      // Fallback
      const farG = this.add.graphics();
      farG.depth = -100;
      farG.setScrollFactor(0.2);
      farG.fillStyle(Phaser.Display.Color.HexStringToColor(colors.far).color);
      farG.fillRect(-200, 0, stageMaxX + 400, 70);
    }

    // === MID LAYER (depth -90, scroll 0.5): City silhouette ===
    if (this.textures.exists('bg_city')) {
      const cityTile = this.add.tileSprite(0, 20, stageMaxX / 0.5 + GAME_WIDTH, 50, 'bg_city');
      cityTile.setOrigin(0, 0);
      cityTile.depth = -90;
      cityTile.setScrollFactor(0.5);
      if (tint !== 0xffffff) cityTile.setTint(tint);
    } else {
      const midG = this.add.graphics();
      midG.depth = -90;
      midG.setScrollFactor(0.5);
      const midColor = Phaser.Display.Color.HexStringToColor(colors.mid).color;
      midG.fillStyle(midColor);
      midG.fillRect(-100, 20, stageMaxX + 200, 50);
    }

    // === NEAR LAYER (depth -80, scroll 0.8): Brick wall + props ===
    if (this.textures.exists('bg_brick')) {
      // Brick wall fills from top of screen to just above walk area
      const brickTile = this.add.tileSprite(0, 60, stageMaxX / 0.8 + GAME_WIDTH, GROUND_Y_MIN - 60, 'bg_brick');
      brickTile.setOrigin(0, 0);
      brickTile.depth = -80;
      brickTile.setScrollFactor(0.8);
      if (tint !== 0xffffff) brickTile.setTint(tint);

      // Props placed at regular intervals on the brick wall
      const propTypes = ['door', 'phone', 'dumpster', 'neon'];
      // Source rects in bg_props.png: door=0,4,16,24 phone=20,0,12,28 dumpster=36,12,24,16 neon=64,10,20,8
      let seed = this.stageNumber * 31;
      for (let px = 80; px < stageMaxX; px += 120 + ((seed = seed * 17 + 13) % 80)) {
        const propIdx = Math.abs(seed) % propTypes.length;
        const propType = propTypes[propIdx];

        if (this.textures.exists('bg_props')) {
          const prop = this.add.image(px, GROUND_Y_MIN - 2, 'bg_props');
          prop.setOrigin(0.5, 1);
          prop.depth = -79;
          prop.setScrollFactor(0.8);

          // Crop to the right prop region
          switch (propType) {
            case 'door':
              prop.setCrop(0, 4, 16, 24);
              break;
            case 'phone':
              prop.setCrop(20, 0, 12, 28);
              break;
            case 'dumpster':
              prop.setCrop(36, 12, 24, 16);
              prop.y = GROUND_Y_MIN + 4;
              break;
            case 'neon':
              prop.setCrop(64, 10, 20, 8);
              prop.y = GROUND_Y_MIN - 30;
              break;
          }

          if (tint !== 0xffffff) prop.setTint(tint);
        }
      }
    } else {
      // Fallback: colored rectangle
      const nearG = this.add.graphics();
      nearG.depth = -80;
      nearG.setScrollFactor(0.8);
      const nearColor = Phaser.Display.Color.HexStringToColor(colors.near).color;
      nearG.fillStyle(nearColor);
      nearG.fillRect(-100, 60, stageMaxX + 200, GROUND_Y_MIN - 60);
    }

    // === GROUND PLANE (depth -70, scroll 1.0): Sidewalk/pavement ===
    if (this.textures.exists('bg_sidewalk')) {
      const swTile = this.add.tileSprite(0, GROUND_Y_MIN, stageMaxX + GAME_WIDTH, GROUND_Y_MAX - GROUND_Y_MIN + 30, 'bg_sidewalk');
      swTile.setOrigin(0, 0);
      swTile.depth = -70;
      if (tint !== 0xffffff) swTile.setTint(tint);
    } else {
      const groundG = this.add.graphics();
      groundG.depth = -70;
      const nearColor = Phaser.Display.Color.HexStringToColor(colors.near).color;
      groundG.fillStyle(nearColor, 0.9);
      groundG.fillRect(-100, GROUND_Y_MIN, stageMaxX + 200, GROUND_Y_MAX - GROUND_Y_MIN + 30);
    }

    // Ground line separator
    const lineG = this.add.graphics();
    lineG.depth = -69;
    lineG.lineStyle(1, 0x555555, 0.5);
    lineG.lineBetween(-100, GROUND_Y_MIN, stageMaxX + 200, GROUND_Y_MIN);

    // Neon signs for downtown feel (stage 1)
    if (this.stageNumber === 1) {
      const neonG = this.add.graphics();
      neonG.depth = -75;
      neonG.setScrollFactor(0.8);
      const neonColors = [0xff4488, 0x44aaff, 0xffaa44, 0x44ff88];
      let nSeed = 42;
      for (let sx = 100; sx < stageMaxX; sx += 200 + ((nSeed = nSeed * 7 + 3) % 150)) {
        const neonColor = neonColors[Math.abs(nSeed) % neonColors.length];
        neonG.fillStyle(neonColor, 0.4);
        neonG.fillRect(sx, 68, 30 + (Math.abs(nSeed * 3) % 20), 8);
        // Neon glow
        neonG.fillStyle(neonColor, 0.15);
        neonG.fillRect(sx - 4, 64, 38 + (Math.abs(nSeed * 3) % 20), 16);
      }
    }
  }

  private handleWaveSpawn(event: { wave: any; sectionIndex: number }): void {
    const { wave, sectionIndex } = event;
    const section = this.levelManager.getSections()[sectionIndex];

    // Spawn enemies
    for (const enemyData of wave.enemies) {
      // Position relative to camera for off-screen spawns
      let spawnX = enemyData.x;
      if (spawnX < 0) {
        spawnX = this.scrollManager.visibleMinX + spawnX;
      } else {
        spawnX = this.scrollManager.visibleMinX + spawnX;
      }

      const enemy = this.createEnemy(enemyData.type, spawnX, enemyData.groundY);
      if (!enemy) continue;

      enemy.setPlayer(this.player);
      enemy.onAttackHit = (damage, knockdown) => {
        this.combatManager.checkEnemyAttackHits(enemy, this.player, damage, knockdown);
      };
      enemy.onDeath = (e) => this.handleEnemyDeath(e);
      enemy.fsm.setState('idle');
      this.enemies.push(enemy);
    }

    // Arena lock
    if (wave.arenaLock) {
      this.arenaWaveActive = true;
      const lockX = this.scrollManager.cameraX;
      this.scrollManager.lockArena(lockX, lockX + GAME_WIDTH);
      this.goArrow.hide();
    }

    // Section transition check
    if (sectionIndex !== this.lastSectionIndex) {
      this.lastSectionIndex = sectionIndex;
    }

    // Spawn boss if section has one and all waves done
    if (section.boss && !this.currentBoss) {
      this.spawnBoss(section.boss.type, this.scrollManager.visibleMinX + section.boss.x - section.startX, section.boss.groundY);
    }
  }

  private createEnemy(type: string, x: number, groundY: number): Enemy | null {
    switch (type) {
      case 'galsia': return new Galsia(this, x, groundY);
      case 'donovan': return new Donovan(this, x, groundY);
      case 'signal': return new Signal(this, x, groundY);
      case 'electra': return new Electra(this, x, groundY);
      case 'bigben': return new BigBen(this, x, groundY);
      case 'barbon': return new Barbon(this, x, groundY);
      case 'jet': return new Jet(this, x, groundY);
      case 'abadede': return new Abadede(this, x, groundY);
      default: {
        // Fallback to generic enemy
        const stats = (ENEMY_STATS as any)[type] || (BOSS_STATS as any)[type];
        if (!stats) return null;
        return new Enemy({
          scene: this, x, groundY, texture: type,
          maxHp: stats.hp, speed: stats.speed, damage: stats.damage,
          score: stats.score, type,
          blockChance: stats.blockChance, superArmor: stats.superArmor,
        });
      }
    }
  }

  private spawnBoss(type: string, x: number, groundY: number): void {
    const boss = this.createEnemy(type, x, groundY);
    if (!boss) return;

    boss.setPlayer(this.player);
    boss.onAttackHit = (damage, knockdown) => {
      this.combatManager.checkEnemyAttackHits(boss, this.player, damage, knockdown);
    };
    boss.onDeath = (e) => this.handleBossDeath(e);
    boss.fsm.setState('idle');

    this.enemies.push(boss);
    this.currentBoss = boss;
    this.bossHealthBar.show(boss);

    // Lock arena for boss fight
    this.arenaWaveActive = true;
    const lockX = this.scrollManager.cameraX;
    this.scrollManager.lockArena(lockX, lockX + GAME_WIDTH);
  }

  private handleEnemyDeath(enemy: Enemy): void {
    this.player.score += enemy.scoreValue;

    // Remove from array
    const idx = this.enemies.indexOf(enemy);
    if (idx >= 0) this.enemies.splice(idx, 1);

    this.aggressionManager.releaseToken(enemy);
    enemy.destroy();

    // Check if arena wave is cleared
    if (this.arenaWaveActive) {
      const activeEnemies = this.enemies.filter(e => e.isActive());
      if (activeEnemies.length === 0) {
        this.arenaWaveActive = false;
        this.scrollManager.unlockArena();
        this.goArrow.show();
        // Auto-hide GO arrow after a delay
        this.time.delayedCall(3000, () => this.goArrow.hide());
      }
    }
  }

  private handleBossDeath(boss: Enemy): void {
    this.player.score += boss.scoreValue;
    this.bossHealthBar.hide();
    this.currentBoss = null;

    const idx = this.enemies.indexOf(boss);
    if (idx >= 0) this.enemies.splice(idx, 1);

    this.aggressionManager.releaseToken(boss);
    boss.destroy();

    this.arenaWaveActive = false;
    this.scrollManager.unlockArena();

    // Stage clear
    this.time.delayedCall(1500, () => {
      this.scene.start('StageClearScene', { stage: this.stageNumber, score: this.player.score });
    });
  }

  update(_time: number, delta: number): void {
    if (this.sectionTransitioning) return;

    // Update player
    this.player.update(delta);
    this.scrollManager.followPlayer(this.player);
    this.scrollManager.clampPlayerX(this.player);
    this.player.updatePosition();

    // Update spawn manager
    this.spawnManager.update(this.scrollManager.cameraX);

    // Update enemies
    this.aggressionManager.update(this.enemies.filter(e => e.isActive()));
    this.positionSlotManager.update(this.player, this.enemies.filter(e => e.isActive()));

    for (const enemy of this.enemies) {
      enemy.update(delta);
    }

    // Combat
    this.combatManager.update(delta);

    // Check pickup collisions
    for (const pickup of this.pickups) {
      if (pickup.collected) continue;
      if (pickup.isNear(this.player.groundX, this.player.groundY)) {
        const heal = pickup.getHealAmount();
        if (heal > 0) this.player.heal(heal);
        this.player.score += pickup.getScoreValue();
        pickup.collect();
        if (this.cache.audio.exists('sfx-pickup')) {
          this.sound.play('sfx-pickup', { volume: 0.5 });
        }
      }
    }

    // Check weapon pickups
    for (const weapon of this.weapons) {
      if (weapon.collected) continue;
      if (weapon.isNear(this.player.groundX, this.player.groundY)) {
        this.player.pickupWeapon(weapon.type);
        weapon.collect();
      }
    }

    // UI
    this.hud.update(this.player, delta);
    this.bossHealthBar.update();
    this.goArrow.update(delta);

    // Game over check
    if (!this.player.alive && this.player.lives <= 0 && this.player.fsm.stateName === 'dead') {
      if (this.player.stateTimer <= 0) {
        this.scene.start('GameOverScene', { stage: this.stageNumber, score: this.player.score });
      }
    }
  }
}
