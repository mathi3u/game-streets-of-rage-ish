import Phaser from 'phaser';
import { SectionData, SpawnWave } from './Section';
import { GAME_WIDTH } from '../constants';

export interface SpawnEvent {
  wave: SpawnWave;
  sectionIndex: number;
}

export class SpawnManager {
  private sections: SectionData[];
  private triggeredWaves: Set<string> = new Set();
  private currentSectionIndex: number = 0;

  onSpawnWave?: (event: SpawnEvent) => void;

  constructor(sections: SectionData[]) {
    this.sections = sections;
  }

  update(cameraX: number): void {
    for (let si = 0; si < this.sections.length; si++) {
      const section = this.sections[si];
      for (let wi = 0; wi < section.waves.length; wi++) {
        const wave = section.waves[wi];
        const key = `${si}_${wi}`;

        if (this.triggeredWaves.has(key)) continue;

        // Trigger when camera reaches the wave's triggerX (offset by section start)
        const worldTriggerX = section.startX + wave.triggerX;
        if (cameraX + GAME_WIDTH * 0.5 >= worldTriggerX) {
          this.triggeredWaves.add(key);
          this.currentSectionIndex = si;
          this.onSpawnWave?.({ wave, sectionIndex: si });
        }
      }
    }
  }

  getCurrentSection(): SectionData | undefined {
    return this.sections[this.currentSectionIndex];
  }

  getSectionIndex(): number {
    return this.currentSectionIndex;
  }

  reset(): void {
    this.triggeredWaves.clear();
    this.currentSectionIndex = 0;
  }
}
