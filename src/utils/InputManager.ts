import Phaser from 'phaser';
import { DOUBLE_TAP_MS } from '../constants';

export class InputManager {
  private scene: Phaser.Scene;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    special: Phaser.Input.Keyboard.Key;
    pause: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
  };

  // Double-tap tracking
  private lastTapTime: Record<string, number> = {};
  private lastTapKey: string = '';

  // Input buffer
  private attackBuffer = false;
  private attackBufferTimer = 0;
  private readonly BUFFER_MS = 150;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const kb = scene.input.keyboard!;
    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      attack: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      special: kb.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      pause: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      enter: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    };

    // Also add arrow keys as alternate movement
    const up2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const left2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const right2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // Store alternates
    (this as any)._altUp = up2;
    (this as any)._altDown = down2;
    (this as any)._altLeft = left2;
    (this as any)._altRight = right2;
  }

  update(delta: number): void {
    if (this.attackBuffer) {
      this.attackBufferTimer -= delta;
      if (this.attackBufferTimer <= 0) {
        this.attackBuffer = false;
      }
    }

    // Track double-taps for directional keys
    if (Phaser.Input.Keyboard.JustDown(this.keys.right) || Phaser.Input.Keyboard.JustDown((this as any)._altRight)) {
      this.recordTap('right');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.left) || Phaser.Input.Keyboard.JustDown((this as any)._altLeft)) {
      this.recordTap('left');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown((this as any)._altUp)) {
      this.recordTap('up');
    }
  }

  private recordTap(key: string): void {
    const now = this.scene.time.now;
    if (this.lastTapKey === key && now - (this.lastTapTime[key] || 0) < DOUBLE_TAP_MS) {
      this.lastTapTime[key] = 0; // consumed
    } else {
      this.lastTapTime[key] = now;
    }
    this.lastTapKey = key;
  }

  isDoubleTap(direction: string): boolean {
    const now = this.scene.time.now;
    return this.lastTapKey === direction && (now - (this.lastTapTime[direction] || 0)) < DOUBLE_TAP_MS;
  }

  wasDoubleTapConsumed(direction: string): boolean {
    return this.lastTapTime[direction] === 0;
  }

  consumeDoubleTap(direction: string): void {
    this.lastTapTime[direction] = 0;
  }

  get moveX(): number {
    let x = 0;
    if (this.keys.left.isDown || (this as any)._altLeft.isDown) x -= 1;
    if (this.keys.right.isDown || (this as any)._altRight.isDown) x += 1;
    return x;
  }

  get moveY(): number {
    let y = 0;
    if (this.keys.up.isDown || (this as any)._altUp.isDown) y -= 1;
    if (this.keys.down.isDown || (this as any)._altDown.isDown) y += 1;
    return y;
  }

  get attackJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.attack);
  }

  get jumpJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.jump);
  }

  get specialJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.special);
  }

  get attackAndJumpPressed(): boolean {
    return this.keys.attack.isDown && this.keys.jump.isDown;
  }

  get pauseJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.pause);
  }

  get enterJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.enter);
  }

  bufferAttack(): void {
    this.attackBuffer = true;
    this.attackBufferTimer = this.BUFFER_MS;
  }

  consumeAttackBuffer(): boolean {
    if (this.attackBuffer) {
      this.attackBuffer = false;
      return true;
    }
    return false;
  }
}
