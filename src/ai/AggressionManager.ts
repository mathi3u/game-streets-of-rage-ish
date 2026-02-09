import { Enemy } from '../entities/Enemy';
import { MAX_ATTACKERS } from '../constants';

export class AggressionManager {
  private tokens: Enemy[] = [];
  private maxTokens: number = MAX_ATTACKERS;

  requestToken(enemy: Enemy): boolean {
    if (this.tokens.length >= this.maxTokens) return false;
    if (this.tokens.includes(enemy)) return true;
    this.tokens.push(enemy);
    enemy.hasAggressionToken = true;
    return true;
  }

  releaseToken(enemy: Enemy): void {
    const idx = this.tokens.indexOf(enemy);
    if (idx >= 0) {
      this.tokens.splice(idx, 1);
      enemy.hasAggressionToken = false;
    }
  }

  update(enemies: Enemy[]): void {
    // Remove tokens from dead/inactive enemies
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const enemy = this.tokens[i];
      if (!enemy.isActive()) {
        this.tokens.splice(i, 1);
        enemy.hasAggressionToken = false;
      }
    }

    // Grant tokens to waiting enemies
    const waiting = enemies.filter(e => e.isActive() && !e.hasAggressionToken);
    for (const enemy of waiting) {
      if (this.tokens.length >= this.maxTokens) break;
      this.requestToken(enemy);
    }
  }

  reset(): void {
    for (const enemy of this.tokens) {
      enemy.hasAggressionToken = false;
    }
    this.tokens = [];
  }
}
