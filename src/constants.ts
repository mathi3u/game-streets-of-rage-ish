// === Display ===
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 224;
export const SCALE_FACTOR = 3;

// === 2.5D Ground plane ===
export const GROUND_Y_MIN = 120;
export const GROUND_Y_MAX = 200;

// === Player ===
export const PLAYER_SPEED = 80;
export const PLAYER_DEPTH_SPEED = 40;
export const PLAYER_HP = 104;
export const PLAYER_LIVES = 3;
export const PLAYER_JUMP_VELOCITY = -180;
export const PLAYER_GRAVITY = 500;

// === Combo timing ===
export const COMBO_WINDOW_MS = 500;
export const COMBO_CHAIN = [
  { name: 'jab1', damage: 6, frames: 12 },
  { name: 'jab2', damage: 6, frames: 12 },
  { name: 'straight', damage: 8, frames: 14 },
  { name: 'kick', damage: 10, frames: 16 },
  { name: 'finisher', damage: 14, frames: 20, knockdown: true },
] as const;

// === Special attack ===
export const SPECIAL_DAMAGE = 20;
export const SPECIAL_HP_COST = 8;
export const SPECIAL_INVULN_MS = 800;

// === Blitz attack ===
export const BLITZ_DAMAGE = 12;
export const BLITZ_SPEED = 200;
export const BLITZ_DURATION_MS = 300;
export const DOUBLE_TAP_MS = 250;

// === Grab ===
export const GRAB_RANGE_X = 30;
export const GRAB_RANGE_Y = 10;
export const GRAB_PUNCH_DAMAGE = 4;
export const GRAB_THROW_DAMAGE = 16;

// === Enemies ===
export const ENEMY_STATS = {
  galsia:  { hp: 44, speed: 40, damage: 6, score: 200 },
  donovan: { hp: 56, speed: 35, damage: 8, score: 400, blockChance: 0.3 },
  signal:  { hp: 64, speed: 55, damage: 10, score: 600 },
  electra: { hp: 80, speed: 45, damage: 12, score: 800 },
  bigben:  { hp: 120, speed: 25, damage: 16, score: 1200, superArmor: true },
} as const;

// === Bosses ===
export const BOSS_STATS = {
  barbon:  { hp: 200, speed: 35, damage: 14, score: 5000 },
  jet:     { hp: 140, speed: 60, damage: 12, score: 6000 },
  abadede: { hp: 300, speed: 30, damage: 18, score: 10000, superArmor: true },
} as const;

// === AI ===
export const MAX_ATTACKERS = 2;
export const FLANKING_SLOTS = 2;
export const SLOT_DISTANCE_X = 56;
export const SLOT_DISTANCE_Y = 0;
export const AI_REACT_DELAY_MS = 300;

// === Combat hit detection ===
export const HIT_RANGE_X = 36;
export const HIT_RANGE_Y = 12;
export const HIT_RANGE_Z = 20;

// === Knockback ===
export const KNOCKBACK_SPEED = 120;
export const KNOCKBACK_DURATION_MS = 200;
export const KNOCKDOWN_BOUNCE_VEL = -80;
export const INVULN_FLASH_MS = 1500;

// === Pickups ===
export const PICKUP_APPLE_HP = 16;
export const PICKUP_CHICKEN_HP = 40;
export const SECTION_HEAL_HP = 8;

// === Scroll / Camera ===
export const CAMERA_DEAD_ZONE_X = 8;
export const SCROLL_SPEED = 80;

// === Sprite dimensions ===
export const SPRITE_WIDTH = 48;
export const SPRITE_HEIGHT = 64;

// === Timing ===
export const HURT_STUN_MS = 300;
export const KNOCKDOWN_DURATION_MS = 1000;
export const GETUP_DURATION_MS = 400;
export const DEATH_DURATION_MS = 1500;

// === Weapons ===
export const WEAPON_KNIFE_DAMAGE = 10;
export const WEAPON_PIPE_DAMAGE = 14;
export const WEAPON_THROW_DAMAGE = 12;
export const WEAPON_DURABILITY = 5;
