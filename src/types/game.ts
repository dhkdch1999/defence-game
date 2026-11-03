/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DamageType = 'physical' | 'magic' | 'fire' | 'frost' | 'poison' | 'holy';

export type TargetPriority = 'first' | 'last' | 'strongest' | 'closest';

export interface Position {
  x: number;
  y: number;
}

export interface GuardianTypeInfo {
  id: string;
  name: string;
  title: string;
  role: 'melee' | 'sniper' | 'aoe_mage' | 'crowd_control' | 'assassin' | 'legendary';
  description: string;
  cost: number;
  damageType: DamageType;
  baseDamage: number;
  baseRange: number;
  baseAttackSpeed: number; // attacks per second
  color: string;
  accentColor: string;
  specialAbility: string;
  canTargetAir: boolean;
  upgradeCostFactor: number;
}

export interface Guardian {
  id: string;
  typeId: string;
  x: number;
  y: number;
  level: number;
  kills: number;
  damageDealt: number;
  lastShotTime: number;
  targetPriority: TargetPriority;
  targetEnemyId: string | null;
  angle: number;
  auraActive?: boolean;
}

export interface EnemyTypeInfo {
  id: string;
  name: string;
  description: string;
  baseHp: number;
  speed: number; // pixels per second
  armor: number; // percentage damage reduction
  magicResist: number;
  goldReward: number;
  scoreReward: number;
  isAir: boolean;
  isBoss: boolean;
  size: number;
  color: string;
  secondaryColor: string;
  specialTrait?: string;
}

export interface StatusEffect {
  type: 'burn' | 'slow' | 'freeze' | 'poison';
  duration: number; // in seconds
  value: number; // slow ratio or dps
  tickInterval?: number;
  lastTick?: number;
}

export interface Enemy {
  id: string;
  typeId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  goldReward: number;
  scoreReward: number;
  pathIndex: number; // current waypoint index
  subProgress: number; // progress 0 to 1 between waypoints
  distanceTraveled: number;
  statusEffects: StatusEffect[];
  armor: number;
  magicResist: number;
  isAir: boolean;
  isBoss: boolean;
  size: number;
  angle: number;
  spawnTime: number;
}

export interface Projectile {
  id: string;
  sourceX: number;
  sourceY: number;
  x: number;
  y: number;
  targetEnemyId: string;
  targetLastX: number;
  targetLastY: number;
  speed: number;
  damage: number;
  damageType: DamageType;
  splashRadius: number;
  statusEffect?: StatusEffect;
  color: string;
  size: number;
  isPenetrating?: boolean;
  hitEnemyIds?: string[];
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  shape?: 'circle' | 'spark' | 'ring' | 'star' | 'flame' | 'snow';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface MapWaypoint {
  x: number;
  y: number;
}

export interface MapSlot {
  id: string;
  x: number;
  y: number;
  occupiedGuardianId: string | null;
  terrainBonus?: 'range' | 'damage' | 'speed' | 'none';
}

export interface WaveConfig {
  waveNumber: number;
  isBossWave: boolean;
  totalEnemies: number;
  spawns: {
    enemyTypeId: string;
    count: number;
    intervalSeconds: number;
    delaySeconds: number;
  }[];
  bonusGoldReward: number;
}

export interface StageDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  difficulty: '쉬움' | '보통' | '어려움';
  theme: 'forest' | 'canyon' | 'citadel';
  paths: MapWaypoint[][]; // multiple paths support
  placementSlots: MapSlot[];
  waves: WaveConfig[];
  startingGold: number;
  startingLives: number;
}

export interface CommanderSpell {
  id: string;
  name: string;
  description: string;
  cooldown: number; // seconds
  currentCooldown: number;
  cost: number; // gold or free cooldown
  icon: string;
  radius: number;
  targetType: 'ground' | 'instant' | 'global';
}
