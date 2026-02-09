import { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { HitBox, DEFAULT_MELEE_HITBOX, SPECIAL_HITBOX } from './HitBox';
import { KNOCKBACK_SPEED } from '../constants';
import Phaser from 'phaser';

export class CombatManager {
  private scene: Phaser.Scene;
  private hitCooldowns: Map<string, number> = new Map();
  private readonly HIT_COOLDOWN_MS = 200;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  checkPlayerAttackHits(player: Player, enemies: Enemy[], damage: number, knockdown: boolean, isSpecial: boolean = false): Enemy[] {
    const hitbox = isSpecial ? SPECIAL_HITBOX : DEFAULT_MELEE_HITBOX;
    const hitEnemies: Enemy[] = [];

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (enemy.fsm.isInState('knockdown', 'death')) continue;

      // Cooldown check
      const cooldownKey = `p_${enemy.sprite.name}`;
      const lastHit = this.hitCooldowns.get(cooldownKey) || 0;
      if (this.scene.time.now - lastHit < this.HIT_COOLDOWN_MS) continue;

      if (this.checkHit(player, enemy, hitbox)) {
        // Check block
        if (enemy.canBlock && !knockdown && !isSpecial && Math.random() < (enemy.blockChance || 0)) {
          enemy.onBlocked();
          continue;
        }

        const fromX = player.groundX;
        enemy.hitByPlayer(damage, knockdown, fromX);
        this.hitCooldowns.set(cooldownKey, this.scene.time.now);
        hitEnemies.push(enemy);

        // Hit SFX
        if (knockdown) {
          this.playSfx('sfx-heavy-hit');
        } else {
          const sfxKeys = ['sfx-punch1', 'sfx-punch2', 'sfx-punch3'];
          this.playSfx(sfxKeys[Math.floor(Math.random() * sfxKeys.length)]);
        }

        // Hit effect
        this.spawnHitSpark(
          (player.groundX + enemy.groundX) / 2,
          (player.groundY + enemy.groundY) / 2 - 20
        );
      }
    }

    return hitEnemies;
  }

  checkEnemyAttackHits(enemy: Enemy, player: Player, damage: number, knockdown: boolean): boolean {
    if (!player.canBeHit()) return false;

    const hitbox = DEFAULT_MELEE_HITBOX;
    if (this.checkHit(enemy, player, hitbox)) {
      player.hitByEnemy(damage, knockdown, enemy.groundX);
      this.playSfx(knockdown ? 'sfx-knockdown' : 'sfx-enemy-hit');
      this.spawnHitSpark(
        (enemy.groundX + player.groundX) / 2,
        (enemy.groundY + player.groundY) / 2 - 20
      );
      return true;
    }
    return false;
  }

  checkGrabProximity(player: Player, enemies: Enemy[]): Enemy | null {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (enemy.fsm.isInState('knockdown', 'death', 'hurt')) continue;

      const dist = player.distanceTo(enemy);
      // Face-to-face check: player facing enemy
      const facingEnemy = (player.facing > 0 && enemy.groundX > player.groundX) ||
                          (player.facing < 0 && enemy.groundX < player.groundX);

      if (facingEnemy && dist.dx < 20 && dist.dy < 8 && dist.dz < 16) {
        return enemy;
      }
    }
    return null;
  }

  private checkHit(attacker: Entity, target: Entity, hitbox: HitBox): boolean {
    const hbX = attacker.groundX + hitbox.offsetX * attacker.facing;
    const hbY = attacker.groundY + hitbox.offsetY;

    const dx = Math.abs(hbX - target.groundX);
    const dy = Math.abs(hbY - target.groundY);
    const targetZ = target.zHeight;

    return dx < hitbox.width && dy < hitbox.height && targetZ >= hitbox.zBottom && targetZ <= hitbox.zTop;
  }

  private spawnHitSpark(x: number, y: number): void {
    if (!this.scene.anims.exists('hit-spark')) {
      // Create simple flash effect without sprite sheet
      const flash = this.scene.add.circle(x, y, 6, 0xffffff);
      flash.depth = 999;
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 150,
        onComplete: () => flash.destroy(),
      });
      return;
    }
    const spark = this.scene.add.sprite(x, y, 'effects');
    spark.depth = 999;
    spark.play('hit-spark');
    spark.once('animationcomplete', () => spark.destroy());
  }

  // Screen shake on big hits
  shakeCamera(intensity: number = 0.005, duration: number = 100): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  private playSfx(key: string): void {
    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { volume: 0.5 });
    }
  }

  update(_dt: number): void {
    // Cleanup old cooldowns periodically
    const now = this.scene.time.now;
    for (const [key, time] of this.hitCooldowns) {
      if (now - time > 1000) this.hitCooldowns.delete(key);
    }
  }
}
