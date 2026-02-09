import { createCanvas, loadImage, Image } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP = path.join(__dirname, '..', 'tmp_downloads');
const OUT = path.join(__dirname, '..', 'public', 'assets');
const AUDIO_OUT = path.join(OUT, 'audio');

if (!fs.existsSync(AUDIO_OUT)) fs.mkdirSync(AUDIO_OUT, { recursive: true });

// === Frame sizes for our game ===
const FRAME_W = 32;
const FRAME_H = 48;

// ============================================================
// SPRITE ASSEMBLY
// ============================================================

// The Renegade strips are 16x32 per frame. We'll scale them 2x to 32x64,
// then center in 32x48 frames (cropping top slightly).
// For the player sheet we need 36 frames, for enemies 18 frames.

async function loadImg(filepath: string): Promise<Image> {
  return loadImage(filepath);
}

// Scale and center a source frame into a FRAME_W x FRAME_H target
function blitFrame(
  ctx: CanvasRenderingContext2D,
  src: Image,
  srcX: number, srcY: number, srcW: number, srcH: number,
  destFrame: number,
  scale: number = 2
): void {
  const dw = srcW * scale;
  const dh = srcH * scale;
  const dx = destFrame * FRAME_W + Math.floor((FRAME_W - dw) / 2);
  // Align to bottom of frame
  const dy = FRAME_H - dh;
  ctx.drawImage(src, srcX, srcY, srcW, srcH, dx, Math.max(0, dy), dw, dh);
}

// Blit from Aseprite JSON atlas
function blitAtlasFrame(
  ctx: CanvasRenderingContext2D,
  src: Image,
  srcX: number, srcY: number, srcW: number, srcH: number,
  destFrame: number
): void {
  // Scale to fit FRAME_W x FRAME_H while preserving aspect ratio
  const scaleX = FRAME_W / srcW;
  const scaleY = FRAME_H / srcH;
  const scale = Math.min(scaleX, scaleY);
  const dw = Math.floor(srcW * scale);
  const dh = Math.floor(srcH * scale);
  const dx = destFrame * FRAME_W + Math.floor((FRAME_W - dw) / 2);
  const dy = FRAME_H - dh;
  ctx.drawImage(src, srcX, srcY, srcW, srcH, dx, Math.max(0, dy), dw, dh);
}

async function buildPlayerSheet(): Promise<void> {
  console.log('Building player sprite sheet from Renegade...');
  const totalFrames = 36;
  const canvas = createCanvas(FRAME_W * totalFrames, FRAME_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const vig = path.join(TMP, 'vigilante', 'SMS BRAWLER Character Renegade FREE FILES');

  // Load strips
  const idle = await loadImg(path.join(vig, 'Renegade_Idle_1_strip4.png'));      // 64x32, 4 frames of 16x32
  // Walk strip is empty/broken - use Run strip and Strafe as walk
  const walk = await loadImg(path.join(vig, 'Renegade_Strafe_1_strip4.png'));   // 64x32, 4 frames (strafe as walk)
  const run = await loadImg(path.join(vig, 'Renegade_Run_1_strip4.png'));        // 64x32, 4 frames
  const punch1 = await loadImg(path.join(vig, 'Renegade_Punch_1.png'));          // 24x32, 1 frame
  const punch2 = await loadImg(path.join(vig, 'Renegade_Punch_2.png'));          // 24x32, 1 frame
  const kick1 = await loadImg(path.join(vig, 'Renegade_Kick_1.png'));            // 24x32, 1 frame
  const kick2 = await loadImg(path.join(vig, 'Renegade_Kick_2.png'));            // 24x32, 1 frame
  const hurt = await loadImg(path.join(vig, 'Renegade_Hurt.png'));               // 16x32, 1 frame
  const knockout = await loadImg(path.join(vig, 'Renegade_Knock_Out.png'));      // 24x32, 1 frame
  const getup = await loadImg(path.join(vig, 'Renegade_Get_up.png'));            // 16x32, 1 frame
  const headbutt = await loadImg(path.join(vig, 'Renegade_Head_Butt_strip2.png')); // 48x32, 2 frames of 24x32
  const overthrow = await loadImg(path.join(vig, 'Renegade_Over_Throw_strip2.png')); // 48x32, 2 frames
  const stab = await loadImg(path.join(vig, 'Renegade_Stab.png'));               // 24x32, 1 frame
  const pickup = await loadImg(path.join(vig, 'Renegade_Pick_up.png'));          // 16x32, 1 frame
  const carry = await loadImg(path.join(vig, 'Renegade_Carry_Walk_strip4.png')); // 64x32, 4 frames
  const daze = await loadImg(path.join(vig, 'Renegade_Daze_strip4.png'));        // 64x32, 4 frames
  const strafe1 = await loadImg(path.join(vig, 'Renegade_Strafe_1_strip4.png'));

  // Frame layout (matches our animation registration in PreloadScene.ts):
  // 0-1: idle, 2-5: walk, 6: jump, 7-8: jab1, 9-10: jab2, 11-12: straight
  // 13-14: kick, 15-17: finisher, 18: jumpkick, 19: hurt, 20-21: knockdown
  // 22-23: getup, 24-26: special, 27-28: blitz, 29: grab, 30-31: grab-punch
  // 32-33: throw, 34-35: weapon-attack

  // 0-1: Idle (from idle strip, frames 0,1)
  blitFrame(ctx, idle, 0, 0, 16, 32, 0);
  blitFrame(ctx, idle, 16, 0, 16, 32, 1);

  // 2-5: Walk
  blitFrame(ctx, walk, 0, 0, 16, 32, 2);
  blitFrame(ctx, walk, 16, 0, 16, 32, 3);
  blitFrame(ctx, walk, 32, 0, 16, 32, 4);
  blitFrame(ctx, walk, 48, 0, 16, 32, 5);

  // 6: Jump (use idle frame 2 - arms up pose, or strafe frame)
  blitFrame(ctx, strafe1, 0, 0, 16, 32, 6);

  // 7-8: Jab1
  blitFrame(ctx, idle, 0, 0, 16, 32, 7);   // wind up (idle stance)
  blitFrame(ctx, punch1, 0, 0, 24, 32, 8); // punch extended

  // 9-10: Jab2
  blitFrame(ctx, idle, 16, 0, 16, 32, 9);
  blitFrame(ctx, punch2, 0, 0, 24, 32, 10);

  // 11-12: Straight (bigger punch)
  blitFrame(ctx, idle, 32, 0, 16, 32, 11);
  blitFrame(ctx, punch1, 0, 0, 24, 32, 12);

  // 13-14: Kick
  blitFrame(ctx, idle, 0, 0, 16, 32, 13);
  blitFrame(ctx, kick1, 0, 0, 24, 32, 14);

  // 15-17: Finisher (spinning kick)
  blitFrame(ctx, kick1, 0, 0, 24, 32, 15);
  blitFrame(ctx, kick2, 0, 0, 24, 32, 16);
  blitFrame(ctx, kick1, 0, 0, 24, 32, 17);

  // 18: Jump kick
  blitFrame(ctx, kick2, 0, 0, 24, 32, 18);

  // 19: Hurt
  blitFrame(ctx, hurt, 0, 0, 16, 32, 19);

  // 20-21: Knockdown
  blitFrame(ctx, daze, 0, 0, 16, 32, 20);
  blitFrame(ctx, knockout, 0, 0, 24, 32, 21);

  // 22-23: Get up
  blitFrame(ctx, getup, 0, 0, 16, 32, 22);
  blitFrame(ctx, idle, 0, 0, 16, 32, 23);

  // 24-26: Special attack
  blitFrame(ctx, headbutt, 0, 0, 24, 32, 24);
  blitFrame(ctx, headbutt, 24, 0, 24, 32, 25);
  blitFrame(ctx, kick2, 0, 0, 24, 32, 26);

  // 27-28: Blitz (rushing)
  blitFrame(ctx, run, 0, 0, 16, 32, 27);
  blitFrame(ctx, punch1, 0, 0, 24, 32, 28);

  // 29: Grab hold
  blitFrame(ctx, carry, 0, 0, 16, 32, 29);

  // 30-31: Grab punch
  blitFrame(ctx, carry, 0, 0, 16, 32, 30);
  blitFrame(ctx, punch1, 0, 0, 24, 32, 31);

  // 32-33: Throw
  blitFrame(ctx, overthrow, 0, 0, 24, 32, 32);
  blitFrame(ctx, overthrow, 24, 0, 24, 32, 33);

  // 34-35: Weapon attack
  blitFrame(ctx, stab, 0, 0, 24, 32, 34);
  blitFrame(ctx, stab, 0, 0, 24, 32, 35);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, 'player.png'), buffer);
  console.log('  -> player.png (36 frames)');
}

// Build enemy sheets using queen.png frames and fistbot
async function buildEnemyFromQueen(name: string, tintColor: { r: number; g: number; b: number } | null): Promise<void> {
  console.log(`Building ${name} from queen sprite...`);
  const totalFrames = 18;
  const canvas = createCanvas(FRAME_W * totalFrames, FRAME_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // queen.png is 2146x75 - roughly 28 frames at ~76px wide each
  const queen = await loadImg(path.join(TMP, 'queen.png'));
  const fw = 75; // ~75px per frame width
  const fh = 75;

  // Pick frames from the queen sheet for our enemy layout:
  // 0-1: idle, 2-5: walk, 6-8: attack, 9: hurt, 10-11: knockdown
  // 12-13: death, 14: block, 15-17: special

  // Frame indices in queen sheet (approximate - she has idle, walk, attack, hurt, etc)
  const mapping = [
    0, 1,           // idle
    2, 3, 4, 5,     // walk
    8, 9, 10,       // attack
    14,             // hurt
    15, 16,         // knockdown
    17, 18,         // death
    6,              // block
    11, 12, 13,     // special
  ];

  for (let i = 0; i < totalFrames; i++) {
    const srcIdx = mapping[i] || 0;
    const srcX = srcIdx * fw;
    blitAtlasFrame(ctx, queen, srcX, 0, fw, fh, i);
  }

  // Apply tint if specified
  if (tintColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // only tint non-transparent pixels
        data[i] = Math.min(255, Math.floor(data[i] * tintColor.r / 255));
        data[i + 1] = Math.min(255, Math.floor(data[i + 1] * tintColor.g / 255));
        data[i + 2] = Math.min(255, Math.floor(data[i + 2] * tintColor.b / 255));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, `${name}.png`), buffer);
  console.log(`  -> ${name}.png (${totalFrames} frames)`);
}

// Build enemy from fistbot
async function buildFistbotEnemy(name: string, tintColor: { r: number; g: number; b: number } | null): Promise<void> {
  console.log(`Building ${name} from fistbot sprite...`);
  const totalFrames = 18;
  const canvas = createCanvas(FRAME_W * totalFrames, FRAME_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const fistbot = await loadImg(path.join(TMP, 'punchingqueen', 'ingame_spritesheets', 'fistbot.png'));
  // 380x58, 5 frames of 76x58 each
  // Walk: 0-2, Hit: 3, Jab: 4

  const fw = 76;
  const fh = 58;

  // Map to our 18-frame layout by reusing frames
  const mapping = [
    0, 1,         // idle (use walk frames)
    0, 1, 2, 1,   // walk
    3, 4, 3,       // attack (hit, jab, hit)
    3,             // hurt
    3, 3,           // knockdown (reuse hit)
    3, 3,           // death
    0,             // block
    4, 4, 3,       // special
  ];

  for (let i = 0; i < totalFrames; i++) {
    const srcIdx = mapping[i] || 0;
    blitAtlasFrame(ctx, fistbot, srcIdx * fw, 0, fw, fh, i);
  }

  if (tintColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        data[i] = Math.min(255, Math.floor(data[i] * tintColor.r / 255));
        data[i + 1] = Math.min(255, Math.floor(data[i + 1] * tintColor.g / 255));
        data[i + 2] = Math.min(255, Math.floor(data[i + 2] * tintColor.b / 255));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, `${name}.png`), buffer);
  console.log(`  -> ${name}.png (${totalFrames} frames)`);
}

// Build effects sheet from Punching Queen hitspark
async function buildEffectsSheet(): Promise<void> {
  console.log('Building effects sheet...');
  const hitspark = await loadImg(path.join(TMP, 'punchingqueen', 'ingame_spritesheets', 'hitspark.png'));
  // hitspark.png is 80x39, from JSON: probably ~4 frames of 20x39

  const totalFrames = 8;
  const fSize = 16;
  const canvas = createCanvas(fSize * totalFrames, fSize);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Hitspark frames (4 frames)
  const sparkFw = 20;
  for (let i = 0; i < 4; i++) {
    const scale = fSize / Math.max(sparkFw, 39);
    ctx.drawImage(hitspark, i * sparkFw, 0, sparkFw, 39, i * fSize, 0, fSize, fSize);
  }

  // Dust frames (make simple dust puffs)
  for (let i = 0; i < 3; i++) {
    const ox = (4 + i) * fSize;
    ctx.fillStyle = `rgba(170, 170, 170, ${0.6 - i * 0.15})`;
    const r = 3 + i * 2;
    ctx.fillRect(ox + 8 - r, 8 - r / 2, r * 2, r);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, 'effects.png'), buffer);
  console.log('  -> effects.png');
}

// Build pickups from Punching Queen health_pickup
async function buildPickupsSheet(): Promise<void> {
  console.log('Building pickups sheet...');
  const healthPickup = await loadImg(path.join(TMP, 'punchingqueen', 'ingame_spritesheets', 'health_pickup.png'));
  // 228x35 - about 6 frames of 38x35

  const totalFrames = 4;
  const fSize = 16;
  const canvas = createCanvas(fSize * totalFrames, fSize);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Apple (red tint of health pickup first frame)
  ctx.drawImage(healthPickup, 0, 0, 38, 35, 0, 0, fSize, fSize);

  // Chicken (same but different frame)
  ctx.drawImage(healthPickup, 38, 0, 38, 35, fSize, 0, fSize, fSize);

  // Money (yellow rect)
  ctx.fillStyle = '#FFCC00';
  ctx.fillRect(2 * fSize + 4, 4, 8, 8);
  ctx.fillStyle = '#CC9900';
  ctx.fillRect(2 * fSize + 6, 6, 4, 4);

  // 1UP (green)
  ctx.fillStyle = '#44FF44';
  ctx.fillRect(3 * fSize + 4, 4, 8, 8);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(3 * fSize + 7, 6, 2, 4);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, 'pickups.png'), buffer);
  console.log('  -> pickups.png');
}

// Copy street tiles
async function copyStreetTiles(): Promise<void> {
  const src = path.join(TMP, 'street_tiles.png');
  const dest = path.join(OUT, 'street_tiles.png');
  fs.copyFileSync(src, dest);
  console.log('  -> street_tiles.png (background tile set)');
}

// ============================================================
// AUDIO CONVERSION
// ============================================================

function convertAudio(src: string, dest: string): void {
  try {
    execSync(`ffmpeg -y -i "${src}" -c:a libvorbis -q:a 4 "${dest}" 2>/dev/null`);
  } catch {
    // Try mp3 fallback
    try {
      const mp3Dest = dest.replace('.ogg', '.mp3');
      execSync(`ffmpeg -y -i "${src}" -c:a libmp3lame -q:a 6 "${mp3Dest}" 2>/dev/null`);
    } catch {
      console.warn(`  [WARN] Could not convert ${src}`);
    }
  }
}

function convertWavToOgg(src: string, dest: string): void {
  try {
    execSync(`ffmpeg -y -i "${src}" -c:a libvorbis -q:a 3 "${dest}" 2>/dev/null`);
  } catch {
    console.warn(`  [WARN] Could not convert ${src}`);
  }
}

function convertFlacToOgg(src: string, dest: string): void {
  try {
    execSync(`ffmpeg -y -i "${src}" -c:a libvorbis -q:a 4 "${dest}" 2>/dev/null`);
  } catch {
    console.warn(`  [WARN] Could not convert ${src}`);
  }
}

async function processAudio(): Promise<void> {
  console.log('\nProcessing audio...');

  // === Music (WAV -> OGG) ===
  console.log('Converting music tracks...');
  convertWavToOgg(path.join(TMP, 'menu_music.wav'), path.join(AUDIO_OUT, 'menu.ogg'));
  console.log('  -> menu.ogg');
  convertWavToOgg(path.join(TMP, 'stage1_music.wav'), path.join(AUDIO_OUT, 'stage1.ogg'));
  console.log('  -> stage1.ogg');
  convertWavToOgg(path.join(TMP, 'stage2_music.wav'), path.join(AUDIO_OUT, 'stage2.ogg'));
  console.log('  -> stage2.ogg');
  convertWavToOgg(path.join(TMP, 'stage3_music.wav'), path.join(AUDIO_OUT, 'stage3.ogg'));
  console.log('  -> stage3.ogg');

  // === SFX from retro pack (WAV -> OGG) ===
  console.log('Converting retro SFX...');
  const sfxMap: Record<string, string> = {
    'SoundBlowClub.wav': 'hit1.ogg',
    'SoundBlowDull.wav': 'hit2.ogg',
    'SoundEnemyHit.wav': 'enemy_hit.ogg',
    'SoundEnemyDeath.wav': 'enemy_death.ogg',
    'SoundDeath.wav': 'player_death.ogg',
    'SoundGameOver.wav': 'game_over.ogg',
    'SoundJump1.wav': 'jump.ogg',
    'SoundBonus.wav': 'pickup.ogg',
    'SoundCoin.wav': 'coin.ogg',
    'SoundExplosionSmall.wav': 'explosion.ogg',
    'SoundFallDull.wav': 'fall.ogg',
    'SoundClick.wav': 'menu_select.ogg',
    'SoundHurryUp.wav': 'hurry.ogg',
    'SoundCountdown.wav': 'countdown.ogg',
  };

  for (const [src, dest] of Object.entries(sfxMap)) {
    const srcPath = path.join(TMP, 'retro_sfx', src);
    if (fs.existsSync(srcPath)) {
      convertWavToOgg(srcPath, path.join(AUDIO_OUT, dest));
      console.log(`  -> ${dest}`);
    }
  }

  // === Hit sounds from hits.zip (OGG -> copy, pick best ones) ===
  console.log('Selecting punch/kick sounds...');
  const hitsToCopy: Record<string, string> = {
    '1.ogg': 'punch1.ogg',
    '3.ogg': 'punch2.ogg',
    '5.ogg': 'punch3.ogg',
    '7.ogg': 'kick1.ogg',
    '9.ogg': 'kick2.ogg',
    '11.ogg': 'slap1.ogg',
  };
  for (const [src, dest] of Object.entries(hitsToCopy)) {
    const srcPath = path.join(TMP, 'hits', src);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(AUDIO_OUT, dest));
      console.log(`  -> ${dest}`);
    }
  }

  // === Hit sounds from 37hits pack (FLAC -> OGG, pick a few) ===
  console.log('Converting heavy hit sounds...');
  const heavyHits: Record<string, string> = {
    'hit01.mp3.flac': 'heavy_hit1.ogg',
    'hit05.mp3.flac': 'heavy_hit2.ogg',
    'hit10.mp3.flac': 'heavy_hit3.ogg',
    'hit15.mp3.flac': 'knockdown.ogg',
    'hit20.mp3.flac': 'throw.ogg',
  };
  for (const [src, dest] of Object.entries(heavyHits)) {
    const srcPath = path.join(TMP, '37hits', 'hits', src);
    if (fs.existsSync(srcPath)) {
      convertFlacToOgg(srcPath, path.join(AUDIO_OUT, dest));
      console.log(`  -> ${dest}`);
    }
  }
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  console.log('=== Integrating online assets ===\n');

  // Sprites
  console.log('--- SPRITES ---');
  await buildPlayerSheet();

  // Enemies using queen (tinted differently for variety)
  await buildEnemyFromQueen('galsia', null);                               // original colors
  await buildEnemyFromQueen('donovan', { r: 180, g: 160, b: 140 });      // brownish
  await buildEnemyFromQueen('signal', { r: 140, g: 255, b: 140 });       // greenish
  await buildEnemyFromQueen('electra', { r: 200, g: 140, b: 255 });      // purplish

  // BigBen and bosses using fistbot (tinted)
  await buildFistbotEnemy('bigben', null);                                 // original
  await buildFistbotEnemy('barbon', { r: 255, g: 200, b: 200 });         // reddish
  await buildFistbotEnemy('jet', { r: 150, g: 200, b: 255 });            // bluish
  await buildFistbotEnemy('abadede', { r: 255, g: 150, b: 100 });        // orange

  await buildEffectsSheet();
  await buildPickupsSheet();
  await copyStreetTiles();

  // Audio
  await processAudio();

  console.log('\n=== Done! All assets integrated. ===');
  console.log('\nCredits:');
  console.log('  Sprites: "Brawler Vigilante" by Chasersgaming (CC0)');
  console.log('  Sprites: "Punching Queen" by Chewbatrij (CC0)');
  console.log('  Sprites: "Street Tile Set" (CC0)');
  console.log('  SFX: "Punch, slap, n kick" by CGEffex (CC-BY 3.0)');
  console.log('  SFX: "37 hits/punches" by Independent.nu (CC0)');
  console.log('  SFX: "Retro game sound effects" by Vircon32/Carra (CC-BY 4.0)');
  console.log('  Music: "Arcade Level Tracks" by wyver9 (CC-BY-SA 3.0)');
}

main().catch(console.error);
