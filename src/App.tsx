/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Enemy,
  FloatingText,
  Guardian,
  Particle,
  Projectile,
  StageDefinition,
  TargetPriority,
} from './types/game';
import { STAGES } from './data/maps';
import { GUARDIAN_TYPES, getGuardianStats, getUpgradeCost, getSellRefund } from './data/guardians';
import { ENEMY_TYPES } from './data/enemies';
import { COMMANDER_SPELLS } from './data/spells';
import { CanvasRenderer } from './utils/canvasRenderer';
import { soundEngine } from './utils/sound';
import { TopBar } from './components/TopBar';
import { GuardianDock } from './components/GuardianDock';
import { SpellsDock } from './components/SpellsDock';
import { UnitInspector } from './components/UnitInspector';
import { BestiaryModal } from './components/BestiaryModal';
import { StageSelectModal } from './components/StageSelectModal';
import { GameOverModal } from './components/GameOverModal';

// Virtual coordinate space for crisp scaling
const VIRTUAL_WIDTH = 960;
const VIRTUAL_HEIGHT = 540;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- Game State ---
  const [currentStage, setCurrentStage] = useState<StageDefinition>(STAGES[0]);
  const [lives, setLives] = useState<number>(STAGES[0].startingLives);
  const [gold, setGold] = useState<number>(STAGES[0].startingGold);
  const [score, setScore] = useState<number>(0);
  const [kills, setKills] = useState<number>(0);

  // Wave progression
  const [currentWaveIndex, setCurrentWaveIndex] = useState<number>(1);
  const [isWaveInProgress, setIsWaveInProgress] = useState<boolean>(false);
  const [waveCountdown, setWaveCountdown] = useState<number>(6);

  // Controls & Modals
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);

  // Modals
  const [isBestiaryOpen, setIsBestiaryOpen] = useState<boolean>(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Selection & Placement
  const [selectedSummonTypeId, setSelectedSummonTypeId] = useState<string | null>(null);
  const [selectedGuardianId, setSelectedGuardianId] = useState<string | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);
  const [activeSpellId, setActiveSpellId] = useState<string | null>(null);

  // Spells state
  const [spells, setSpells] = useState(COMMANDER_SPELLS);
  const [goldRushActiveUntil, setGoldRushActiveUntil] = useState<number>(0);
  const [rallyActiveUntil, setRallyActiveUntil] = useState<number>(0);

  // --- Real-time Entities Refs (for 60 FPS loop without React state lags) ---
  const guardiansRef = useRef<Guardian[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const slotsRef = useRef(currentStage.placementSlots);
  const lastTimeRef = useRef<number>(performance.now());
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const waveSpawnsTrackerRef = useRef<{
    spawnQueue: { enemyTypeId: string; spawnTime: number; pathIndex: number }[];
    totalQueued: number;
    spawnedCount: number;
  }>({ spawnQueue: [], totalQueued: 0, spawnedCount: 0 });

  // Sync slots when stage changes
  useEffect(() => {
    slotsRef.current = currentStage.placementSlots.map((s) => ({
      ...s,
      occupiedGuardianId: null,
    }));
    resetGame(currentStage);
  }, [currentStage]);

  const resetGame = useCallback((stage: StageDefinition) => {
    setLives(stage.startingLives);
    setGold(stage.startingGold);
    setScore(0);
    setKills(0);
    setCurrentWaveIndex(1);
    setIsWaveInProgress(false);
    setWaveCountdown(6);
    setIsGameOverOpen(false);
    setIsVictory(false);
    setSelectedSummonTypeId(null);
    setSelectedGuardianId(null);
    setActiveSpellId(null);

    guardiansRef.current = [];
    enemiesRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    slotsRef.current = stage.placementSlots.map((s) => ({
      ...s,
      occupiedGuardianId: null,
    }));
    setSpells(COMMANDER_SPELLS.map((s) => ({ ...s, currentCooldown: 0 })));
    setGoldRushActiveUntil(0);
    setRallyActiveUntil(0);
  }, []);

  // --- Canvas Coordinate Conversion ---
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // --- Wave Management ---
  const startWave = useCallback((waveNum: number) => {
    const stage = currentStage;
    const wave = stage.waves.find((w) => w.waveNumber === waveNum);
    if (!wave) return;

    if (wave.isBossWave) {
      soundEngine.playBossAlarm();
      floatingTextsRef.current.push({
        id: Math.random().toString(),
        x: VIRTUAL_WIDTH / 2,
        y: 120,
        text: '경고: 강력한 보스 출현!',
        color: '#ef4444',
        life: 3.5,
        maxLife: 3.5,
        size: 24,
      });
    }

    const queue: { enemyTypeId: string; spawnTime: number; pathIndex: number }[] = [];
    let pathCounter = 0;

    wave.spawns.forEach((spawn) => {
      for (let i = 0; i < spawn.count; i++) {
        const pathIdx = pathCounter % stage.paths.length;
        pathCounter++;
        queue.push({
          enemyTypeId: spawn.enemyTypeId,
          spawnTime: spawn.delaySeconds + i * spawn.intervalSeconds,
          pathIndex: pathIdx,
        });
      }
    });

    // Sort queue by spawnTime
    queue.sort((a, b) => a.spawnTime - b.spawnTime);

    waveSpawnsTrackerRef.current = {
      spawnQueue: queue,
      totalQueued: queue.length,
      spawnedCount: 0,
    };

    setIsWaveInProgress(true);
    setWaveCountdown(0);
  }, [currentStage]);

  // Call Next Wave early for bonus gold
  const handleCallNextWave = () => {
    if (isWaveInProgress || currentWaveIndex > currentStage.waves.length) return;
    const bonusEarlyGold = 25;
    setGold((prev) => prev + bonusEarlyGold);
    soundEngine.playCoin();
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: VIRTUAL_WIDTH / 2,
      y: 160,
      text: `즉시 호출 보너스 +${bonusEarlyGold}G`,
      color: '#f59e0b',
      life: 2.0,
      maxLife: 2.0,
      size: 18,
    });
    startWave(currentWaveIndex);
  };

  // --- Actions: Placement, Upgrade, Sell ---
  const handlePlaceGuardian = (slotId: string) => {
    if (!selectedSummonTypeId) return;
    const type = GUARDIAN_TYPES[selectedSummonTypeId];
    if (!type || gold < type.cost) return;

    const slot = slotsRef.current.find((s) => s.id === slotId);
    if (!slot || slot.occupiedGuardianId) return;

    const newGuardian: Guardian = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      typeId: selectedSummonTypeId,
      x: slot.x,
      y: slot.y,
      level: 1,
      kills: 0,
      damageDealt: 0,
      lastShotTime: 0,
      targetPriority: 'first',
      targetEnemyId: null,
      angle: 0,
    };

    slot.occupiedGuardianId = newGuardian.id;
    guardiansRef.current.push(newGuardian);
    setGold((prev) => prev - type.cost);
    soundEngine.playPlaceTower();

    // Spurt placement particles
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      particlesRef.current.push({
        id: Math.random().toString(),
        x: slot.x,
        y: slot.y,
        vx: Math.cos(angle) * 45,
        vy: Math.sin(angle) * 45,
        life: 0.4,
        maxLife: 0.4,
        size: 3,
        color: type.color,
        alpha: 1,
        shape: 'spark',
      });
    }

    setSelectedSummonTypeId(null);
    setSelectedGuardianId(newGuardian.id);
  };

  const handleUpgradeGuardian = (guardianId: string) => {
    const guardian = guardiansRef.current.find((g) => g.id === guardianId);
    if (!guardian) return;

    const cost = getUpgradeCost(guardian.typeId, guardian.level);
    if (gold < cost || guardian.level >= 5) return;

    setGold((prev) => prev - cost);
    guardian.level += 1;
    soundEngine.playUpgrade();

    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: guardian.x,
      y: guardian.y - 30,
      text: guardian.level === 3 ? '각성 승급!' : `레벨 ${guardian.level} 강화!`,
      color: guardian.level >= 3 ? '#f59e0b' : '#38bdf8',
      life: 1.8,
      maxLife: 1.8,
      size: 16,
    });

    // Level up visual aura burst
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      particlesRef.current.push({
        id: Math.random().toString(),
        x: guardian.x,
        y: guardian.y,
        vx: Math.cos(angle) * 60,
        vy: Math.sin(angle) * 60,
        life: 0.6,
        maxLife: 0.6,
        size: 4,
        color: '#fbbf24',
        alpha: 1,
        shape: 'spark',
      });
    }
  };

  const handleSellGuardian = (guardianId: string) => {
    const index = guardiansRef.current.findIndex((g) => g.id === guardianId);
    if (index === -1) return;

    const guardian = guardiansRef.current[index];
    const refund = getSellRefund(guardian.typeId, guardian.level);

    // Free the slot
    const slot = slotsRef.current.find((s) => s.occupiedGuardianId === guardianId);
    if (slot) {
      slot.occupiedGuardianId = null;
    }

    guardiansRef.current.splice(index, 1);
    setGold((prev) => prev + refund);
    soundEngine.playSell();

    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: guardian.x,
      y: guardian.y - 20,
      text: `+${refund}G`,
      color: '#fbbf24',
      life: 1.5,
      maxLife: 1.5,
      size: 14,
    });

    setSelectedGuardianId(null);
  };

  const handleChangePriority = (guardianId: string, priority: TargetPriority) => {
    const guardian = guardiansRef.current.find((g) => g.id === guardianId);
    if (guardian) {
      guardian.targetPriority = priority;
      setSelectedGuardianId(guardianId); // force re-render
    }
  };

  // --- Commander Spells ---
  const handleActivateSpell = (spellId: string) => {
    const spell = spells.find((s) => s.id === spellId);
    if (!spell || spell.currentCooldown > 0) return;

    if (spell.targetType === 'instant') {
      executeInstantSpell(spellId);
    } else if (spell.targetType === 'global') {
      executeGlobalSpell(spellId);
    } else {
      // Ground target
      setActiveSpellId(spellId);
    }
  };

  const executeInstantSpell = (spellId: string) => {
    if (spellId === 'rally') {
      setRallyActiveUntil(Date.now() + 7000);
      soundEngine.playHolySmite();
      floatingTextsRef.current.push({
        id: Math.random().toString(),
        x: VIRTUAL_WIDTH / 2,
        y: 180,
        text: '전술 포효: 공격 속도 +60%!',
        color: '#fbbf24',
        life: 2.5,
        maxLife: 2.5,
        size: 20,
      });
    } else if (spellId === 'gold_rush') {
      setGold((prev) => prev + 120);
      setGoldRushActiveUntil(Date.now() + 10000);
      soundEngine.playCoin();
      floatingTextsRef.current.push({
        id: Math.random().toString(),
        x: VIRTUAL_WIDTH / 2,
        y: 180,
        text: '마이다스의 축복: +120G 및 골드 2배!',
        color: '#facc15',
        life: 2.5,
        maxLife: 2.5,
        size: 20,
      });
    }

    // Set cooldown
    setSpells((prev) =>
      prev.map((s) => (s.id === spellId ? { ...s, currentCooldown: s.cooldown } : s))
    );
    setActiveSpellId(null);
  };

  const executeGlobalSpell = (spellId: string) => {
    if (spellId === 'blizzard') {
      soundEngine.playBlizzard();
      floatingTextsRef.current.push({
        id: Math.random().toString(),
        x: VIRTUAL_WIDTH / 2,
        y: 180,
        text: '혹한의 눈보라: 전장 결빙!',
        color: '#38bdf8',
        life: 2.5,
        maxLife: 2.5,
        size: 22,
      });

      // Freeze all active enemies
      enemiesRef.current.forEach((enemy) => {
        enemy.hp -= 120;
        enemy.statusEffects.push({
          type: 'freeze',
          duration: 4.0,
          value: 1.0,
        });

        // Ice particles
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push({
            id: Math.random().toString(),
            x: enemy.x + (Math.random() - 0.5) * 20,
            y: enemy.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            life: 0.8,
            maxLife: 0.8,
            size: 3,
            color: '#7dd3fc',
            alpha: 1,
            shape: 'snow',
          });
        }
      });
    }

    setSpells((prev) =>
      prev.map((s) => (s.id === spellId ? { ...s, currentCooldown: s.cooldown } : s))
    );
    setActiveSpellId(null);
  };

  const executeGroundSpell = (spellId: string, x: number, y: number) => {
    if (spellId === 'meteor') {
      soundEngine.playMeteor();

      // Giant explosion shockwave particles
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 120;
        particlesRef.current.push({
          id: Math.random().toString(),
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.9,
          maxLife: 0.9,
          size: 5 + Math.random() * 4,
          color: i % 2 === 0 ? '#ef4444' : '#f59e0b',
          alpha: 1,
          shape: 'flame',
        });
      }

      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.5,
        maxLife: 0.5,
        size: 120,
        color: '#ea580c',
        alpha: 0.8,
        shape: 'ring',
      });

      // Damage enemies in 120 radius
      const radius = 120;
      enemiesRef.current.forEach((enemy) => {
        const dist = Math.hypot(enemy.x - x, enemy.y - y);
        if (dist <= radius) {
          enemy.hp -= 450;
          enemy.statusEffects.push({
            type: 'burn',
            duration: 4,
            value: 30,
          });

          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: enemy.x,
            y: enemy.y - 15,
            text: '-450',
            color: '#f97316',
            life: 1.2,
            maxLife: 1.2,
            size: 18,
          });
        }
      });
    }

    setSpells((prev) =>
      prev.map((s) => (s.id === spellId ? { ...s, currentCooldown: s.cooldown } : s))
    );
    setActiveSpellId(null);
  };

  // --- Canvas Interaction Handlers ---
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    // 1. If active spell targeting
    if (activeSpellId) {
      executeGroundSpell(activeSpellId, coords.x, coords.y);
      return;
    }

    // 2. Check if clicked on a placement slot
    const clickedSlot = slotsRef.current.find(
      (s) => Math.hypot(s.x - coords.x, s.y - coords.y) <= 24
    );

    if (clickedSlot) {
      if (clickedSlot.occupiedGuardianId) {
        setSelectedGuardianId(clickedSlot.occupiedGuardianId);
        setSelectedSummonTypeId(null);
        return;
      } else if (selectedSummonTypeId) {
        handlePlaceGuardian(clickedSlot.id);
        return;
      }
    }

    // 3. Check if clicked directly on an existing guardian
    const clickedGuardian = guardiansRef.current.find(
      (g) => Math.hypot(g.x - coords.x, g.y - coords.y) <= 24
    );

    if (clickedGuardian) {
      setSelectedGuardianId(clickedGuardian.id);
      setSelectedSummonTypeId(null);
      return;
    }

    // Otherwise deselect
    setSelectedGuardianId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const hoveredSlot = slotsRef.current.find(
      (s) => Math.hypot(s.x - coords.x, s.y - coords.y) <= 24
    );
    setHoveredSlotId(hoveredSlot ? hoveredSlot.id : null);
  };

  // Keyboard Shortcuts (1-6 for summon, Q-R for spells, Space for pause, ESC for cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= '1' && e.key <= '6') {
        const types = Object.keys(GUARDIAN_TYPES);
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < types.length) {
          const type = GUARDIAN_TYPES[types[idx]];
          if (gold >= type.cost) {
            setSelectedSummonTypeId((prev) => (prev === type.id ? null : type.id));
            setSelectedGuardianId(null);
            setActiveSpellId(null);
          }
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        handleActivateSpell('meteor');
      } else if (e.key === 'w' || e.key === 'W') {
        handleActivateSpell('blizzard');
      } else if (e.key === 'e' || e.key === 'E') {
        handleActivateSpell('rally');
      } else if (e.key === 'r' || e.key === 'R') {
        handleActivateSpell('gold_rush');
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelectedSummonTypeId(null);
        setSelectedGuardianId(null);
        setActiveSpellId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gold, spells]);

  // --- Main 60 FPS Game Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new CanvasRenderer(ctx, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    let animationId: number;
    let waveElapsed = 0;

    const gameLoop = (currentTime: number) => {
      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Cap delta time to prevent spiraling after tab unfocus
      const dt = Math.min(rawDt, 0.1) * (isPaused ? 0 : gameSpeed);
      const isRallyActive = Date.now() < rallyActiveUntil;
      const isGoldRushActive = Date.now() < goldRushActiveUntil;

      // Update Spells Cooldown
      if (!isPaused && dt > 0) {
        setSpells((prev) =>
          prev.map((s) => ({
            ...s,
            currentCooldown: Math.max(0, s.currentCooldown - dt),
          }))
        );
      }

      // 1. Spawning Enemies from queue
      if (isWaveInProgress && !isPaused) {
        waveElapsed += dt;
        const tracker = waveSpawnsTrackerRef.current;

        while (tracker.spawnQueue.length > 0 && tracker.spawnQueue[0].spawnTime <= waveElapsed) {
          const nextSpawn = tracker.spawnQueue.shift()!;
          const enemyType = ENEMY_TYPES[nextSpawn.enemyTypeId];
          if (enemyType) {
            const path = currentStage.paths[nextSpawn.pathIndex] || currentStage.paths[0];
            const startNode = path[0];

            enemiesRef.current.push({
              id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              typeId: enemyType.id,
              x: startNode.x,
              y: startNode.y,
              hp: enemyType.baseHp,
              maxHp: enemyType.baseHp,
              speed: enemyType.speed,
              goldReward: enemyType.goldReward,
              scoreReward: enemyType.scoreReward,
              pathIndex: 0,
              subProgress: 0,
              distanceTraveled: 0,
              statusEffects: [],
              armor: enemyType.armor,
              magicResist: enemyType.magicResist,
              isAir: enemyType.isAir,
              isBoss: enemyType.isBoss,
              size: enemyType.size,
              angle: 0,
              spawnTime: waveElapsed,
            });
            tracker.spawnedCount++;
          }
        }

        // Check if wave is finished (all spawned and all defeated)
        if (tracker.spawnQueue.length === 0 && enemiesRef.current.length === 0) {
          setIsWaveInProgress(false);
          waveElapsed = 0;

          // Award wave bonus
          const wave = currentStage.waves.find((w) => w.waveNumber === currentWaveIndex);
          const bonus = wave ? wave.bonusGoldReward : 50;
          setGold((prev) => prev + bonus);
          soundEngine.playCoin();

          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: VIRTUAL_WIDTH / 2,
            y: 180,
            text: `웨이브 클리어! 보너스 +${bonus}G`,
            color: '#22c55e',
            life: 2.2,
            maxLife: 2.2,
            size: 20,
          });

          // Check if Victory!
          if (currentWaveIndex >= currentStage.waves.length) {
            setIsVictory(true);
            setIsGameOverOpen(true);
            soundEngine.playVictory();
          } else {
            setCurrentWaveIndex((prev) => prev + 1);
            setWaveCountdown(8); // 8 seconds before next wave auto starts
          }
        }
      }

      // Auto countdown to next wave
      if (!isWaveInProgress && waveCountdown > 0 && !isPaused && dt > 0) {
        setWaveCountdown((prev) => {
          const next = prev - dt;
          if (next <= 0) {
            startWave(currentWaveIndex);
            return 0;
          }
          return next;
        });
      }

      // 2. Update Enemies Movement & Status Effects
      if (!isPaused) {
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const enemy = enemiesRef.current[i];
          const path = currentStage.paths[0]; // Primary or assigned path

          // Process Status Effects (burn, slow, freeze, poison)
          let speedFactor = 1.0;
          let isFrozen = false;

          for (let s = enemy.statusEffects.length - 1; s >= 0; s--) {
            const effect = enemy.statusEffects[s];
            effect.duration -= dt;

            if (effect.type === 'burn') {
              enemy.hp -= effect.value * dt;
            } else if (effect.type === 'poison') {
              enemy.hp -= effect.value * dt;
            } else if (effect.type === 'slow') {
              speedFactor *= Math.max(0.2, 1 - effect.value);
            } else if (effect.type === 'freeze') {
              isFrozen = true;
            }

            if (effect.duration <= 0) {
              enemy.statusEffects.splice(s, 1);
            }
          }

          // Move along waypoints if not frozen
          if (!isFrozen) {
            const currentWaypoint = path[enemy.pathIndex];
            const nextWaypoint = path[enemy.pathIndex + 1];

            if (nextWaypoint) {
              const dx = nextWaypoint.x - currentWaypoint.x;
              const dy = nextWaypoint.y - currentWaypoint.y;
              const segLength = Math.hypot(dx, dy);
              const moveDist = enemy.speed * speedFactor * dt;

              enemy.subProgress += moveDist / (segLength || 1);
              enemy.distanceTraveled += moveDist;
              enemy.angle = Math.atan2(dy, dx);

              if (enemy.subProgress >= 1) {
                enemy.pathIndex++;
                enemy.subProgress = 0;
              }

              // Update coordinates
              const curW = path[enemy.pathIndex] || nextWaypoint;
              const nxtW = path[enemy.pathIndex + 1] || curW;
              enemy.x = curW.x + (nxtW.x - curW.x) * enemy.subProgress;
              enemy.y = curW.y + (nxtW.y - curW.y) * enemy.subProgress;
            } else {
              // Enemy reached Castle Bastion / Exit!
              soundEngine.playLifeLost();
              const damageToCastle = enemy.isBoss ? 5 : 1;

              setLives((prev) => {
                const updated = Math.max(0, prev - damageToCastle);
                if (updated <= 0) {
                  setIsVictory(false);
                  setIsGameOverOpen(true);
                  soundEngine.playDefeat();
                }
                return updated;
              });

              floatingTextsRef.current.push({
                id: Math.random().toString(),
                x: enemy.x,
                y: enemy.y - 10,
                text: `-${damageToCastle} HP`,
                color: '#ef4444',
                life: 1.5,
                maxLife: 1.5,
                size: 16,
              });

              enemiesRef.current.splice(i, 1);
              continue;
            }
          }

          // Check if enemy died from DoT
          if (enemy.hp <= 0) {
            const finalGold = isGoldRushActive ? enemy.goldReward * 2 : enemy.goldReward;
            setGold((prev) => prev + finalGold);
            setScore((prev) => prev + enemy.scoreReward);
            setKills((prev) => prev + 1);
            soundEngine.playCoin();

            floatingTextsRef.current.push({
              id: Math.random().toString(),
              x: enemy.x,
              y: enemy.y - 10,
              text: `+${finalGold}G`,
              color: '#fbbf24',
              life: 1.2,
              maxLife: 1.2,
              size: 14,
            });

            enemiesRef.current.splice(i, 1);
          }
        }
      }

      // 3. Guardians AI & Attack Loop
      if (!isPaused) {
        const paladins = guardiansRef.current.filter((g) => g.typeId === 'paladin' && g.level >= 3);

        guardiansRef.current.forEach((guardian) => {
          const type = GUARDIAN_TYPES[guardian.typeId];
          const stats = getGuardianStats(guardian.typeId, guardian.level);
          if (!type || !stats) return;

          // Check Paladin Holy Aura (+25% damage buff)
          let damageMultiplier = 1.0;
          paladins.forEach((pal) => {
            if (Math.hypot(pal.x - guardian.x, pal.y - guardian.y) <= 140) {
              damageMultiplier *= 1.25;
            }
          });

          // Check Rally buff (+60% attack speed)
          const effectiveAttackSpeed = stats.attackSpeed * (isRallyActive ? 1.6 : 1.0);
          const attackInterval = 1 / effectiveAttackSpeed;

          // Check Slot bonus
          const slot = slotsRef.current.find((s) => s.occupiedGuardianId === guardian.id);
          let effectiveRange = stats.range;
          if (slot?.terrainBonus === 'range') effectiveRange *= 1.2;
          if (slot?.terrainBonus === 'damage') damageMultiplier *= 1.15;

          // Find candidate targets in range
          const candidates = enemiesRef.current.filter((e) => {
            if (!type.canTargetAir && e.isAir) return false;
            return Math.hypot(e.x - guardian.x, e.y - guardian.y) <= effectiveRange;
          });

          if (candidates.length === 0) {
            guardian.targetEnemyId = null;
            return;
          }

          // Sort by Priority
          if (guardian.targetPriority === 'first') {
            candidates.sort((a, b) => b.distanceTraveled - a.distanceTraveled);
          } else if (guardian.targetPriority === 'last') {
            candidates.sort((a, b) => a.distanceTraveled - b.distanceTraveled);
          } else if (guardian.targetPriority === 'strongest') {
            candidates.sort((a, b) => b.hp - a.hp);
          } else if (guardian.targetPriority === 'closest') {
            candidates.sort(
              (a, b) =>
                Math.hypot(a.x - guardian.x, a.y - guardian.y) -
                Math.hypot(b.x - guardian.x, b.y - guardian.y)
            );
          }

          const target = candidates[0];
          guardian.targetEnemyId = target.id;
          guardian.angle = Math.atan2(target.y - guardian.y, target.x - guardian.x);

          // Attack Trigger
          if (currentTime / 1000 - guardian.lastShotTime >= attackInterval) {
            guardian.lastShotTime = currentTime / 1000;
            const finalDamage = stats.damage * damageMultiplier;

            // Attack Sound
            if (type.id === 'archer') soundEngine.playArrow();
            else if (type.id === 'mage') soundEngine.playFireball();
            else if (type.id === 'frost') soundEngine.playFrost();
            else if (type.id === 'assassin') soundEngine.playPoison();
            else if (type.id === 'dragon') soundEngine.playDragonBreath();
            else soundEngine.playHolySmite();

            if (type.id === 'paladin') {
              // Melee Holy Swing: hits up to 3 nearby ground targets
              const targets = candidates.slice(0, guardian.level >= 3 ? 4 : 2);
              targets.forEach((t) => {
                const dmg = finalDamage * (1 - t.armor * 0.5);
                t.hp -= dmg;
                guardian.damageDealt += dmg;

                floatingTextsRef.current.push({
                  id: Math.random().toString(),
                  x: t.x,
                  y: t.y - 12,
                  text: `-${Math.round(dmg)}`,
                  color: '#fbbf24',
                  life: 0.8,
                  maxLife: 0.8,
                  size: 13,
                });

                if (t.hp <= 0) {
                  guardian.kills++;
                }
              });
            } else {
              // Ranged Projectile
              projectilesRef.current.push({
                id: `p_${Date.now()}_${Math.random()}`,
                sourceX: guardian.x,
                sourceY: guardian.y,
                x: guardian.x,
                y: guardian.y,
                targetEnemyId: target.id,
                targetLastX: target.x,
                targetLastY: target.y,
                speed: type.id === 'archer' ? 520 : type.id === 'mage' ? 360 : 420,
                damage: finalDamage,
                damageType: type.damageType,
                splashRadius: type.id === 'mage' ? (guardian.level >= 3 ? 90 : 60) : 0,
                statusEffect:
                  type.id === 'frost'
                    ? {
                        type: guardian.level >= 3 && Math.random() < 0.25 ? 'freeze' : 'slow',
                        duration: guardian.level >= 3 ? 2.5 : 2.0,
                        value: guardian.level >= 3 ? 0.6 : 0.45,
                      }
                    : type.id === 'assassin'
                    ? {
                        type: 'poison',
                        duration: 3.5,
                        value: 20 * guardian.level,
                      }
                    : type.id === 'mage'
                    ? {
                        type: 'burn',
                        duration: 3.0,
                        value: 15 * guardian.level,
                      }
                    : undefined,
                color: type.color,
                size: type.id === 'mage' ? 8 : type.id === 'dragon' ? 10 : 4,
              });
            }
          }
        });
      }

      // 4. Update Projectiles
      if (!isPaused) {
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
          const p = projectilesRef.current[i];
          const target = enemiesRef.current.find((e) => e.id === p.targetEnemyId);

          if (target) {
            p.targetLastX = target.x;
            p.targetLastY = target.y;
          }

          const dx = p.targetLastX - p.x;
          const dy = p.targetLastY - p.y;
          const dist = Math.hypot(dx, dy);
          const step = p.speed * dt;

          if (dist <= step || dist < 12) {
            // Hit!
            const hitEnemies = p.splashRadius > 0
              ? enemiesRef.current.filter(
                  (e) => Math.hypot(e.x - p.targetLastX, e.y - p.targetLastY) <= p.splashRadius
                )
              : target
              ? [target]
              : [];

            hitEnemies.forEach((e) => {
              // Armor / Resistance calculation
              let reduction = 0;
              if (p.damageType === 'physical') reduction = e.armor;
              else if (p.damageType === 'magic' || p.damageType === 'frost' || p.damageType === 'fire') {
                reduction = e.magicResist;
              } else if (p.damageType === 'poison') {
                reduction = e.armor * 0.2; // poison ignores 80% armor
              }

              // Critical hit chance for Archer
              let isCrit = false;
              let effectiveDmg = p.damage * (1 - reduction);
              if (p.damageType === 'physical' && Math.random() < 0.3) {
                isCrit = true;
                effectiveDmg *= 2.2;
              }

              e.hp -= effectiveDmg;

              // Apply status effect
              if (p.statusEffect) {
                e.statusEffects.push({ ...p.statusEffect });
              }

              // Floating damage
              floatingTextsRef.current.push({
                id: Math.random().toString(),
                x: e.x,
                y: e.y - 12,
                text: `${isCrit ? '치명타! ' : ''}-${Math.round(effectiveDmg)}`,
                color: isCrit ? '#facc15' : p.color,
                life: 0.9,
                maxLife: 0.9,
                size: isCrit ? 15 : 12,
              });

              // Enemy Death
              if (e.hp <= 0) {
                const finalGold = isGoldRushActive ? e.goldReward * 2 : e.goldReward;
                setGold((prev) => prev + finalGold);
                setScore((prev) => prev + e.scoreReward);
                setKills((prev) => prev + 1);
                soundEngine.playCoin();

                floatingTextsRef.current.push({
                  id: Math.random().toString(),
                  x: e.x,
                  y: e.y - 10,
                  text: `+${finalGold}G`,
                  color: '#fbbf24',
                  life: 1.2,
                  maxLife: 1.2,
                  size: 14,
                });
              }
            });

            // Hit Particles
            for (let k = 0; k < (p.splashRadius > 0 ? 16 : 6); k++) {
              const angle = Math.random() * Math.PI * 2;
              particlesRef.current.push({
                id: Math.random().toString(),
                x: p.targetLastX,
                y: p.targetLastY,
                vx: Math.cos(angle) * (p.splashRadius > 0 ? 70 : 35),
                vy: Math.sin(angle) * (p.splashRadius > 0 ? 70 : 35),
                life: 0.35,
                maxLife: 0.35,
                size: 3,
                color: p.color,
                alpha: 1,
                shape: p.damageType === 'fire' ? 'flame' : 'spark',
              });
            }

            projectilesRef.current.splice(i, 1);
          } else {
            p.x += (dx / dist) * step;
            p.y += (dy / dist) * step;
          }
        }
      }

      // 5. Update Particles & Floating Text
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.life -= dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.alpha = Math.max(0, pt.life / pt.maxLife);
        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.life -= dt;
        ft.y -= 22 * dt;
        if (ft.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // 6. Draw Complete Scene
      if (rendererRef.current) {
        const r = rendererRef.current;
        const timeSec = currentTime / 1000;

        r.renderBackground(currentStage, timeSec);
        r.renderPaths(currentStage, timeSec);
        r.renderSlots(
          slotsRef.current,
          hoveredSlotId,
          selectedGuardianId,
          selectedSummonTypeId !== null
        );
        r.renderGuardians(guardiansRef.current, selectedGuardianId, timeSec);
        r.renderEnemies(enemiesRef.current, timeSec);
        r.renderProjectiles(projectilesRef.current);
        r.renderParticles(particlesRef.current);
        r.renderFloatingTexts(floatingTextsRef.current);

        // Active Spell Targeting Cursor on Map
        if (activeSpellId) {
          const spell = spells.find((s) => s.id === activeSpellId);
          if (spell && spell.targetType === 'ground') {
            // Render target reticle
            ctx.save();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            // Draw on hovered position if any
            ctx.restore();
          }
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [
    currentStage,
    currentWaveIndex,
    isWaveInProgress,
    waveCountdown,
    isPaused,
    gameSpeed,
    hoveredSlotId,
    selectedGuardianId,
    selectedSummonTypeId,
    activeSpellId,
    rallyActiveUntil,
    goldRushActiveUntil,
    startWave,
  ]);

  const selectedGuardian = guardiansRef.current.find((g) => g.id === selectedGuardianId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0f17] text-slate-100 overflow-hidden select-none">
      {/* Top HUD */}
      <TopBar
        currentStage={currentStage}
        lives={lives}
        maxLives={currentStage.startingLives}
        gold={gold}
        currentWaveIndex={currentWaveIndex}
        totalWaves={currentStage.waves.length}
        isWaveInProgress={isWaveInProgress}
        waveCountdown={Math.ceil(waveCountdown)}
        score={score}
        kills={kills}
        gameSpeed={gameSpeed}
        isPaused={isPaused}
        isMuted={isMuted}
        isBgmPlaying={isBgmPlaying}
        onSpeedChange={setGameSpeed}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onToggleMute={() => {
          const next = !isMuted;
          soundEngine.setMuted(next);
          setIsMuted(next);
        }}
        onToggleBgm={() => {
          const active = soundEngine.toggleBgm();
          setIsBgmPlaying(active);
        }}
        onCallNextWave={handleCallNextWave}
        onOpenStageSelect={() => setIsStageSelectOpen(true)}
        onOpenBestiary={() => setIsBestiaryOpen(true)}
        onRestart={() => resetGame(currentStage)}
      />

      {/* Main Canvas Area */}
      <main
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center p-2 bg-slate-950/70 overflow-hidden"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0c0f17] max-w-full max-h-full aspect-[16/9] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className={`w-full h-full block ${
              activeSpellId
                ? 'cursor-crosshair'
                : selectedSummonTypeId
                ? 'cursor-pointer'
                : 'cursor-default'
            }`}
          />

          {/* Unit Inspector Drawer */}
          <UnitInspector
            guardian={selectedGuardian}
            gold={gold}
            onClose={() => setSelectedGuardianId(null)}
            onUpgrade={handleUpgradeGuardian}
            onSell={handleSellGuardian}
            onChangePriority={handleChangePriority}
          />

          {/* Spells Dock (Top Left overlay inside canvas container) */}
          <div className="absolute top-4 left-4">
            <SpellsDock
              spells={spells}
              activeSpellId={activeSpellId}
              onActivateSpell={handleActivateSpell}
              onCancelSpell={() => setActiveSpellId(null)}
            />
          </div>

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/90 border border-slate-700 px-6 py-3 rounded-2xl shadow-2xl text-center">
                <span className="text-xl font-bold font-cinzel text-amber-400">일시정지</span>
                <p className="text-xs text-slate-400 mt-1">스페이스바를 눌러 게임을 재개하세요</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Summon Dock */}
      <footer className="w-full bg-slate-900/80 border-t border-slate-800/80 p-2 flex items-center justify-center backdrop-blur-md z-20">
        <GuardianDock
          gold={gold}
          selectedTypeId={selectedSummonTypeId}
          onSelectType={(typeId) => {
            setSelectedSummonTypeId(typeId);
            setSelectedGuardianId(null);
            setActiveSpellId(null);
          }}
        />
      </footer>

      {/* Modals */}
      <BestiaryModal
        isOpen={isBestiaryOpen}
        onClose={() => setIsBestiaryOpen(false)}
      />

      <StageSelectModal
        isOpen={isStageSelectOpen}
        currentStageId={currentStage.id}
        onSelectStage={(stage) => {
          setCurrentStage(stage);
          resetGame(stage);
        }}
        onClose={() => setIsStageSelectOpen(false)}
      />

      {isGameOverOpen && (
        <GameOverModal
          isVictory={isVictory}
          stage={currentStage}
          wavesCleared={currentWaveIndex}
          totalWaves={currentStage.waves.length}
          score={score}
          kills={kills}
          guardians={guardiansRef.current}
          onRestart={() => resetGame(currentStage)}
          onNextStage={
            isVictory && currentStage.id !== STAGES[STAGES.length - 1].id
              ? () => {
                  const currentIdx = STAGES.findIndex((s) => s.id === currentStage.id);
                  if (currentIdx !== -1 && currentIdx + 1 < STAGES.length) {
                    const nextStage = STAGES[currentIdx + 1];
                    setCurrentStage(nextStage);
                    resetGame(nextStage);
                  }
                }
              : undefined
          }
          onOpenStageSelect={() => {
            setIsGameOverOpen(false);
            setIsStageSelectOpen(true);
          }}
        />
      )}
    </div>
  );
}
