export type DamageType = 'normal' | 'knockdown' | 'throw' | 'special';

export interface HitResult {
  hit: boolean;
  damage: number;
  knockdown: boolean;
  blocked: boolean;
}
