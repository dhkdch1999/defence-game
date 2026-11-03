/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Enemy,
  FloatingText,
  Guardian,
  MapSlot,
  MapWaypoint,
  Particle,
  Projectile,
  StageDefinition,
} from '../types/game';
import { GUARDIAN_TYPES, getGuardianStats } from '../data/guardians';
import { ENEMY_TYPES } from '../data/enemies';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // --- Background & Terrain Rendering ---
  public renderBackground(stage: StageDefinition, time: number) {
    const ctx = this.ctx;

    // Base terrain
    if (stage.theme === 'forest') {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#14281d');
      grad.addColorStop(0.5, '#193325');
      grad.addColorStop(1, '#0f2017');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Subtle grass / foliage texture patterns
      ctx.fillStyle = 'rgba(34, 197, 94, 0.04)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 73) % this.width;
        const y = (i * 97) % this.height;
        ctx.beginPath();
        ctx.arc(x, y, 16 + (i % 5) * 8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (stage.theme === 'canyon') {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#2e1c14');
      grad.addColorStop(0.5, '#3b2419');
      grad.addColorStop(1, '#24150e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Sand drift textures
      ctx.fillStyle = 'rgba(217, 119, 6, 0.05)';
      for (let i = 0; i < 35; i++) {
        const x = (i * 81) % this.width;
        const y = (i * 103) % this.height;
        ctx.beginPath();
        ctx.ellipse(x, y, 35, 12, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Citadel / Magma
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#1c1015');
      grad.addColorStop(0.5, '#261217');
      grad.addColorStop(1, '#150a0d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Magma glow rivers
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.12 + Math.sin(time * 2) * 0.04})`;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.bezierCurveTo(200, 200, 150, 400, 250, 540);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(850, 0);
      ctx.bezierCurveTo(750, 220, 800, 380, 720, 540);
      ctx.stroke();
    }
  }

  // --- Path Rendering ---
  public renderPaths(stage: StageDefinition, time: number) {
    const ctx = this.ctx;

    stage.paths.forEach((path) => {
      if (path.length < 2) return;

      // Outer path edge (shadow/border)
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Outer boundary
      ctx.lineWidth = 50;
      if (stage.theme === 'forest') {
        ctx.strokeStyle = '#09150e';
      } else if (stage.theme === 'canyon') {
        ctx.strokeStyle = '#180d08';
      } else {
        ctx.strokeStyle = '#0a0507';
      }

      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Main Road Body
      ctx.lineWidth = 42;
      if (stage.theme === 'forest') {
        ctx.strokeStyle = '#3e372a'; // Dirt road
      } else if (stage.theme === 'canyon') {
        ctx.strokeStyle = '#5a3d28'; // Sandstone
      } else {
        ctx.strokeStyle = '#2d2427'; // Dark basalt road
      }
      ctx.stroke();

      // Inner Cobblestone / path highlights
      ctx.lineWidth = 34;
      if (stage.theme === 'forest') {
        ctx.strokeStyle = '#4b4334';
      } else if (stage.theme === 'canyon') {
        ctx.strokeStyle = '#6e4c33';
      } else {
        ctx.strokeStyle = '#3a2e33';
      }
      ctx.stroke();

      // Center dashed guiding rune line
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 14]);
      ctx.lineDashOffset = -time * 25;
      if (stage.theme === 'forest') {
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.25)';
      } else if (stage.theme === 'canyon') {
        ctx.strokeStyle = 'rgba(253, 230, 138, 0.25)';
      } else {
        ctx.strokeStyle = 'rgba(252, 165, 165, 0.3)';
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Entrance Vortex
      const start = path[0];
      const portalRadius = 24 + Math.sin(time * 4) * 3;
      ctx.save();
      ctx.translate(start.x < 0 ? 15 : start.x, start.y < 0 ? 15 : start.y);
      const portalGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, portalRadius);
      portalGrad.addColorStop(0, '#c084fc');
      portalGrad.addColorStop(0.6, '#7e22ce');
      portalGrad.addColorStop(1, 'rgba(126, 34, 206, 0)');
      ctx.fillStyle = portalGrad;
      ctx.beginPath();
      ctx.arc(0, 0, portalRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating portal rune ring
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 14, time * 2, time * 2 + Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();

      // Exit Bastion / Castle Gate
      const end = path[path.length - 1];
      const endX = end.x > this.width ? this.width - 20 : end.x;
      const endY = end.y > this.height ? this.height - 20 : end.y;

      ctx.save();
      ctx.translate(endX, endY);
      // Castle Gate icon
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gate icon inner shield
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(-4, 8);
      ctx.moveTo(4, -8);
      ctx.lineTo(4, 8);
      ctx.stroke();
      ctx.restore();
    });
  }

  // --- Placement Slots ---
  public renderSlots(
    slots: MapSlot[],
    hoveredSlotId: string | null,
    selectedSlotId: string | null,
    isPlacementMode: boolean
  ) {
    const ctx = this.ctx;

    slots.forEach((slot) => {
      const isOccupied = slot.occupiedGuardianId !== null;
      const isHovered = slot.id === hoveredSlotId;
      const isSelected = slot.id === selectedSlotId;

      ctx.save();
      ctx.translate(slot.x, slot.y);

      // Base Pedestal
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);

      if (isOccupied) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Empty Slot
        if (isPlacementMode) {
          ctx.fillStyle = isHovered ? 'rgba(34, 197, 94, 0.35)' : 'rgba(30, 41, 59, 0.6)';
          ctx.fill();
          ctx.strokeStyle = isHovered ? '#4ade80' : 'rgba(148, 163, 184, 0.45)';
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = isHovered ? 'rgba(51, 65, 85, 0.8)' : 'rgba(30, 41, 59, 0.45)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(100, 116, 139, 0.4)';
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.stroke();
        }

        // Slot Rune / Plus sign
        ctx.strokeStyle = isHovered ? '#4ade80' : 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.stroke();
      }

      // Terrain Bonus Indicator
      if (slot.terrainBonus && slot.terrainBonus !== 'none') {
        ctx.beginPath();
        ctx.arc(14, -14, 8, 0, Math.PI * 2);
        if (slot.terrainBonus === 'damage') {
          ctx.fillStyle = '#ef4444';
        } else if (slot.terrainBonus === 'range') {
          ctx.fillStyle = '#3b82f6';
        } else {
          ctx.fillStyle = '#eab308';
        }
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          slot.terrainBonus === 'damage' ? '공' : slot.terrainBonus === 'range' ? '사' : '속',
          14,
          -14
        );
      }

      ctx.restore();
    });
  }

  // --- Guardians (Heroes) Rendering ---
  public renderGuardians(
    guardians: Guardian[],
    selectedGuardianId: string | null,
    time: number
  ) {
    const ctx = this.ctx;

    guardians.forEach((guardian) => {
      const type = GUARDIAN_TYPES[guardian.typeId];
      if (!type) return;

      const isSelected = guardian.id === selectedGuardianId;
      const stats = getGuardianStats(guardian.typeId, guardian.level);

      ctx.save();
      ctx.translate(guardian.x, guardian.y);

      // Selected Range Ring
      if (isSelected && stats) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, stats.range, 0, Math.PI * 2);
        ctx.fillStyle = `${type.color}15`;
        ctx.fill();
        ctx.strokeStyle = type.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.restore();
      }

      // Level 3 Awakening Pulsing Aura
      if (guardian.level >= 3) {
        ctx.save();
        const auraPulse = 26 + Math.sin(time * 5) * 3;
        ctx.beginPath();
        ctx.arc(0, 0, auraPulse, 0, Math.PI * 2);
        ctx.strokeStyle = type.accentColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = type.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Base Stand Ring
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = type.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw Character based on Role
      this.drawGuardianFigure(guardian, type, time);

      // Level Badge / Stars
      ctx.save();
      ctx.translate(0, 18);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-16, -7, 32, 14, 4);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = guardian.level >= 3 ? '#f59e0b' : '#38bdf8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Lv.${guardian.level}`, 0, 0);
      ctx.restore();

      ctx.restore();
    });
  }

  private drawGuardianFigure(
    guardian: Guardian,
    type: typeof GUARDIAN_TYPES[string],
    time: number
  ) {
    const ctx = this.ctx;
    const facingAngle = guardian.angle;

    ctx.save();
    ctx.rotate(facingAngle);

    if (type.id === 'paladin') {
      // Golden armor, holy kite shield & warhammer
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Shield (facing left)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-14, -8, 5, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -8, 5, 16);

      // Hammer (facing right forward)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(8, -4, 10, 8);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(14, -7, 6, 14);

      // Radiant crest
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.id === 'archer') {
      // Emerald hooded cape & recurve bow
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Bow
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(10, 0, 12, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      // Arrow drawn
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();

      // Feather
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.id === 'mage') {
      // Wizard hat & floating fire crystal staff
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Arcane staff
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, -12);
      ctx.lineTo(14, 12);
      ctx.stroke();

      // Floating Fire Crystal orb
      const orbBob = Math.sin(time * 6) * 2;
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(12, -12 + orbBob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (type.id === 'frost') {
      // Ice crown & frost crystals
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting ice shards
      for (let i = 0; i < 3; i++) {
        const shardAngle = time * 3 + (i * Math.PI * 2) / 3;
        const sx = Math.cos(shardAngle) * 14;
        const sy = Math.sin(shardAngle) * 14;
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type.id === 'assassin') {
      // Shadow cowl & dual poison daggers
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      // Twin poisoned daggers
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(15, -4);
      ctx.moveTo(6, 8);
      ctx.lineTo(15, 4);
      ctx.stroke();

      // Glowing venom eyes
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(4, -3, 2, 2);
      ctx.fillRect(4, 1, 2, 2);
    } else if (type.id === 'dragon') {
      // Dragon wyrm head with horns and flapping wings
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flapping wings
      const wingSpread = Math.sin(time * 8) * 8;
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(-8, -18 - wingSpread);
      ctx.lineTo(6, -8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-4, 8);
      ctx.lineTo(-8, 18 + wingSpread);
      ctx.lineTo(6, 8);
      ctx.fill();

      // Snout & fiery eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(10, -2, 2, 0, Math.PI * 2);
      ctx.arc(10, 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- Enemies (Monsters) Rendering ---
  public renderEnemies(enemies: Enemy[], time: number) {
    const ctx = this.ctx;

    enemies.forEach((enemy) => {
      const type = ENEMY_TYPES[enemy.typeId];
      if (!type) return;

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      // Air shadow
      if (enemy.isAir) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 16, enemy.size * 0.8, enemy.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.translate(0, -12); // Lift off ground
      }

      // Draw Monster Creature
      this.drawEnemyFigure(enemy, type, time);

      // Status Effects Indicators
      const hasFrozen = enemy.statusEffects.some((s) => s.type === 'freeze');
      const hasBurn = enemy.statusEffects.some((s) => s.type === 'burn');
      const hasPoison = enemy.statusEffects.some((s) => s.type === 'poison');
      const hasSlow = enemy.statusEffects.some((s) => s.type === 'slow');

      if (hasFrozen) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Health Bar
      const barWidth = Math.max(28, enemy.size * 1.8);
      const barHeight = enemy.isBoss ? 6 : 4;
      const barY = -enemy.size - 10;
      const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

      // Bar BG
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

      // Bar Fill (green to red)
      ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(-barWidth / 2, barY, barWidth * hpRatio, barHeight);

      // Bar Border
      ctx.strokeStyle = enemy.isBoss ? '#f59e0b' : 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);

      // Status Icons underneath bar
      let iconOffset = -barWidth / 2;
      if (hasBurn) {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(iconOffset, barY - 5, 4, 4);
        iconOffset += 6;
      }
      if (hasPoison) {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(iconOffset, barY - 5, 4, 4);
        iconOffset += 6;
      }
      if (hasSlow) {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(iconOffset, barY - 5, 4, 4);
      }

      ctx.restore();
    });
  }

  private drawEnemyFigure(
    enemy: Enemy,
    type: typeof ENEMY_TYPES[string],
    time: number
  ) {
    const ctx = this.ctx;
    const wobble = Math.sin(time * 10 + enemy.distanceTraveled * 0.1) * 3;

    ctx.save();
    ctx.rotate(enemy.angle);

    if (type.id === 'goblin') {
      // Fast green scout
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();

      // Pointy ears
      ctx.fillStyle = type.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(-4, -enemy.size);
      ctx.lineTo(0, -enemy.size - 6);
      ctx.lineTo(4, -enemy.size);
      ctx.fill();

      // Red eyes
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, -3, 3, 2);
      ctx.fillRect(4, 1, 3, 2);
    } else if (type.id === 'orc') {
      // Big burly warrior
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();

      // Iron helmet crest
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-enemy.size * 0.6, -enemy.size * 0.8, enemy.size * 1.2, 5);

      // Horns
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-8, -enemy.size * 0.7);
      ctx.lineTo(-14, -enemy.size * 1.2);
      ctx.lineTo(-4, -enemy.size * 0.7);
      ctx.fill();
    } else if (type.id === 'harpy') {
      // Winged flier
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, enemy.size, enemy.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wings flapping
      const wing = Math.sin(time * 14) * 12;
      ctx.fillStyle = type.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-12, -18 - wing);
      ctx.lineTo(8, -6);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(-12, 18 + wing);
      ctx.lineTo(8, 6);
      ctx.fill();
    } else if (type.id === 'shaman') {
      // Robed healer with totem
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();

      // Staff with glowing gem
      ctx.strokeStyle = '#4a044e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, -enemy.size - 6);
      ctx.lineTo(6, enemy.size + 4);
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(4, -enemy.size - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (type.id === 'undead_knight') {
      // Dark armored skeleton knight
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();

      // Spooky blue glowing eyes
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(5, -4, 3, 3);
      ctx.fillRect(5, 2, 3, 3);
      ctx.shadowBlur = 0;

      // Dark Shield
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-enemy.size * 0.8, -enemy.size * 0.5, 6, enemy.size);
    } else if (type.id === 'golem') {
      // Huge granite golem
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();

      // Magma cracks on rock body
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(0, 2);
      ctx.lineTo(8, -4);
      ctx.moveTo(0, 2);
      ctx.lineTo(2, 10);
      ctx.stroke();
    } else if (type.id === 'demon_boss') {
      // Giant Demon Lord Boss
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();

      // Demon giant horns
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.moveTo(-10, -enemy.size * 0.6);
      ctx.lineTo(-24, -enemy.size * 1.3);
      ctx.lineTo(-4, -enemy.size * 0.8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -enemy.size * 0.6);
      ctx.lineTo(24, -enemy.size * 1.3);
      ctx.lineTo(4, -enemy.size * 0.8);
      ctx.fill();

      // Glowing molten core
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (type.id === 'dragon_boss') {
      // Final Red Dragon Boss
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(0, 0, enemy.size, enemy.size * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Massive dragon wings
      const wing = Math.sin(time * 6) * 16;
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-20, -enemy.size * 1.5 - wing);
      ctx.lineTo(16, -10);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(-20, enemy.size * 1.5 + wing);
      ctx.lineTo(16, 10);
      ctx.fill();

      // Blazing dragon eye & jaw
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fillRect(enemy.size * 0.6, -4, 4, 3);
      ctx.fillRect(enemy.size * 0.6, 2, 4, 3);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // --- Projectiles Rendering ---
  public renderProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    projectiles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.damageType === 'physical') {
        // Arrow
        const angle = Math.atan2(p.targetLastY - p.y, p.targetLastX - p.x);
        ctx.rotate(angle);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.fillRect(-10, -2, 4, 4); // Fletch
      } else if (p.damageType === 'fire') {
        // Fireball with blazing tail
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.damageType === 'frost') {
        // Frost icicle shard
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p.size * 1.5, 0);
        ctx.lineTo(0, -p.size);
        ctx.lineTo(-p.size * 1.5, 0);
        ctx.lineTo(0, p.size);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.damageType === 'poison') {
        // Spinning poison shuriken
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Holy or other
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // --- Particles Rendering ---
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;

    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'flame') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // --- Floating Combat Text (Damage / Gold) ---
  public renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;

    texts.forEach((t) => {
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${t.size}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text stroke for great contrast
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);

      ctx.restore();
    });
  }
}
