export interface SpawnWave {
  triggerX: number;          // camera X position that triggers this wave
  enemies: { type: string; x: number; groundY: number }[];
  arenaLock?: boolean;       // lock camera until wave cleared
}

export interface SectionData {
  startX: number;
  endX: number;
  waves: SpawnWave[];
  pickups?: { type: string; x: number; groundY: number }[];
  weapons?: { type: string; x: number; groundY: number }[];
  boss?: { type: string; x: number; groundY: number };
  background: {
    color: string;
    farColor?: string;
    midColor?: string;
  };
}

export interface StageData {
  name: string;
  sections: SectionData[];
  parallaxColors: {
    far: string;
    mid: string;
    near: string;
  };
}
