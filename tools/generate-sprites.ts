import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRAME_W = 48;
const FRAME_H = 64;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ===== 3-shade color ramp palettes =====
interface ColorRamp {
  hi: string;   // highlight
  base: string; // base color
  lo: string;   // shadow
}

interface Palette {
  skin: ColorRamp;
  hair: ColorRamp;
  shirt: ColorRamp;
  pants: ColorRamp;
  shoes: ColorRamp;
  belt: ColorRamp;
  outline: string;
  eyeColor: string;
}

// Character build types
type Build = 'lean' | 'athletic' | 'stocky' | 'slim' | 'large' | 'tall' | 'huge';

interface CharDesign {
  palette: Palette;
  build: Build;
  // Unique features
  headband?: string;       // color for headband
  sunglasses?: boolean;
  mohawk?: boolean;
  mohawkWidth?: number;
  longHair?: boolean;
  ponytail?: boolean;
  vest?: boolean;
  vestColor?: ColorRamp;
  beerBelly?: boolean;
  bareChest?: boolean;
  corset?: boolean;
  bandana?: string;
}

const DESIGNS: Record<string, CharDesign> = {
  player: {
    palette: {
      skin: { hi: '#FFE8C8', base: '#DDAA77', lo: '#AA7744' },
      hair: { hi: '#D4B87A', base: '#C4A35A', lo: '#8A7030' },
      shirt: { hi: '#4488EE', base: '#2266CC', lo: '#1144AA' },
      pants: { hi: '#2A2A5A', base: '#1A1A3A', lo: '#101028' },
      shoes: { hi: '#664433', base: '#442222', lo: '#2A1111' },
      belt: { hi: '#886644', base: '#664422', lo: '#442200' },
      outline: '#1A1A3A',
      eyeColor: '#114488',
    },
    build: 'athletic',
    headband: '#CC2222',
  },
  galsia: {
    palette: {
      skin: { hi: '#FFD8AA', base: '#DDB88C', lo: '#AA8866' },
      hair: { hi: '#555555', base: '#333333', lo: '#111111' },
      shirt: { hi: '#EE6644', base: '#CC4422', lo: '#992211' },
      pants: { hi: '#666666', base: '#444444', lo: '#222222' },
      shoes: { hi: '#444444', base: '#222222', lo: '#111111' },
      belt: { hi: '#554433', base: '#443322', lo: '#332211' },
      outline: '#221111',
      eyeColor: '#332211',
    },
    build: 'lean',
  },
  donovan: {
    palette: {
      skin: { hi: '#DDB090', base: '#C09070', lo: '#906050' },
      hair: { hi: '#444444', base: '#222222', lo: '#111111' },
      shirt: { hi: '#AA8866', base: '#886644', lo: '#664422' },
      pants: { hi: '#555555', base: '#333333', lo: '#222222' },
      shoes: { hi: '#333333', base: '#111111', lo: '#000000' },
      belt: { hi: '#554433', base: '#443322', lo: '#332211' },
      outline: '#221111',
      eyeColor: '#221111',
    },
    build: 'stocky',
    sunglasses: true,
    vest: true,
    vestColor: { hi: '#665544', base: '#443322', lo: '#332211' },
  },
  signal: {
    palette: {
      skin: { hi: '#FFD8AA', base: '#DDB88C', lo: '#AA8866' },
      hair: { hi: '#FFFF66', base: '#FFEE44', lo: '#CCAA22' },
      shirt: { hi: '#66CC66', base: '#44AA44', lo: '#228822' },
      pants: { hi: '#558855', base: '#336633', lo: '#224422' },
      shoes: { hi: '#444444', base: '#222222', lo: '#111111' },
      belt: { hi: '#445544', base: '#334433', lo: '#223322' },
      outline: '#113311',
      eyeColor: '#336633',
    },
    build: 'lean',
    bandana: '#44AA44',
  },
  electra: {
    palette: {
      skin: { hi: '#FFE8D0', base: '#FFD4A3', lo: '#CCAA88' },
      hair: { hi: '#EE66CC', base: '#CC44AA', lo: '#993377' },
      shirt: { hi: '#AA44CC', base: '#8822AA', lo: '#661188' },
      pants: { hi: '#442266', base: '#331144', lo: '#220033' },
      shoes: { hi: '#444444', base: '#222222', lo: '#111111' },
      belt: { hi: '#AA44CC', base: '#882299', lo: '#661177' },
      outline: '#220033',
      eyeColor: '#882299',
    },
    build: 'slim',
    longHair: true,
    corset: true,
  },
  bigben: {
    palette: {
      skin: { hi: '#CCAA88', base: '#AA8866', lo: '#886644' },
      hair: { hi: '#333333', base: '#111111', lo: '#000000' },
      shirt: { hi: '#888888', base: '#666666', lo: '#444444' },
      pants: { hi: '#666666', base: '#444444', lo: '#333333' },
      shoes: { hi: '#444444', base: '#222222', lo: '#111111' },
      belt: { hi: '#665544', base: '#554433', lo: '#443322' },
      outline: '#111111',
      eyeColor: '#332211',
    },
    build: 'large',
    beerBelly: true,
  },
  barbon: {
    palette: {
      skin: { hi: '#DDB090', base: '#C09070', lo: '#906050' },
      hair: { hi: '#333333', base: '#111111', lo: '#000000' },
      shirt: { hi: '#FFFFFF', base: '#EEEEEE', lo: '#CCCCCC' },
      pants: { hi: '#444444', base: '#222222', lo: '#111111' },
      shoes: { hi: '#333333', base: '#111111', lo: '#000000' },
      belt: { hi: '#443322', base: '#332211', lo: '#221100' },
      outline: '#111111',
      eyeColor: '#221111',
    },
    build: 'tall',
    vest: true,
    vestColor: { hi: '#555555', base: '#333333', lo: '#222222' },
  },
  jet: {
    palette: {
      skin: { hi: '#FFD8AA', base: '#DDB88C', lo: '#AA8866' },
      hair: { hi: '#66CCEE', base: '#44AACC', lo: '#228899' },
      shirt: { hi: '#556677', base: '#334455', lo: '#223344' },
      pants: { hi: '#444455', base: '#222233', lo: '#111122' },
      shoes: { hi: '#333333', base: '#111111', lo: '#000000' },
      belt: { hi: '#445566', base: '#334455', lo: '#223344' },
      outline: '#112233',
      eyeColor: '#44AACC',
    },
    build: 'lean',
    mohawk: true,
    mohawkWidth: 6,
  },
  abadede: {
    palette: {
      skin: { hi: '#CCAA88', base: '#BB8866', lo: '#886644' },
      hair: { hi: '#886644', base: '#664422', lo: '#442200' },
      shirt: { hi: '#CC4444', base: '#AA2222', lo: '#881111' },
      pants: { hi: '#554444', base: '#332222', lo: '#221111' },
      shoes: { hi: '#443322', base: '#221111', lo: '#110000' },
      belt: { hi: '#AA3333', base: '#882222', lo: '#661111' },
      outline: '#110000',
      eyeColor: '#881111',
    },
    build: 'huge',
    bareChest: true,
    vest: true,
    vestColor: { hi: '#CC4444', base: '#AA2222', lo: '#881111' },
  },
};

// ===== Build dimensions =====
interface BodyDims {
  headW: number; headH: number;
  shoulderW: number; waistW: number; torsoH: number;
  armW: number; armLen: number;
  legW: number; legLen: number;
  footW: number; footH: number;
  totalH: number;
}

function getBuildDims(build: Build): BodyDims {
  switch (build) {
    case 'lean':
      return { headW: 10, headH: 10, shoulderW: 14, waistW: 10, torsoH: 13, armW: 3, armLen: 11, legW: 4, legLen: 13, footW: 5, footH: 3, totalH: 48 };
    case 'athletic':
      return { headW: 10, headH: 10, shoulderW: 16, waistW: 12, torsoH: 14, armW: 4, armLen: 12, legW: 5, legLen: 14, footW: 6, footH: 3, totalH: 50 };
    case 'stocky':
      return { headW: 10, headH: 10, shoulderW: 18, waistW: 16, torsoH: 14, armW: 4, armLen: 11, legW: 5, legLen: 12, footW: 6, footH: 3, totalH: 48 };
    case 'slim':
      return { headW: 9, headH: 10, shoulderW: 12, waistW: 10, torsoH: 13, armW: 3, armLen: 11, legW: 4, legLen: 14, footW: 5, footH: 3, totalH: 48 };
    case 'large':
      return { headW: 11, headH: 10, shoulderW: 20, waistW: 20, torsoH: 15, armW: 5, armLen: 12, legW: 6, legLen: 12, footW: 7, footH: 3, totalH: 50 };
    case 'tall':
      return { headW: 10, headH: 10, shoulderW: 17, waistW: 13, torsoH: 15, armW: 4, armLen: 13, legW: 5, legLen: 15, footW: 6, footH: 3, totalH: 52 };
    case 'huge':
      return { headW: 12, headH: 11, shoulderW: 22, waistW: 18, torsoH: 16, armW: 6, armLen: 14, legW: 7, legLen: 14, footW: 8, footH: 4, totalH: 54 };
  }
}

// ===== Drawing primitives =====

function fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// Draw outlined rectangle with 3-shade shading (light from top-left)
function drawShadedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ramp: ColorRamp, outline: string): void {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (w <= 0 || h <= 0) return;
  // Outline
  fillRect(ctx, x - 1, y, w + 2, h, outline);
  fillRect(ctx, x, y - 1, w, h + 2, outline);
  // Base fill
  fillRect(ctx, x, y, w, h, ramp.base);
  // Highlight strip (top)
  if (h > 2) fillRect(ctx, x, y, w, 1, ramp.hi);
  // Highlight strip (left)
  if (w > 2) fillRect(ctx, x, y, 1, h, ramp.hi);
  // Shadow strip (bottom)
  if (h > 2) fillRect(ctx, x, y + h - 1, w, 1, ramp.lo);
  // Shadow strip (right)
  if (w > 2) fillRect(ctx, x + w - 1, y, 1, h, ramp.lo);
}

// Draw a round-ish head
function drawHead(ctx: CanvasRenderingContext2D, cx: number, topY: number, dims: BodyDims, design: CharDesign): void {
  const p = design.palette;
  const hw = dims.headW;
  const hh = dims.headH;
  const x = cx - Math.floor(hw / 2);

  // Head outline
  fillRect(ctx, x - 1, topY, hw + 2, hh, p.outline);
  fillRect(ctx, x, topY - 1, hw, hh + 2, p.outline);
  // Rounded corners
  fillRect(ctx, x - 1, topY, 1, 1, 'rgba(0,0,0,0)');
  fillRect(ctx, x + hw, topY, 1, 1, 'rgba(0,0,0,0)');

  // Face fill
  fillRect(ctx, x, topY, hw, hh, p.skin.base);
  // Highlight (forehead)
  fillRect(ctx, x + 1, topY, hw - 2, 2, p.skin.hi);
  // Shadow (chin)
  fillRect(ctx, x + 1, topY + hh - 2, hw - 2, 2, p.skin.lo);

  // Hair
  if (design.mohawk) {
    const mw = design.mohawkWidth || 4;
    fillRect(ctx, cx - Math.floor(mw / 2), topY - 4, mw, 5, p.hair.base);
    fillRect(ctx, cx - Math.floor(mw / 2), topY - 4, mw, 1, p.hair.hi);
    fillRect(ctx, cx - Math.floor(mw / 2) - 1, topY - 4, 1, 5, p.outline);
    fillRect(ctx, cx + Math.floor(mw / 2), topY - 4, 1, 5, p.outline);
  } else if (design.longHair) {
    fillRect(ctx, x - 1, topY - 1, hw + 2, 4, p.hair.base);
    fillRect(ctx, x - 1, topY - 1, hw + 2, 1, p.hair.hi);
    // Long hair sides
    fillRect(ctx, x - 2, topY + 2, 2, hh + 4, p.hair.base);
    fillRect(ctx, x + hw, topY + 2, 2, hh + 4, p.hair.base);
    fillRect(ctx, x - 2, topY + 2, 1, hh + 4, p.hair.lo);
    fillRect(ctx, x + hw + 1, topY + 2, 1, hh + 4, p.hair.lo);
  } else {
    // Standard hair
    fillRect(ctx, x, topY - 1, hw, 4, p.hair.base);
    fillRect(ctx, x, topY - 1, hw, 1, p.hair.hi);
    fillRect(ctx, x, topY + 2, hw, 1, p.hair.lo);
  }

  // Eyes
  const eyeY = topY + Math.floor(hh / 2);
  if (design.sunglasses) {
    fillRect(ctx, x + 2, eyeY - 1, hw - 4, 3, '#111111');
    fillRect(ctx, x + 2, eyeY - 1, hw - 4, 1, '#333333');
  } else {
    fillRect(ctx, cx - 3, eyeY, 2, 2, p.eyeColor);
    fillRect(ctx, cx + 1, eyeY, 2, 2, p.eyeColor);
    // Eye highlights
    fillRect(ctx, cx - 3, eyeY, 1, 1, '#FFFFFF');
    fillRect(ctx, cx + 1, eyeY, 1, 1, '#FFFFFF');
  }

  // Mouth
  fillRect(ctx, cx - 1, topY + hh - 3, 2, 1, p.skin.lo);

  // Headband
  if (design.headband) {
    fillRect(ctx, x - 1, topY + 2, hw + 2, 2, design.headband);
    // Tail
    fillRect(ctx, x - 3, topY + 2, 3, 1, design.headband);
    fillRect(ctx, x - 4, topY + 3, 2, 1, design.headband);
  }

  // Bandana
  if (design.bandana) {
    fillRect(ctx, x, topY - 1, hw, 3, design.bandana);
    fillRect(ctx, x + hw, topY, 3, 2, design.bandana);
  }
}

// Pose definition for skeletal renderer
interface Pose {
  lean?: number;           // torso lean in pixels
  armLAngle?: number;      // -2=up, -1=raised, 0=down, 1=back, 2=far back
  armRAngle?: number;
  armLExtend?: number;     // 0=normal, 1-N=extra reach in pixels
  armRExtend?: number;
  legLOffset?: number;     // left leg X spread
  legROffset?: number;
  legLBend?: number;       // 0=straight, 1=bent forward, -1=bent back
  legRBend?: number;
  ducking?: boolean;
  jumping?: boolean;
  lyingDown?: boolean;     // flat on ground (knockdown frame 2)
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  design: CharDesign,
  pose: Pose = {}
): void {
  const p = design.palette;
  const dims = getBuildDims(design.build);
  const cx = Math.floor(FRAME_W / 2) + (pose.lean || 0);

  // Calculate vertical positions
  const bottomY = FRAME_H - 2; // 2px from bottom for feet
  const feetY = bottomY - dims.footH;
  const legTopY = feetY - dims.legLen + (pose.ducking ? 4 : 0);
  const torsoBottomY = legTopY;
  const torsoTopY = torsoBottomY - dims.torsoH + (pose.ducking ? 3 : 0) + (pose.jumping ? -4 : 0);
  const headTopY = torsoTopY - dims.headH + (pose.jumping ? -2 : 0);

  if (pose.lyingDown) {
    // Draw character lying flat on ground
    const groundY = FRAME_H - 10;
    // Body horizontal
    fillRect(ctx, ox + 6, oy + groundY, 36, 6, p.shirt.base);
    fillRect(ctx, ox + 6, oy + groundY, 36, 1, p.shirt.hi);
    fillRect(ctx, ox + 6, oy + groundY + 5, 36, 1, p.shirt.lo);
    // Outline
    fillRect(ctx, ox + 5, oy + groundY, 38, 1, p.outline);
    fillRect(ctx, ox + 5, oy + groundY + 6, 38, 1, p.outline);
    // Head
    fillRect(ctx, ox + 3, oy + groundY - 1, 8, 7, p.skin.base);
    fillRect(ctx, ox + 3, oy + groundY - 1, 8, 1, p.skin.hi);
    fillRect(ctx, ox + 2, oy + groundY - 1, 1, 7, p.outline);
    // Hair
    fillRect(ctx, ox + 3, oy + groundY - 2, 8, 2, p.hair.base);
    // Feet
    fillRect(ctx, ox + 38, oy + groundY, 5, 4, p.shoes.base);
    fillRect(ctx, ox + 43, oy + groundY, 1, 4, p.outline);
    return;
  }

  // === Draw legs ===
  const legLX = cx - Math.floor(dims.legW) - 1 + (pose.legLOffset || 0);
  const legRX = cx + 1 + (pose.legROffset || 0);

  // Left leg
  drawShadedRect(ctx, ox + legLX, oy + legTopY, dims.legW, dims.legLen, p.pants, p.outline);
  // Left foot
  drawShadedRect(ctx, ox + legLX - 1, oy + feetY, dims.footW, dims.footH, p.shoes, p.outline);

  // Right leg
  drawShadedRect(ctx, ox + legRX, oy + legTopY, dims.legW, dims.legLen, p.pants, p.outline);
  // Right foot
  drawShadedRect(ctx, ox + legRX, oy + feetY, dims.footW, dims.footH, p.shoes, p.outline);

  // === Draw torso ===
  // V-shape: wider at shoulders, narrower at waist
  const shW = dims.shoulderW;
  const waW = dims.waistW;
  const tH = dims.torsoH;

  if (design.bareChest) {
    // Draw skin-colored torso
    for (let row = 0; row < tH; row++) {
      const t = row / tH;
      const rowW = Math.round(shW + (waW - shW) * t);
      const rx = cx - Math.floor(rowW / 2);
      const ramp = t < 0.3 ? p.skin.hi : t > 0.7 ? p.skin.lo : p.skin.base;
      fillRect(ctx, ox + rx, oy + torsoTopY + row, rowW, 1, ramp);
    }
    // Torso outline
    fillRect(ctx, ox + cx - Math.floor(shW / 2) - 1, oy + torsoTopY, 1, tH, p.outline);
    fillRect(ctx, ox + cx + Math.floor(shW / 2), oy + torsoTopY, 1, tH, p.outline);
    fillRect(ctx, ox + cx - Math.floor(shW / 2), oy + torsoTopY - 1, shW, 1, p.outline);

    // Vest if applicable
    if (design.vest && design.vestColor) {
      const vc = design.vestColor;
      fillRect(ctx, ox + cx - Math.floor(shW / 2), oy + torsoTopY, 3, tH - 2, vc.base);
      fillRect(ctx, ox + cx + Math.floor(shW / 2) - 3, oy + torsoTopY, 3, tH - 2, vc.base);
      fillRect(ctx, ox + cx - Math.floor(shW / 2), oy + torsoTopY, 3, 1, vc.hi);
      fillRect(ctx, ox + cx + Math.floor(shW / 2) - 3, oy + torsoTopY, 3, 1, vc.hi);
    }
  } else if (design.corset) {
    // Corset: tighter waist
    for (let row = 0; row < tH; row++) {
      const t = row / tH;
      const corsW = Math.round(shW + (waW - 4 - shW) * t);
      const rx = cx - Math.floor(corsW / 2);
      const ramp = t < 0.3 ? p.shirt.hi : t > 0.7 ? p.shirt.lo : p.shirt.base;
      fillRect(ctx, ox + rx, oy + torsoTopY + row, corsW, 1, ramp);
    }
    fillRect(ctx, ox + cx - Math.floor(shW / 2) - 1, oy + torsoTopY, 1, tH, p.outline);
    fillRect(ctx, ox + cx + Math.floor(shW / 2), oy + torsoTopY, 1, tH, p.outline);
    // Lacing detail
    for (let row = 2; row < tH - 2; row += 3) {
      fillRect(ctx, ox + cx - 1, oy + torsoTopY + row, 2, 1, p.outline);
    }
  } else {
    // Standard shirt
    for (let row = 0; row < tH; row++) {
      const t = row / tH;
      const rowW = Math.round(shW + (waW - shW) * t);
      const rx = cx - Math.floor(rowW / 2);
      const ramp = t < 0.3 ? p.shirt.hi : t > 0.7 ? p.shirt.lo : p.shirt.base;
      fillRect(ctx, ox + rx, oy + torsoTopY + row, rowW, 1, ramp);
    }
    fillRect(ctx, ox + cx - Math.floor(shW / 2) - 1, oy + torsoTopY, 1, tH, p.outline);
    fillRect(ctx, ox + cx + Math.floor(shW / 2), oy + torsoTopY, 1, tH, p.outline);
    fillRect(ctx, ox + cx - Math.floor(shW / 2), oy + torsoTopY - 1, shW, 1, p.outline);

    // Vest overlay
    if (design.vest && design.vestColor) {
      const vc = design.vestColor;
      fillRect(ctx, ox + cx - Math.floor(shW / 2), oy + torsoTopY, 4, tH - 2, vc.base);
      fillRect(ctx, ox + cx + Math.floor(shW / 2) - 4, oy + torsoTopY, 4, tH - 2, vc.base);
      fillRect(ctx, ox + cx - Math.floor(shW / 2), oy + torsoTopY, 4, 1, vc.hi);
      fillRect(ctx, ox + cx + Math.floor(shW / 2) - 4, oy + torsoTopY, 4, 1, vc.hi);
    }
  }

  // Belt
  if (!design.bareChest || design.vest) {
    drawShadedRect(ctx, ox + cx - Math.floor(waW / 2), oy + torsoBottomY - 2, waW, 2, p.belt, p.outline);
  }

  // Beer belly
  if (design.beerBelly) {
    fillRect(ctx, ox + cx - 4, oy + torsoBottomY - 6, 8, 5, p.shirt.lo);
    fillRect(ctx, ox + cx - 3, oy + torsoBottomY - 7, 6, 1, p.shirt.base);
  }

  // === Draw arms ===
  const shoulderY = torsoTopY + 2;

  const drawArm = (side: 'left' | 'right', angle: number, extend: number) => {
    const isLeft = side === 'left';
    const baseX = isLeft ? cx - Math.floor(shW / 2) - dims.armW : cx + Math.floor(shW / 2);

    // Upper arm
    let armY = shoulderY;
    let armX = baseX;
    let armH = Math.floor(dims.armLen / 2);

    switch (angle) {
      case -2: armY -= 6; break;           // arm up high
      case -1: armY -= 3; break;           // arm raised
      case 0: break;                        // arm down
      case 1: armY += 2; break;            // arm back
      case 2: armY += 4; break;            // arm far back
    }

    drawShadedRect(ctx, ox + armX, oy + armY, dims.armW, armH, p.skin, p.outline);

    // Forearm + fist (extends further for punches)
    const forearmY = armY + armH;
    const forearmLen = Math.floor(dims.armLen / 2) + extend;

    if (extend > 3) {
      // Extended punch: horizontal
      const fistX = isLeft ? armX - forearmLen : armX + dims.armW;
      const fistDir = isLeft ? -1 : 1;
      // Forearm
      fillRect(ctx, ox + (isLeft ? fistX : armX + dims.armW), oy + forearmY, Math.abs(forearmLen), dims.armW, p.skin.base);
      fillRect(ctx, ox + (isLeft ? fistX : armX + dims.armW), oy + forearmY, Math.abs(forearmLen), 1, p.skin.hi);
      // Outline
      fillRect(ctx, ox + (isLeft ? fistX : armX + dims.armW), oy + forearmY - 1, Math.abs(forearmLen), 1, p.outline);
      fillRect(ctx, ox + (isLeft ? fistX : armX + dims.armW), oy + forearmY + dims.armW, Math.abs(forearmLen), 1, p.outline);
      // Fist
      const fistBX = isLeft ? fistX - 2 : armX + dims.armW + forearmLen;
      fillRect(ctx, ox + fistBX, oy + forearmY - 1, 3, dims.armW + 2, p.skin.base);
      fillRect(ctx, ox + fistBX + (isLeft ? -1 : 3), oy + forearmY - 1, 1, dims.armW + 2, p.outline);
    } else {
      // Normal: vertical forearm
      drawShadedRect(ctx, ox + armX, oy + forearmY, dims.armW, Math.floor(dims.armLen / 2), p.skin, p.outline);
      // Fist
      fillRect(ctx, ox + armX - 1, oy + forearmY + Math.floor(dims.armLen / 2), dims.armW + 2, 3, p.skin.base);
      fillRect(ctx, ox + armX - 1, oy + forearmY + Math.floor(dims.armLen / 2) + 2, dims.armW + 2, 1, p.outline);
    }
  };

  drawArm('left', pose.armLAngle || 0, pose.armLExtend || 0);
  drawArm('right', pose.armRAngle || 0, pose.armRExtend || 0);

  // === Draw head (on top of everything) ===
  drawHead(ctx, ox + cx, oy + headTopY, dims, design);
}

// Draw a kick extending from the character
function drawKick(ctx: CanvasRenderingContext2D, ox: number, oy: number, design: CharDesign, high: boolean): void {
  const dims = getBuildDims(design.build);
  const p = design.palette;
  const cx = Math.floor(FRAME_W / 2);
  const kickY = high ? FRAME_H - 26 : FRAME_H - 18;

  // Extended leg
  fillRect(ctx, ox + cx + 2, oy + kickY, 14, dims.legW, p.pants.base);
  fillRect(ctx, ox + cx + 2, oy + kickY, 14, 1, p.pants.hi);
  fillRect(ctx, ox + cx + 2, oy + kickY - 1, 14, 1, p.outline);
  fillRect(ctx, ox + cx + 2, oy + kickY + dims.legW, 14, 1, p.outline);
  // Foot
  fillRect(ctx, ox + cx + 15, oy + kickY - 1, dims.footW, dims.legW + 2, p.shoes.base);
  fillRect(ctx, ox + cx + 15, oy + kickY - 1, dims.footW, 1, p.shoes.hi);
  fillRect(ctx, ox + cx + 15 + dims.footW, oy + kickY - 1, 1, dims.legW + 2, p.outline);
}

// ===== Sheet generators =====

function generatePlayerSheet(name: string, design: CharDesign): void {
  const totalFrames = 36;
  const canvas = createCanvas(FRAME_W * totalFrames, FRAME_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const fo = (f: number) => f * FRAME_W;

  // 0-1: Idle (slight bob)
  drawCharacter(ctx, fo(0), 0, design, {});
  drawCharacter(ctx, fo(1), 0, design, { lean: 0 });
  // Subtle breathing: add a 1px shift to the torso top on frame 1
  fillRect(ctx, fo(1) + Math.floor(FRAME_W / 2) - 1, 12, 2, 1, design.palette.hair.base);

  // 2-5: Walk cycle
  drawCharacter(ctx, fo(2), 0, design, { legLOffset: 2, legROffset: -1, armLAngle: 1, armRAngle: -1 });
  drawCharacter(ctx, fo(3), 0, design, { legLOffset: 0, legROffset: 0 });
  drawCharacter(ctx, fo(4), 0, design, { legLOffset: -1, legROffset: 2, armLAngle: -1, armRAngle: 1 });
  drawCharacter(ctx, fo(5), 0, design, { legLOffset: 0, legROffset: 0 });

  // 6: Jump
  drawCharacter(ctx, fo(6), 0, design, { jumping: true, armLAngle: -1, armRAngle: -1 });

  // 7-8: Jab1
  drawCharacter(ctx, fo(7), 0, design, { armRAngle: -1 });
  drawCharacter(ctx, fo(8), 0, design, { armRAngle: -1, armRExtend: 10, lean: 1 });

  // 9-10: Jab2
  drawCharacter(ctx, fo(9), 0, design, { armLAngle: -1, lean: -1 });
  drawCharacter(ctx, fo(10), 0, design, { armRAngle: -1, armRExtend: 12, lean: 2 });

  // 11-12: Straight (big punch)
  drawCharacter(ctx, fo(11), 0, design, { lean: 1, armRAngle: 1 });
  drawCharacter(ctx, fo(12), 0, design, { lean: 3, armRAngle: -1, armRExtend: 14 });

  // 13-14: Kick
  drawCharacter(ctx, fo(13), 0, design, { lean: 1 });
  drawCharacter(ctx, fo(14), 0, design, { lean: 2 });
  drawKick(ctx, fo(14), 0, design, false);

  // 15-17: Finisher (spinning kick)
  drawCharacter(ctx, fo(15), 0, design, { armLAngle: -1, armRAngle: -1, lean: -1 });
  drawCharacter(ctx, fo(16), 0, design, { armLAngle: -1, armRAngle: -1, lean: 1 });
  drawKick(ctx, fo(16), 0, design, true);
  drawCharacter(ctx, fo(17), 0, design, { armLAngle: -1, armRAngle: -1, lean: 2 });
  drawKick(ctx, fo(17), 0, design, true);

  // 18: Jump kick
  drawCharacter(ctx, fo(18), 0, design, { jumping: true, lean: 3 });
  drawKick(ctx, fo(18), 0, design, true);

  // 19: Hurt
  drawCharacter(ctx, fo(19), 0, design, { lean: -3, armLAngle: 1, armRAngle: 1 });

  // 20-21: Knockdown
  drawCharacter(ctx, fo(20), 0, design, { lean: -4, armLAngle: 2, armRAngle: 2 });
  drawCharacter(ctx, fo(21), 0, design, { lyingDown: true });

  // 22-23: Get up
  drawCharacter(ctx, fo(22), 0, design, { ducking: true });
  drawCharacter(ctx, fo(23), 0, design, {});

  // 24-26: Special (spinning roundhouse with energy)
  for (let i = 0; i < 3; i++) {
    drawCharacter(ctx, fo(24 + i), 0, design, { armLAngle: -1, armRAngle: -1, lean: i * 2 - 2 });
    // Energy glow effect
    ctx.globalAlpha = 0.5;
    fillRect(ctx, fo(24 + i) + 8 + i * 3, 14, 32 - i * 4, 30, '#FFFF44');
    ctx.globalAlpha = 0.3;
    fillRect(ctx, fo(24 + i) + 6 + i * 2, 12, 36 - i * 4, 34, '#FFFFFF');
    ctx.globalAlpha = 1.0;
    if (i >= 1) drawKick(ctx, fo(24 + i), 0, design, true);
  }

  // 27-28: Blitz (rushing forward)
  drawCharacter(ctx, fo(27), 0, design, { lean: 4, armRAngle: -2 });
  drawCharacter(ctx, fo(28), 0, design, { lean: 5, armRAngle: -1, armRExtend: 12 });

  // 29: Grab hold
  drawCharacter(ctx, fo(29), 0, design, { armRAngle: -1, armLAngle: -1 });
  // Grabbing hands forward
  fillRect(ctx, fo(29) + Math.floor(FRAME_W / 2) + 4, FRAME_H - 36, 5, 4, design.palette.skin.base);

  // 30-31: Grab punch
  drawCharacter(ctx, fo(30), 0, design, { armLAngle: -1 });
  fillRect(ctx, fo(30) + Math.floor(FRAME_W / 2) + 4, FRAME_H - 36, 5, 4, design.palette.skin.base);
  drawCharacter(ctx, fo(31), 0, design, { armLAngle: -1, armRExtend: 6 });

  // 32-33: Throw
  drawCharacter(ctx, fo(32), 0, design, { lean: -2, armRAngle: -2, armLAngle: -2 });
  drawCharacter(ctx, fo(33), 0, design, { lean: 3, armRAngle: -2, armLAngle: -2 });

  // 34-35: Weapon attack
  drawCharacter(ctx, fo(34), 0, design, { armRAngle: -2 });
  // Weapon held up
  const wcx = fo(34) + Math.floor(FRAME_W / 2) + 6;
  fillRect(ctx, wcx, FRAME_H - 50, 2, 12, '#888888');
  fillRect(ctx, wcx, FRAME_H - 51, 2, 1, '#AAAAAA');
  drawCharacter(ctx, fo(35), 0, design, { armRAngle: -1, lean: 3 });
  // Weapon swung forward
  const wcx2 = fo(35) + Math.floor(FRAME_W / 2) + 4;
  fillRect(ctx, wcx2, FRAME_H - 38, 14, 2, '#888888');
  fillRect(ctx, wcx2, FRAME_H - 38, 14, 1, '#AAAAAA');

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.png`), buffer);
  console.log(`Generated ${name}.png (${totalFrames} frames @ ${FRAME_W}x${FRAME_H})`);
}

function generateEnemySheet(name: string, design: CharDesign): void {
  const totalFrames = 18;
  const canvas = createCanvas(FRAME_W * totalFrames, FRAME_H);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const fo = (f: number) => f * FRAME_W;

  // 0-1: Idle
  drawCharacter(ctx, fo(0), 0, design, {});
  drawCharacter(ctx, fo(1), 0, design, {});

  // 2-5: Walk
  drawCharacter(ctx, fo(2), 0, design, { legLOffset: 2, legROffset: -1, armLAngle: 1, armRAngle: -1 });
  drawCharacter(ctx, fo(3), 0, design, {});
  drawCharacter(ctx, fo(4), 0, design, { legLOffset: -1, legROffset: 2, armLAngle: -1, armRAngle: 1 });
  drawCharacter(ctx, fo(5), 0, design, {});

  // 6-8: Attack
  drawCharacter(ctx, fo(6), 0, design, { lean: 1, armRAngle: 1 });
  drawCharacter(ctx, fo(7), 0, design, { lean: 2, armRAngle: -1, armRExtend: 12 });
  drawCharacter(ctx, fo(8), 0, design, {});

  // 9: Hurt
  drawCharacter(ctx, fo(9), 0, design, { lean: -3, armLAngle: 1, armRAngle: 1 });

  // 10-11: Knockdown
  drawCharacter(ctx, fo(10), 0, design, { lean: -4, armLAngle: 2, armRAngle: 2 });
  drawCharacter(ctx, fo(11), 0, design, { lyingDown: true });

  // 12-13: Death
  drawCharacter(ctx, fo(12), 0, design, { lean: -4, armLAngle: 2, armRAngle: 2 });
  drawCharacter(ctx, fo(13), 0, design, { lyingDown: true });

  // 14: Block
  drawCharacter(ctx, fo(14), 0, design, { armLAngle: -1, armRAngle: -1 });
  // Crossed arms
  const bcx = Math.floor(FRAME_W / 2);
  fillRect(ctx, fo(14) + bcx - 5, FRAME_H - 36, 10, 4, design.palette.skin.base);
  fillRect(ctx, fo(14) + bcx - 5, FRAME_H - 36, 10, 1, design.palette.skin.hi);

  // 15-17: Special
  drawCharacter(ctx, fo(15), 0, design, { lean: -2 });
  drawCharacter(ctx, fo(16), 0, design, { lean: 2, armRAngle: -1, armRExtend: 14 });
  drawCharacter(ctx, fo(17), 0, design, { lean: 0 });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.png`), buffer);
  console.log(`Generated ${name}.png (${totalFrames} frames @ ${FRAME_W}x${FRAME_H})`);
}

// ===== Generate weapons sheet (24x24) =====
function generateWeaponsSheet(): void {
  const fSize = 24;
  const frames = 4;
  const canvas = createCanvas(fSize * frames, fSize);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Frame 0: Knife
  // Blade
  ctx.fillStyle = '#DDDDDD';
  ctx.fillRect(6, 10, 14, 3);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(6, 10, 14, 1); // highlight
  ctx.fillStyle = '#AAAAAA';
  ctx.fillRect(18, 9, 3, 5); // guard
  // Handle
  ctx.fillStyle = '#886644';
  ctx.fillRect(2, 9, 5, 5);
  ctx.fillStyle = '#AA8866';
  ctx.fillRect(2, 9, 5, 1);
  // Outline
  ctx.fillStyle = '#333333';
  ctx.fillRect(1, 9, 1, 5);
  ctx.fillRect(21, 9, 1, 5);
  ctx.fillRect(2, 8, 19, 1);
  ctx.fillRect(2, 14, 19, 1);

  // Frame 1: Pipe
  const px = fSize;
  ctx.fillStyle = '#999999';
  ctx.fillRect(px + 10, 3, 3, 18);
  ctx.fillStyle = '#BBBBBB';
  ctx.fillRect(px + 10, 3, 1, 18); // highlight
  ctx.fillStyle = '#666666';
  ctx.fillRect(px + 13, 3, 1, 18); // shadow
  // Cap
  ctx.fillStyle = '#777777';
  ctx.fillRect(px + 9, 3, 5, 2);
  ctx.fillStyle = '#555555';
  ctx.fillRect(px + 9, 4, 5, 1);
  // Outline
  ctx.fillStyle = '#333333';
  ctx.fillRect(px + 9, 2, 5, 1);
  ctx.fillRect(px + 9, 21, 5, 1);

  // Frame 2: Apple (pickup sized)
  const ax = 2 * fSize;
  ctx.fillStyle = '#CC2222';
  ctx.fillRect(ax + 7, 8, 10, 10);
  ctx.fillStyle = '#EE4444';
  ctx.fillRect(ax + 8, 8, 4, 3); // highlight
  ctx.fillStyle = '#992222';
  ctx.fillRect(ax + 7, 15, 10, 3); // shadow
  // Stem
  ctx.fillStyle = '#664422';
  ctx.fillRect(ax + 11, 5, 2, 4);
  // Leaf
  ctx.fillStyle = '#44AA22';
  ctx.fillRect(ax + 13, 5, 3, 2);
  ctx.fillStyle = '#228811';
  ctx.fillRect(ax + 14, 7, 2, 1);

  // Frame 3: Chicken leg
  const cx = 3 * fSize;
  ctx.fillStyle = '#CC8844';
  ctx.fillRect(cx + 5, 8, 14, 8);
  ctx.fillStyle = '#DDAA66';
  ctx.fillRect(cx + 6, 8, 6, 3); // highlight
  ctx.fillStyle = '#AA6622';
  ctx.fillRect(cx + 5, 14, 14, 2); // shadow
  // Bone
  ctx.fillStyle = '#EEEECC';
  ctx.fillRect(cx + 3, 10, 4, 4);
  ctx.fillStyle = '#DDDDBB';
  ctx.fillRect(cx + 2, 11, 2, 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'weapons.png'), buffer);
  console.log(`Generated weapons.png (${frames} frames @ ${fSize}x${fSize})`);
}

// ===== Generate pickups sheet (24x24) =====
function generatePickupsSheet(): void {
  const fSize = 24;
  const frames = 4;
  const canvas = createCanvas(fSize * frames, fSize);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Frame 0: Apple
  ctx.fillStyle = '#CC2222';
  ctx.fillRect(7, 8, 10, 10);
  ctx.fillStyle = '#EE4444';
  ctx.fillRect(8, 8, 4, 3);
  ctx.fillStyle = '#992222';
  ctx.fillRect(7, 15, 10, 3);
  ctx.fillStyle = '#664422';
  ctx.fillRect(11, 5, 2, 4);
  ctx.fillStyle = '#44AA22';
  ctx.fillRect(13, 5, 3, 2);
  ctx.fillStyle = '#228811';
  ctx.fillRect(14, 7, 2, 1);
  // Outline
  ctx.fillStyle = '#441111';
  ctx.fillRect(6, 8, 1, 10);
  ctx.fillRect(17, 8, 1, 10);
  ctx.fillRect(7, 7, 10, 1);
  ctx.fillRect(7, 18, 10, 1);

  // Frame 1: Chicken leg
  const f1 = fSize;
  ctx.fillStyle = '#CC8844';
  ctx.fillRect(f1 + 5, 8, 14, 8);
  ctx.fillStyle = '#DDAA66';
  ctx.fillRect(f1 + 6, 8, 6, 3);
  ctx.fillStyle = '#AA6622';
  ctx.fillRect(f1 + 5, 14, 14, 2);
  ctx.fillStyle = '#EEEECC';
  ctx.fillRect(f1 + 3, 10, 4, 4);
  ctx.fillStyle = '#DDDDBB';
  ctx.fillRect(f1 + 2, 11, 2, 2);
  // Outline
  ctx.fillStyle = '#553311';
  ctx.fillRect(f1 + 4, 8, 1, 8);
  ctx.fillRect(f1 + 19, 8, 1, 8);
  ctx.fillRect(f1 + 5, 7, 14, 1);
  ctx.fillRect(f1 + 5, 16, 14, 1);

  // Frame 2: Money bag
  const f2 = 2 * fSize;
  ctx.fillStyle = '#DDAA22';
  ctx.fillRect(f2 + 7, 8, 10, 10);
  ctx.fillStyle = '#FFCC44';
  ctx.fillRect(f2 + 8, 8, 4, 3);
  ctx.fillStyle = '#BB8811';
  ctx.fillRect(f2 + 7, 15, 10, 3);
  // $ sign
  ctx.fillStyle = '#886611';
  ctx.fillRect(f2 + 10, 10, 4, 1);
  ctx.fillRect(f2 + 10, 11, 1, 2);
  ctx.fillRect(f2 + 10, 13, 4, 1);
  ctx.fillRect(f2 + 13, 14, 1, 2);
  ctx.fillRect(f2 + 10, 16, 4, 1);
  ctx.fillRect(f2 + 12, 9, 1, 9);
  // Tie
  ctx.fillStyle = '#886644';
  ctx.fillRect(f2 + 10, 6, 4, 3);
  // Outline
  ctx.fillStyle = '#664411';
  ctx.fillRect(f2 + 6, 8, 1, 10);
  ctx.fillRect(f2 + 17, 8, 1, 10);
  ctx.fillRect(f2 + 7, 7, 10, 1);
  ctx.fillRect(f2 + 7, 18, 10, 1);

  // Frame 3: 1UP
  const f3 = 3 * fSize;
  ctx.fillStyle = '#44CC44';
  ctx.fillRect(f3 + 7, 8, 10, 10);
  ctx.fillStyle = '#66EE66';
  ctx.fillRect(f3 + 8, 8, 4, 3);
  ctx.fillStyle = '#229922';
  ctx.fillRect(f3 + 7, 15, 10, 3);
  // "1UP" text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(f3 + 9, 11, 1, 4);
  ctx.fillRect(f3 + 10, 11, 1, 4);
  ctx.fillRect(f3 + 12, 11, 1, 4);
  ctx.fillRect(f3 + 14, 11, 1, 4);
  ctx.fillRect(f3 + 12, 14, 3, 1);
  // Outline
  ctx.fillStyle = '#116611';
  ctx.fillRect(f3 + 6, 8, 1, 10);
  ctx.fillRect(f3 + 17, 8, 1, 10);
  ctx.fillRect(f3 + 7, 7, 10, 1);
  ctx.fillRect(f3 + 7, 18, 10, 1);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'pickups.png'), buffer);
  console.log(`Generated pickups.png (${frames} frames @ ${fSize}x${fSize})`);
}

// ===== Generate effects sheet (24x24) =====
function generateEffectsSheet(): void {
  const fSize = 24;
  const totalFrames = 8;
  const canvas = createCanvas(fSize * totalFrames, fSize);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const c = fSize / 2; // center

  // Frame 0-3: Hit spark (starburst)
  for (let i = 0; i < 4; i++) {
    const ox = i * fSize;
    const size = 3 + i * 3;
    const colors = ['#FFFFFF', '#FFFFFF', '#FFFF66', '#FFAA33'];
    ctx.globalAlpha = 1 - i * 0.15;
    ctx.fillStyle = colors[i];

    // Cross pattern
    ctx.fillRect(ox + c - 1, c - size, 2, size * 2);
    ctx.fillRect(ox + c - size, c - 1, size * 2, 2);

    // Diagonal rays
    for (let d = 0; d < size; d++) {
      ctx.fillRect(ox + c - d, c - d, 1, 1);
      ctx.fillRect(ox + c + d, c - d, 1, 1);
      ctx.fillRect(ox + c - d, c + d, 1, 1);
      ctx.fillRect(ox + c + d, c + d, 1, 1);
    }

    // Extra sparkle pixels
    if (i < 3) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + c - size + 1, c, 1, 1);
      ctx.fillRect(ox + c + size - 1, c, 1, 1);
      ctx.fillRect(ox + c, c - size + 1, 1, 1);
      ctx.fillRect(ox + c, c + size - 1, 1, 1);
    }
  }
  ctx.globalAlpha = 1.0;

  // Frame 4-6: Dust cloud (dithered gray)
  for (let i = 0; i < 3; i++) {
    const ox = (4 + i) * fSize;
    const alpha = 0.6 - i * 0.15;
    const r = 4 + i * 3;

    // Dithered cloud effect
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          // Dithering pattern
          if ((dx + dy) % 2 === 0 || Math.random() > 0.3) {
            ctx.fillStyle = `rgba(170, 170, 170, ${alpha})`;
            ctx.fillRect(ox + c + dx, c + dy, 1, 1);
          }
        }
      }
    }
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'effects.png'), buffer);
  console.log(`Generated effects.png (${totalFrames} frames @ ${fSize}x${fSize})`);
}

// ===== Generate background tiles =====
function generateBackgroundTiles(): void {
  // Brick wall tile (64x64)
  const brickW = 64;
  const brickH = 64;
  const brickCanvas = createCanvas(brickW, brickH);
  const bctx = brickCanvas.getContext('2d');
  bctx.imageSmoothingEnabled = false;

  // Base mortar color
  bctx.fillStyle = '#4A3A2A';
  bctx.fillRect(0, 0, brickW, brickH);

  // Draw brick rows
  const brickColors = ['#8B5A3A', '#7D4E32', '#9B6A4A', '#8B5A3A', '#6D4E2A'];
  const rowH = 8;
  for (let row = 0; row < brickH / rowH; row++) {
    const offset = (row % 2 === 0) ? 0 : 16;
    for (let bx = -16 + offset; bx < brickW; bx += 32) {
      const color = brickColors[(row * 5 + Math.floor(bx / 32)) % brickColors.length];
      bctx.fillStyle = color;
      bctx.fillRect(bx + 1, row * rowH + 1, 30, rowH - 2);
      // Highlight (top of brick)
      bctx.fillStyle = '#AA7A5A';
      bctx.fillRect(bx + 1, row * rowH + 1, 30, 1);
      // Shadow (bottom of brick)
      bctx.fillStyle = '#5A3A1A';
      bctx.fillRect(bx + 1, row * rowH + rowH - 2, 30, 1);
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'bg_brick.png'), brickCanvas.toBuffer('image/png'));
  console.log('Generated bg_brick.png (64x64 tile)');

  // Sidewalk tile (64x32)
  const swCanvas = createCanvas(64, 32);
  const sctx = swCanvas.getContext('2d');
  sctx.imageSmoothingEnabled = false;

  // Concrete base
  sctx.fillStyle = '#8A8A7A';
  sctx.fillRect(0, 0, 64, 32);
  // Cracks and detail
  sctx.fillStyle = '#7A7A6A';
  sctx.fillRect(0, 15, 64, 1);
  sctx.fillRect(31, 0, 1, 32);
  // Highlights
  sctx.fillStyle = '#9A9A8A';
  sctx.fillRect(0, 0, 64, 1);
  sctx.fillRect(0, 16, 64, 1);
  // Shadow edges
  sctx.fillStyle = '#6A6A5A';
  sctx.fillRect(0, 14, 64, 1);
  sctx.fillRect(0, 31, 64, 1);
  // Random concrete variation
  for (let i = 0; i < 20; i++) {
    const px = Math.floor(Math.random() * 64);
    const py = Math.floor(Math.random() * 32);
    sctx.fillStyle = Math.random() > 0.5 ? '#929282' : '#7A7A6A';
    sctx.fillRect(px, py, 1, 1);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'bg_sidewalk.png'), swCanvas.toBuffer('image/png'));
  console.log('Generated bg_sidewalk.png (64x32 tile)');

  // Sky gradient (320x70)
  const skyCanvas = createCanvas(320, 70);
  const skyCtx = skyCanvas.getContext('2d');
  for (let y = 0; y < 70; y++) {
    const t = y / 70;
    const r = Math.floor(5 + t * 15);
    const g = Math.floor(5 + t * 10);
    const b = Math.floor(30 + t * 20);
    skyCtx.fillStyle = `rgb(${r},${g},${b})`;
    skyCtx.fillRect(0, y, 320, 1);
  }
  // Stars
  for (let i = 0; i < 40; i++) {
    skyCtx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
    skyCtx.fillRect(Math.floor(Math.random() * 320), Math.floor(Math.random() * 50), 1, 1);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'bg_sky.png'), skyCanvas.toBuffer('image/png'));
  console.log('Generated bg_sky.png (320x70)');

  // City silhouette (320x50)
  const cityCanvas = createCanvas(320, 50);
  const cityCtx = cityCanvas.getContext('2d');
  cityCtx.imageSmoothingEnabled = false;

  // Dark building silhouettes
  for (let bx = 0; bx < 320; bx += 16 + Math.floor(Math.random() * 20)) {
    const bw = 10 + Math.floor(Math.random() * 14);
    const bh = 15 + Math.floor(Math.random() * 30);
    const shade = 20 + Math.floor(Math.random() * 15);
    cityCtx.fillStyle = `rgb(${shade},${shade},${shade + 10})`;
    cityCtx.fillRect(bx, 50 - bh, bw, bh);
    // Windows
    for (let wy = 50 - bh + 3; wy < 48; wy += 5) {
      for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) {
        if (Math.random() > 0.35) {
          const brightness = Math.random() > 0.7 ? '#FFFF44' : '#886622';
          cityCtx.fillStyle = `${brightness}`;
          cityCtx.globalAlpha = 0.3 + Math.random() * 0.4;
          cityCtx.fillRect(wx, wy, 2, 3);
        }
      }
    }
    cityCtx.globalAlpha = 1.0;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'bg_city.png'), cityCanvas.toBuffer('image/png'));
  console.log('Generated bg_city.png (320x50)');

  // Props: door (16x24), phone booth (12x28), dumpster (24x16), neon sign (32x10)
  const propCanvas = createCanvas(84, 28);
  const pctx = propCanvas.getContext('2d');
  pctx.imageSmoothingEnabled = false;

  // Door (16x24 at 0,0)
  pctx.fillStyle = '#5A3A1A';
  pctx.fillRect(0, 4, 16, 24);
  pctx.fillStyle = '#6A4A2A';
  pctx.fillRect(1, 5, 14, 22);
  pctx.fillStyle = '#7A5A3A';
  pctx.fillRect(2, 6, 12, 9);
  pctx.fillRect(2, 17, 12, 9);
  // Doorknob
  pctx.fillStyle = '#CCAA44';
  pctx.fillRect(11, 16, 2, 2);
  // Frame
  pctx.fillStyle = '#4A2A0A';
  pctx.fillRect(0, 3, 16, 1);
  pctx.fillRect(0, 3, 1, 25);
  pctx.fillRect(15, 3, 1, 25);

  // Phone booth (12x28 at 20,0)
  pctx.fillStyle = '#CC3333';
  pctx.fillRect(20, 0, 12, 28);
  pctx.fillStyle = '#EE4444';
  pctx.fillRect(21, 1, 10, 2);
  pctx.fillStyle = '#4488CC';
  pctx.fillRect(22, 4, 8, 18); // glass
  pctx.fillStyle = '#66AAEE';
  pctx.fillRect(22, 4, 3, 6); // glass highlight
  pctx.fillStyle = '#992222';
  pctx.fillRect(20, 0, 12, 1);
  pctx.fillRect(20, 27, 12, 1);

  // Dumpster (24x16 at 36,12)
  pctx.fillStyle = '#336633';
  pctx.fillRect(36, 12, 24, 16);
  pctx.fillStyle = '#448844';
  pctx.fillRect(37, 13, 22, 3);
  pctx.fillStyle = '#225522';
  pctx.fillRect(37, 25, 22, 2);
  // Lid
  pctx.fillStyle = '#558855';
  pctx.fillRect(36, 10, 24, 3);
  pctx.fillStyle = '#669966';
  pctx.fillRect(36, 10, 24, 1);
  // Handles
  pctx.fillStyle = '#333333';
  pctx.fillRect(38, 19, 2, 3);
  pctx.fillRect(56, 19, 2, 3);

  // Neon sign (20x8 at 64,10)
  // Will be tinted per-stage
  pctx.fillStyle = '#FF4488';
  pctx.globalAlpha = 0.8;
  pctx.fillRect(64, 10, 20, 8);
  pctx.globalAlpha = 1.0;
  pctx.fillStyle = '#FF88AA';
  pctx.fillRect(65, 11, 18, 2);
  pctx.fillStyle = '#FF2266';
  pctx.fillRect(65, 16, 18, 1);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'bg_props.png'), propCanvas.toBuffer('image/png'));
  console.log('Generated bg_props.png (84x28 props atlas)');
}

// ===== Run =====
console.log('=== Generating sprite sheets (48x64 upgraded) ===\n');

// Player
generatePlayerSheet('player', DESIGNS.player);

// Enemies
generateEnemySheet('galsia', DESIGNS.galsia);
generateEnemySheet('donovan', DESIGNS.donovan);
generateEnemySheet('signal', DESIGNS.signal);
generateEnemySheet('electra', DESIGNS.electra);
generateEnemySheet('bigben', DESIGNS.bigben);

// Bosses
generateEnemySheet('barbon', DESIGNS.barbon);
generateEnemySheet('jet', DESIGNS.jet);
generateEnemySheet('abadede', DESIGNS.abadede);

// Items & effects
generateWeaponsSheet();
generatePickupsSheet();
generateEffectsSheet();

// Background tiles
generateBackgroundTiles();

console.log('\n=== All sprites generated! ===');
