export interface HitBox {
  offsetX: number;   // offset from entity center (facing-aware)
  offsetY: number;   // depth offset
  width: number;     // range on X axis
  height: number;    // range on depth (Y) axis
  zBottom: number;   // min height to hit
  zTop: number;      // max height to hit
}

export const DEFAULT_MELEE_HITBOX: HitBox = {
  offsetX: 24,
  offsetY: 0,
  width: 36,
  height: 12,
  zBottom: 0,
  zTop: 32,
};

export const JUMP_KICK_HITBOX: HitBox = {
  offsetX: 18,
  offsetY: 0,
  width: 28,
  height: 10,
  zBottom: 0,
  zTop: 40,
};

export const SPECIAL_HITBOX: HitBox = {
  offsetX: 0,
  offsetY: 0,
  width: 56,
  height: 20,
  zBottom: 0,
  zTop: 40,
};
