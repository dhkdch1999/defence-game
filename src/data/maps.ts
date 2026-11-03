/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StageDefinition, WaveConfig } from '../types/game';

// Helper to generate dynamic wave configs with smooth scaling
function generateWaves(theme: 'forest' | 'canyon' | 'citadel', totalWaves: number): WaveConfig[] {
  const waves: WaveConfig[] = [];

  for (let w = 1; w <= totalWaves; w++) {
    const isBoss = w === totalWaves || (totalWaves >= 20 && w === 10);
    const bonusGold = 40 + w * 12;

    if (w === totalWaves) {
      // Final Boss Wave!
      waves.push({
        waveNumber: w,
        isBossWave: true,
        totalEnemies: 7,
        bonusGoldReward: bonusGold + 150,
        spawns: [
          { enemyTypeId: theme === 'citadel' ? 'dragon_boss' : 'demon_boss', count: 1, intervalSeconds: 0, delaySeconds: 2 },
          { enemyTypeId: 'golem', count: 2, intervalSeconds: 4, delaySeconds: 6 },
          { enemyTypeId: 'undead_knight', count: 4, intervalSeconds: 3, delaySeconds: 12 },
        ],
      });
      continue;
    }

    if (w === 10 && totalWaves >= 15) {
      // Mid Boss Wave!
      waves.push({
        waveNumber: w,
        isBossWave: true,
        totalEnemies: 11,
        bonusGoldReward: bonusGold + 80,
        spawns: [
          { enemyTypeId: 'demon_boss', count: 1, intervalSeconds: 0, delaySeconds: 3 },
          { enemyTypeId: 'orc', count: 6, intervalSeconds: 2.2, delaySeconds: 6 },
          { enemyTypeId: 'shaman', count: 2, intervalSeconds: 4, delaySeconds: 8 },
          { enemyTypeId: 'harpy', count: 2, intervalSeconds: 3, delaySeconds: 14 },
        ],
      });
      continue;
    }

    // Standard wave progression
    if (w <= 3) {
      waves.push({
        waveNumber: w,
        isBossWave: false,
        totalEnemies: 8 + w * 2,
        bonusGoldReward: bonusGold,
        spawns: [
          { enemyTypeId: 'goblin', count: 8 + w * 2, intervalSeconds: 1.8 - w * 0.1, delaySeconds: 1 },
        ],
      });
    } else if (w <= 6) {
      waves.push({
        waveNumber: w,
        isBossWave: false,
        totalEnemies: 10 + w * 2,
        bonusGoldReward: bonusGold,
        spawns: [
          { enemyTypeId: 'goblin', count: 6 + w, intervalSeconds: 1.4, delaySeconds: 1 },
          { enemyTypeId: 'orc', count: 3 + Math.floor(w / 2), intervalSeconds: 2.5, delaySeconds: 5 },
          { enemyTypeId: 'harpy', count: 2, intervalSeconds: 3, delaySeconds: 10 },
        ],
      });
    } else if (w <= 9) {
      waves.push({
        waveNumber: w,
        isBossWave: false,
        totalEnemies: 14 + w * 2,
        bonusGoldReward: bonusGold,
        spawns: [
          { enemyTypeId: 'orc', count: 6 + Math.floor(w / 2), intervalSeconds: 2.0, delaySeconds: 1 },
          { enemyTypeId: 'harpy', count: 4 + Math.floor(w / 2), intervalSeconds: 2.2, delaySeconds: 4 },
          { enemyTypeId: 'shaman', count: 2, intervalSeconds: 5.0, delaySeconds: 8 },
        ],
      });
    } else if (w <= 14) {
      waves.push({
        waveNumber: w,
        isBossWave: false,
        totalEnemies: 18 + w,
        bonusGoldReward: bonusGold,
        spawns: [
          { enemyTypeId: 'undead_knight', count: 4 + Math.floor(w / 3), intervalSeconds: 2.5, delaySeconds: 1 },
          { enemyTypeId: 'harpy', count: 6, intervalSeconds: 1.8, delaySeconds: 5 },
          { enemyTypeId: 'golem', count: 1 + Math.floor((w - 10) / 2), intervalSeconds: 6.0, delaySeconds: 10 },
          { enemyTypeId: 'shaman', count: 3, intervalSeconds: 4.0, delaySeconds: 12 },
        ],
      });
    } else {
      waves.push({
        waveNumber: w,
        isBossWave: false,
        totalEnemies: 22 + w,
        bonusGoldReward: bonusGold,
        spawns: [
          { enemyTypeId: 'golem', count: 3, intervalSeconds: 5.0, delaySeconds: 1 },
          { enemyTypeId: 'undead_knight', count: 8, intervalSeconds: 2.0, delaySeconds: 4 },
          { enemyTypeId: 'harpy', count: 8, intervalSeconds: 1.5, delaySeconds: 10 },
          { enemyTypeId: 'shaman', count: 4, intervalSeconds: 3.5, delaySeconds: 15 },
        ],
      });
    }
  }

  return waves;
}

export const STAGES: StageDefinition[] = [
  {
    id: 'stage_forest',
    name: '에메랄드 숲길',
    subtitle: '평화로운 숲에 울려퍼지는 몬스터들의 진격',
    description: '구불구불한 숲속 오솔길을 따라 몬스터들이 침공해옵니다. 초보 지휘관에게 적합한 지형입니다.',
    difficulty: '쉬움',
    theme: 'forest',
    startingGold: 350,
    startingLives: 20,
    paths: [
      [
        { x: -30, y: 150 },
        { x: 220, y: 150 },
        { x: 220, y: 390 },
        { x: 480, y: 390 },
        { x: 480, y: 160 },
        { x: 740, y: 160 },
        { x: 740, y: 380 },
        { x: 990, y: 380 },
      ],
    ],
    placementSlots: [
      // Top bend
      { id: 'f_s1', x: 130, y: 90, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s2', x: 130, y: 220, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s3', x: 300, y: 220, occupiedGuardianId: null, terrainBonus: 'damage' }, // Strategic loop center
      { id: 'f_s4', x: 300, y: 320, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s5', x: 380, y: 460, occupiedGuardianId: null, terrainBonus: 'none' },
      // Middle hill
      { id: 'f_s6', x: 400, y: 280, occupiedGuardianId: null, terrainBonus: 'range' },
      { id: 'f_s7', x: 560, y: 270, occupiedGuardianId: null, terrainBonus: 'speed' },
      { id: 'f_s8', x: 560, y: 90, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s9', x: 650, y: 90, occupiedGuardianId: null, terrainBonus: 'damage' },
      // Final bend
      { id: 'f_s10', x: 660, y: 250, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s11', x: 660, y: 440, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s12', x: 820, y: 280, occupiedGuardianId: null, terrainBonus: 'range' },
      { id: 'f_s13', x: 820, y: 450, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s14', x: 880, y: 310, occupiedGuardianId: null, terrainBonus: 'none' },
    ],
    waves: generateWaves('forest', 15),
  },
  {
    id: 'stage_canyon',
    name: '망령의 사막 협곡',
    subtitle: '두 갈래 길에서 동시에 쏟아지는 습격',
    description: '사막의 모래바람 속에서 북쪽과 남쪽 두 방향에서 몬스터들이 합류 지점으로 쇄도합니다.',
    difficulty: '보통',
    theme: 'canyon',
    startingGold: 420,
    startingLives: 20,
    paths: [
      // North entry
      [
        { x: -30, y: 110 },
        { x: 300, y: 110 },
        { x: 450, y: 260 },
        { x: 650, y: 260 },
        { x: 780, y: 150 },
        { x: 990, y: 150 },
      ],
      // South entry
      [
        { x: -30, y: 430 },
        { x: 300, y: 430 },
        { x: 450, y: 280 },
        { x: 650, y: 280 },
        { x: 780, y: 390 },
        { x: 990, y: 390 },
      ],
    ],
    placementSlots: [
      { id: 'c_s1', x: 160, y: 180, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'c_s2', x: 160, y: 360, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'c_s3', x: 360, y: 180, occupiedGuardianId: null, terrainBonus: 'range' },
      { id: 'c_s4', x: 360, y: 360, occupiedGuardianId: null, terrainBonus: 'range' },
      // Central choke point
      { id: 'c_s5', x: 520, y: 190, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'c_s6', x: 550, y: 350, occupiedGuardianId: null, terrainBonus: 'speed' },
      { id: 'c_s7', x: 630, y: 190, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'c_s8', x: 720, y: 70, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'c_s9', x: 720, y: 470, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'c_s10', x: 860, y: 230, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'c_s11', x: 860, y: 310, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'c_s12', x: 450, y: 70, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'c_s13', x: 450, y: 470, occupiedGuardianId: null, terrainBonus: 'none' },
    ],
    waves: generateWaves('canyon', 20),
  },
  {
    id: 'stage_citadel',
    name: '용암 성채의 관문',
    subtitle: '파멸의 고룡이 군림하는 최후의 결전지',
    description: '끓어오르는 마그마 지대. 강력한 몬스터들과 전설의 파멸 고룡을 저지해야 합니다.',
    difficulty: '어려움',
    theme: 'citadel',
    startingGold: 500,
    startingLives: 25,
    paths: [
      [
        { x: -30, y: 270 },
        { x: 180, y: 270 },
        { x: 260, y: 130 },
        { x: 500, y: 130 },
        { x: 580, y: 270 },
        { x: 720, y: 410 },
        { x: 850, y: 270 },
        { x: 990, y: 270 },
      ],
      [
        { x: 260, y: -30 },
        { x: 260, y: 130 },
        { x: 400, y: 390 },
        { x: 720, y: 390 },
        { x: 850, y: 270 },
        { x: 990, y: 270 },
      ],
    ],
    placementSlots: [
      { id: 'v_s1', x: 120, y: 170, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'v_s2', x: 120, y: 370, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'v_s3', x: 380, y: 60, occupiedGuardianId: null, terrainBonus: 'range' },
      { id: 'v_s4', x: 370, y: 230, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'v_s5', x: 490, y: 230, occupiedGuardianId: null, terrainBonus: 'speed' },
      { id: 'v_s6', x: 490, y: 470, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'v_s7', x: 630, y: 170, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'v_s8', x: 630, y: 470, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'v_s9', x: 780, y: 180, occupiedGuardianId: null, terrainBonus: 'range' },
      { id: 'v_s10', x: 780, y: 480, occupiedGuardianId: null, terrainBonus: 'speed' },
      { id: 'v_s11', x: 870, y: 160, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'v_s12', x: 870, y: 380, occupiedGuardianId: null, terrainBonus: 'none' },
    ],
    waves: generateWaves('citadel', 25),
  },
];
