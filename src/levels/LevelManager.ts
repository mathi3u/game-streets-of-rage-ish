import { StageData, SectionData } from './Section';
import { stage1Data } from './stages/stage1';
import { stage2Data } from './stages/stage2';
import { stage3Data } from './stages/stage3';

const STAGES: Record<number, StageData> = {
  1: stage1Data,
  2: stage2Data,
  3: stage3Data,
};

export class LevelManager {
  private stageNumber: number;
  private stageData: StageData;

  constructor(stageNumber: number) {
    this.stageNumber = stageNumber;
    this.stageData = STAGES[stageNumber] || stage1Data;
  }

  getStageData(): StageData {
    return this.stageData;
  }

  getSections(): SectionData[] {
    return this.stageData.sections;
  }

  getStageName(): string {
    return this.stageData.name;
  }

  getStageNumber(): number {
    return this.stageNumber;
  }

  getMaxX(): number {
    const sections = this.stageData.sections;
    return sections[sections.length - 1].endX;
  }

  getParallaxColors(): { far: string; mid: string; near: string } {
    return this.stageData.parallaxColors;
  }
}
