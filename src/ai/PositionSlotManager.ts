import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { SLOT_DISTANCE_X, FLANKING_SLOTS } from '../constants';

interface Slot {
  offsetX: number;
  offsetY: number;
  occupant: Enemy | null;
}

export class PositionSlotManager {
  private slots: Slot[] = [];

  constructor() {
    // Left and right flanking positions
    this.slots = [
      { offsetX: -SLOT_DISTANCE_X, offsetY: 0, occupant: null },
      { offsetX: SLOT_DISTANCE_X, offsetY: 0, occupant: null },
    ];
  }

  assignSlot(enemy: Enemy, player: Player): void {
    // Already assigned?
    for (const slot of this.slots) {
      if (slot.occupant === enemy) {
        slot.occupant = null;
        enemy.assignedSlot = null;
      }
    }

    // Find closest free slot
    let bestSlot: Slot | null = null;
    let bestDist = Infinity;

    for (const slot of this.slots) {
      if (slot.occupant && slot.occupant.isActive()) continue;
      const slotX = player.groundX + slot.offsetX;
      const slotY = player.groundY + slot.offsetY;
      const dist = Math.abs(enemy.groundX - slotX) + Math.abs(enemy.groundY - slotY);
      if (dist < bestDist) {
        bestDist = dist;
        bestSlot = slot;
      }
    }

    if (bestSlot) {
      bestSlot.occupant = enemy;
      enemy.assignedSlot = {
        x: player.groundX + bestSlot.offsetX,
        y: player.groundY + bestSlot.offsetY,
      };
    }
  }

  update(player: Player, enemies: Enemy[]): void {
    // Update slot world positions and clean dead occupants
    for (const slot of this.slots) {
      if (slot.occupant && !slot.occupant.isActive()) {
        slot.occupant = null;
      }
    }

    // Update assigned slot positions (follow player)
    for (const enemy of enemies) {
      if (!enemy.isActive()) continue;
      if (enemy.assignedSlot) {
        // Find which slot this enemy is in
        for (const slot of this.slots) {
          if (slot.occupant === enemy) {
            enemy.assignedSlot.x = player.groundX + slot.offsetX;
            enemy.assignedSlot.y = player.groundY + slot.offsetY;
          }
        }
      }
    }

    // Assign unslotted enemies
    for (const enemy of enemies) {
      if (!enemy.isActive()) continue;
      if (!enemy.assignedSlot) {
        this.assignSlot(enemy, player);
      }
    }
  }

  reset(): void {
    for (const slot of this.slots) {
      slot.occupant = null;
    }
  }
}
