/**
 * 킹덤 디펜스: 판타지 가디언즈 (Kingdom Defense: Fantasy Guardians)
 * Vanilla JavaScript (ES6+) Implementation for GitHub Pages
 */

// ==========================================
// 1. DATA DEFINITIONS
// ==========================================

const GUARDIAN_TYPES = {
  paladin: {
    id: 'paladin',
    name: '성기사 발두르',
    title: '신의 방패',
    role: 'melee',
    roleLabel: '근접 수호',
    description: '근접 범위에 있는 적들에게 신성 피해를 입히며 주변 아군 유닛의 공격력을 증가시킵니다.',
    cost: 100,
    damageType: 'holy',
    baseDamage: 45,
    baseRange: 105,
    baseAttackSpeed: 1.2,
    color: '#fbbf24',
    accentColor: '#f59e0b',
    specialAbility: '각성: 주변 모든 아군 공격력 +25% 오라 및 3인 동시 타격',
    canTargetAir: false,
    upgradeCostFactor: 1.5,
  },
  archer: {
    id: 'archer',
    name: '엘프 궁수 실바나',
    title: '바람의 저격수',
    role: 'sniper',
    roleLabel: '단일 저격',
    description: '가장 긴 사거리와 빠른 연사력으로 지상 및 공중의 적을 저격합니다. 치명타 확률이 높습니다.',
    cost: 85,
    damageType: 'physical',
    baseDamage: 32,
    baseRange: 185,
    baseAttackSpeed: 2.0,
    color: '#34d399',
    accentColor: '#059669',
    specialAbility: '각성: 3점사 연발 사격 및 치명타 피해량 250%',
    canTargetAir: true,
    upgradeCostFactor: 1.45,
  },
  mage: {
    id: 'mage',
    name: '대마법사 이그니스',
    title: '화염의 지배자',
    role: 'aoe_mage',
    roleLabel: '광역 화염',
    description: '강력한 화염구를 투척하여 목표 지점 반경의 적들에게 폭발 광역 피해와 화상 화염을 남깁니다.',
    cost: 130,
    damageType: 'fire',
    baseDamage: 75,
    baseRange: 145,
    baseAttackSpeed: 0.85,
    color: '#f87171',
    accentColor: '#dc2626',
    specialAbility: '각성: 폭발 반경 60% 확장 및 4초간 불타는 대지 형성',
    canTargetAir: true,
    upgradeCostFactor: 1.6,
  },
  frost: {
    id: 'frost',
    name: '빙결 드루이드 엘레나',
    title: '서리의 요정',
    role: 'crowd_control',
    roleLabel: '군중 제어',
    description: '냉기 탄환을 날려 적들의 이동 속도를 대폭 감소시키며 받는 마법 피해를 증폭시킵니다.',
    cost: 110,
    damageType: 'frost',
    baseDamage: 28,
    baseRange: 135,
    baseAttackSpeed: 1.4,
    color: '#38bdf8',
    accentColor: '#0284c7',
    specialAbility: '각성: 적들을 1.5초간 완전 결빙시키는 서리 파동 방출',
    canTargetAir: true,
    upgradeCostFactor: 1.5,
  },
  assassin: {
    id: 'assassin',
    name: '그림자 암살자 섀도우',
    title: '칠흑의 비수',
    role: 'assassin',
    roleLabel: '방어 관통',
    description: '적의 방어력을 관통하는 맹독 단검을 난사하며 지속적인 독 피해를 중첩시킵니다. 보스 킬러!',
    cost: 155,
    damageType: 'poison',
    baseDamage: 55,
    baseRange: 125,
    baseAttackSpeed: 1.8,
    color: '#a855f7',
    accentColor: '#7e22ce',
    specialAbility: '각성: 체력 30% 이하 일반 적 즉사 및 독 4중첩 폭발',
    canTargetAir: false,
    upgradeCostFactor: 1.65,
  },
  dragon: {
    id: 'dragon',
    name: '고대 비룡 아그나',
    title: '붉은 용족 군주',
    role: 'legendary',
    roleLabel: '전설 비룡',
    description: '최상위 전설 가디언. 부채꼴 전방에 궤적 관통 화염 브레스를 지속 방출하여 적들을 녹입니다.',
    cost: 260,
    damageType: 'fire',
    baseDamage: 115,
    baseRange: 160,
    baseAttackSpeed: 1.1,
    color: '#fb923c',
    accentColor: '#ea580c',
    specialAbility: '각성: 지옥 용암탄 주기적 투하 및 방어력 50% 관통',
    canTargetAir: true,
    upgradeCostFactor: 1.8,
  },
};

function getGuardianStats(typeId, level) {
  const base = GUARDIAN_TYPES[typeId];
  if (!base) return null;
  const dmgMultiplier = 1 + (level - 1) * 0.45;
  const rangeMultiplier = 1 + (level - 1) * 0.12;
  const speedMultiplier = 1 + (level - 1) * 0.15;

  return {
    damage: Math.round(base.baseDamage * dmgMultiplier),
    range: Math.round(base.baseRange * rangeMultiplier),
    attackSpeed: parseFloat((base.baseAttackSpeed * speedMultiplier).toFixed(2)),
    dps: Math.round(base.baseDamage * dmgMultiplier * base.baseAttackSpeed * speedMultiplier),
    isAwakened: level >= 3,
  };
}

function getUpgradeCost(typeId, currentLevel) {
  const base = GUARDIAN_TYPES[typeId];
  if (!base) return 999;
  return Math.round(base.cost * Math.pow(base.upgradeCostFactor, currentLevel));
}

function getSellRefund(typeId, currentLevel) {
  const base = GUARDIAN_TYPES[typeId];
  if (!base) return 0;
  let totalInvested = base.cost;
  for (let l = 1; l < currentLevel; l++) {
    totalInvested += getUpgradeCost(typeId, l);
  }
  return Math.floor(totalInvested * 0.7);
}

const ENEMY_TYPES = {
  goblin: {
    id: 'goblin',
    name: '고블린 정찰병',
    description: '작고 매우 민첩한 몬스터. 무리를 지어 빠르게 방어선을 돌파하려 합니다.',
    baseHp: 65,
    speed: 105,
    armor: 0.05,
    magicResist: 0.0,
    goldReward: 12,
    scoreReward: 50,
    isAir: false,
    isBoss: false,
    size: 14,
    color: '#84cc16',
    secondaryColor: '#4d7c0f',
  },
  orc: {
    id: 'orc',
    name: '오크 전사',
    description: '단단한 가죽과 높은 체력을 지닌 오크 군단의 주력 보병입니다.',
    baseHp: 160,
    speed: 70,
    armor: 0.25,
    magicResist: 0.05,
    goldReward: 20,
    scoreReward: 90,
    isAir: false,
    isBoss: false,
    size: 19,
    color: '#15803d',
    secondaryColor: '#14532d',
    specialTrait: '물리 방어력 25%',
  },
  harpy: {
    id: 'harpy',
    name: '하피 습격자',
    description: '날개를 펼쳐 비행하는 몬스터. 지상 전용 근접 공격을 받지 않습니다.',
    baseHp: 110,
    speed: 90,
    armor: 0.05,
    magicResist: 0.15,
    goldReward: 24,
    scoreReward: 120,
    isAir: true,
    isBoss: false,
    size: 16,
    color: '#06b6d4',
    secondaryColor: '#0891b2',
    specialTrait: '비행 (근접 공격 면역)',
  },
  shaman: {
    id: 'shaman',
    name: '어둠의 샤먼',
    description: '사악한 주문을 외워 주변 아군 몬스터들의 체력을 주기적으로 치유합니다.',
    baseHp: 220,
    speed: 60,
    armor: 0.1,
    magicResist: 0.35,
    goldReward: 35,
    scoreReward: 180,
    isAir: false,
    isBoss: false,
    size: 18,
    color: '#a21caf',
    secondaryColor: '#701a75',
    specialTrait: '주변 몬스터 치유 오라',
  },
  undead_knight: {
    id: 'undead_knight',
    name: '언데드 흑기사',
    description: '저주받은 중갑옷을 두른 기사. 높은 물리 방어력과 마법 저항을 지닙니다.',
    baseHp: 380,
    speed: 55,
    armor: 0.4,
    magicResist: 0.25,
    goldReward: 45,
    scoreReward: 240,
    isAir: false,
    isBoss: false,
    size: 21,
    color: '#475569',
    secondaryColor: '#1e293b',
    specialTrait: '철벽 갑옷 (방어력 40%)',
  },
  golem: {
    id: 'golem',
    name: '고대 화강암 골렘',
    description: '엄청난 맷집을 가진 바위 거인. 느리지만 거의 모든 타격을 흡수합니다.',
    baseHp: 850,
    speed: 40,
    armor: 0.45,
    magicResist: 0.4,
    goldReward: 80,
    scoreReward: 450,
    isAir: false,
    isBoss: false,
    size: 26,
    color: '#78716c',
    secondaryColor: '#44403c',
    specialTrait: '초고체력 및 슬로우 저항',
  },
  demon_boss: {
    id: 'demon_boss',
    name: '지옥 군주 말가니스',
    description: '중간 관문을 부수러 온 화염의 대악마. 체력이 반 이하로 떨어지면 폭주합니다.',
    baseHp: 2800,
    speed: 50,
    armor: 0.3,
    magicResist: 0.3,
    goldReward: 250,
    scoreReward: 1500,
    isAir: false,
    isBoss: true,
    size: 32,
    color: '#b91c1c',
    secondaryColor: '#450a0a',
    specialTrait: '보스: 폭주 모드 & 광역 화염 오라',
  },
  dragon_boss: {
    id: 'dragon_boss',
    name: '파멸의 고룡 데스윙그',
    description: '왕국을 잿더미로 만들려는 최종 파멸의 고룡. 지상과 공중을 압도하는 보스!',
    baseHp: 6500,
    speed: 45,
    armor: 0.35,
    magicResist: 0.35,
    goldReward: 500,
    scoreReward: 4000,
    isAir: true,
    isBoss: true,
    size: 38,
    color: '#7f1d1d',
    secondaryColor: '#f59e0b',
    specialTrait: '최종 보스: 비행 & 광폭화 보호막',
  },
};

function generateWaves(theme, totalWaves) {
  const waves = [];
  for (let w = 1; w <= totalWaves; w++) {
    const bonusGold = 40 + w * 12;

    if (w === totalWaves) {
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

    if (w <= 3) {
      waves.push({
        waveNumber: w,
        isBossWave: false,
        totalEnemies: 8 + w * 2,
        bonusGoldReward: bonusGold,
        spawns: [{ enemyTypeId: 'goblin', count: 8 + w * 2, intervalSeconds: 1.8 - w * 0.1, delaySeconds: 1 }],
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

const STAGES = [
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
      { id: 'f_s1', x: 130, y: 90, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s2', x: 130, y: 220, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s3', x: 300, y: 220, occupiedGuardianId: null, terrainBonus: 'damage' },
      { id: 'f_s4', x: 300, y: 320, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s5', x: 380, y: 460, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s6', x: 400, y: 280, occupiedGuardianId: null, terrainBonus: 'range' },
      { id: 'f_s7', x: 560, y: 270, occupiedGuardianId: null, terrainBonus: 'speed' },
      { id: 'f_s8', x: 560, y: 90, occupiedGuardianId: null, terrainBonus: 'none' },
      { id: 'f_s9', x: 650, y: 90, occupiedGuardianId: null, terrainBonus: 'damage' },
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
      [
        { x: -30, y: 110 },
        { x: 300, y: 110 },
        { x: 450, y: 260 },
        { x: 650, y: 260 },
        { x: 780, y: 150 },
        { x: 990, y: 150 },
      ],
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

const COMMANDER_SPELLS = [
  {
    id: 'meteor',
    name: '메테오 스트라이크',
    description: '목표 지점에 불타는 운석을 낙하시켜 반경 120 내의 모든 적에게 450의 화염 피해를 입힙니다.',
    cooldown: 35,
    currentCooldown: 0,
    cost: 0,
    icon: 'flame',
    radius: 120,
    targetType: 'ground',
  },
  {
    id: 'blizzard',
    name: '혹한의 눈보라',
    description: '전장 전체를 얼어붙게 만들어 모든 적을 4초간 완전히 결빙시키고 120의 냉기 피해를 줍니다.',
    cooldown: 40,
    currentCooldown: 0,
    cost: 0,
    icon: 'snowflake',
    radius: 9999,
    targetType: 'global',
  },
  {
    id: 'rally',
    name: '승전의 포효',
    description: '모든 수호자 영웅들에게 전술적 투지를 부여하여 7초 동안 공격 속도를 60% 대폭 상승시킵니다.',
    cooldown: 25,
    currentCooldown: 0,
    cost: 0,
    icon: 'swords',
    radius: 0,
    targetType: 'instant',
  },
  {
    id: 'gold_rush',
    name: '마이다스의 축복',
    description: '황금빛 축복을 받아 즉시 120 골드를 수급하고, 다음 10초간 적 처치 시 골드 획득량이 2배가 됩니다.',
    cooldown: 45,
    currentCooldown: 0,
    cost: 0,
    icon: 'coins',
    radius: 0,
    targetType: 'instant',
  },
];

// ==========================================
// 2. AUDIO SYNTHESIZER ENGINE
// ==========================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmInterval = null;
    this.isBgmPlaying = false;
    try {
      const saved = localStorage.getItem('kd_sound_muted');
      if (saved !== null) this.isMuted = saved === 'true';
    } catch (e) {}
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    try {
      localStorage.setItem('kd_sound_muted', String(muted));
    } catch (e) {}
    if (muted && this.isBgmPlaying) this.stopBgm();
  }

  playArrow() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playFireball() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.28);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  playFrost() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [1200, 1800, 2400].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + idx * 0.03 + 0.18);
      gain.gain.setValueAtTime(0.08, t + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.03);
      osc.stop(t + idx * 0.03 + 0.2);
    });
  }

  playHolySmite() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.25);
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, t);
    subOsc.frequency.exponentialRampToValueAtTime(65, t + 0.3);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 0.3);
    subOsc.stop(t + 0.3);
  }

  playPoison() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playDragonBreath() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.4);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  playPlaceTower() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  playUpgrade() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [440, 554, 659, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.18, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.2);
    });
  }

  playSell() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(600, t + 0.06);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.07);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playMeteor() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(100, t + 0.1);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.7);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    subOsc.start(t + 0.1);
    osc.stop(t + 0.5);
    subOsc.stop(t + 0.7);
  }

  playBlizzard() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [600, 850, 1100, 1500].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      osc.frequency.linearRampToValueAtTime(freq * 1.3, t + idx * 0.06 + 0.4);
      gain.gain.setValueAtTime(0.15, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.45);
    });
  }

  playLifeLost() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playBossAlarm() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [150, 180, 220].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);
      gain.gain.setValueAtTime(0.28, t + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 0.35);
    });
  }

  playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.16);
      gain.gain.setValueAtTime(0.25, t + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.16 + (i === 3 ? 0.8 : 0.2));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.16);
      osc.stop(t + i * 0.16 + (i === 3 ? 0.8 : 0.2));
    });
  }

  playDefeat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const melody = [392.0, 369.99, 329.63, 293.66];
    melody.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.2);
      gain.gain.setValueAtTime(0.2, t + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.35);
    });
  }

  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.isBgmPlaying;
  }

  startBgm() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initCtx();
    this.isBgmPlaying = true;
    const chordNotes = [
      [220, 261.63, 329.63, 440],
      [196, 246.94, 293.66, 392],
      [174.61, 220, 261.63, 349.23],
      [196, 246.94, 293.66, 392],
    ];
    let chordIdx = 0;
    const playChordStep = () => {
      if (!this.isBgmPlaying || !this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const chord = chordNotes[chordIdx % chordNotes.length];
      chordIdx++;
      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.025, t + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.045, t + i * 0.08 + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 2.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 2.8);
      });
    };
    playChordStep();
    this.bgmInterval = window.setInterval(playChordStep, 3200);
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

const soundEngine = new SoundEngine();

// ==========================================
// 3. CANVAS RENDERER
// ==========================================

class CanvasRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  renderBackground(stage, time) {
    const ctx = this.ctx;
    if (stage.theme === 'forest') {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#14281d');
      grad.addColorStop(0.5, '#193325');
      grad.addColorStop(1, '#0f2017');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
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
      ctx.fillStyle = 'rgba(217, 119, 6, 0.05)';
      for (let i = 0; i < 35; i++) {
        const x = (i * 81) % this.width;
        const y = (i * 103) % this.height;
        ctx.beginPath();
        ctx.ellipse(x, y, 35, 12, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#1c1015');
      grad.addColorStop(0.5, '#261217');
      grad.addColorStop(1, '#150a0d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
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

  renderPaths(stage, time) {
    const ctx = this.ctx;
    stage.paths.forEach((path) => {
      if (path.length < 2) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.lineWidth = 50;
      ctx.strokeStyle = stage.theme === 'forest' ? '#09150e' : stage.theme === 'canyon' ? '#180d08' : '#0a0507';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();

      ctx.lineWidth = 42;
      ctx.strokeStyle = stage.theme === 'forest' ? '#3e372a' : stage.theme === 'canyon' ? '#5a3d28' : '#2d2427';
      ctx.stroke();

      ctx.lineWidth = 34;
      ctx.strokeStyle = stage.theme === 'forest' ? '#4b4334' : stage.theme === 'canyon' ? '#6e4c33' : '#3a2e33';
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.setLineDash([8, 14]);
      ctx.lineDashOffset = -time * 25;
      ctx.strokeStyle =
        stage.theme === 'forest'
          ? 'rgba(167, 243, 208, 0.25)'
          : stage.theme === 'canyon'
          ? 'rgba(253, 230, 138, 0.25)'
          : 'rgba(252, 165, 165, 0.3)';
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
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 14, time * 2, time * 2 + Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();

      // Castle Gate
      const end = path[path.length - 1];
      const endX = end.x > this.width ? this.width - 20 : end.x;
      const endY = end.y > this.height ? this.height - 20 : end.y;
      ctx.save();
      ctx.translate(endX, endY);
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
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

  renderSlots(slots, hoveredSlotId, selectedGuardianId, isPlacementMode) {
    const ctx = this.ctx;
    slots.forEach((slot) => {
      const isOccupied = slot.occupiedGuardianId !== null;
      const isHovered = slot.id === hoveredSlotId;
      const isSelected = slot.occupiedGuardianId === selectedGuardianId;

      ctx.save();
      ctx.translate(slot.x, slot.y);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);

      if (isOccupied) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
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

        ctx.strokeStyle = isHovered ? '#4ade80' : 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.stroke();
      }

      if (slot.terrainBonus && slot.terrainBonus !== 'none') {
        ctx.beginPath();
        ctx.arc(14, -14, 8, 0, Math.PI * 2);
        ctx.fillStyle = slot.terrainBonus === 'damage' ? '#ef4444' : slot.terrainBonus === 'range' ? '#3b82f6' : '#eab308';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(slot.terrainBonus === 'damage' ? '공' : slot.terrainBonus === 'range' ? '사' : '속', 14, -14);
      }
      ctx.restore();
    });
  }

  renderGuardians(guardians, selectedGuardianId, time) {
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

      this.drawGuardianFigure(guardian, type, time);

      // Level Badge
      ctx.save();
      ctx.translate(0, 18);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-16, -7, 32, 14, 4);
      else ctx.rect(-16, -7, 32, 14);
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

  drawGuardianFigure(guardian, type, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(guardian.angle);

    if (type.id === 'paladin') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-14, -8, 5, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -8, 5, 16);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(8, -4, 10, 8);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(14, -7, 6, 14);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.id === 'archer') {
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(10, 0, 12, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.id === 'mage') {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, -12);
      ctx.lineTo(14, 12);
      ctx.stroke();
      const orbBob = Math.sin(time * 6) * 2;
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(12, -12 + orbBob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (type.id === 'frost') {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        const shardAngle = time * 3 + (i * Math.PI * 2) / 3;
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(Math.cos(shardAngle) * 14, Math.sin(shardAngle) * 14, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type.id === 'assassin') {
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(15, -4);
      ctx.moveTo(6, 8);
      ctx.lineTo(15, 4);
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(4, -3, 2, 2);
      ctx.fillRect(4, 1, 2, 2);
    } else if (type.id === 'dragon') {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(10, -2, 2, 0, Math.PI * 2);
      ctx.arc(10, 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderEnemies(enemies, time) {
    const ctx = this.ctx;
    enemies.forEach((enemy) => {
      const type = ENEMY_TYPES[enemy.typeId];
      if (!type) return;

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      if (enemy.isAir) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 16, enemy.size * 0.8, enemy.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.translate(0, -12);
      }

      this.drawEnemyFigure(enemy, type, time);

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

      const barWidth = Math.max(28, enemy.size * 1.8);
      const barHeight = enemy.isBoss ? 6 : 4;
      const barY = -enemy.size - 10;
      const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
      ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(-barWidth / 2, barY, barWidth * hpRatio, barHeight);
      ctx.strokeStyle = enemy.isBoss ? '#f59e0b' : 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);

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

  drawEnemyFigure(enemy, type, time) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(enemy.angle);

    if (type.id === 'goblin') {
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = type.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(-4, -enemy.size);
      ctx.lineTo(0, -enemy.size - 6);
      ctx.lineTo(4, -enemy.size);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, -3, 3, 2);
      ctx.fillRect(4, 1, 3, 2);
    } else if (type.id === 'orc') {
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-enemy.size * 0.6, -enemy.size * 0.8, enemy.size * 1.2, 5);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-8, -enemy.size * 0.7);
      ctx.lineTo(-14, -enemy.size * 1.2);
      ctx.lineTo(-4, -enemy.size * 0.7);
      ctx.fill();
    } else if (type.id === 'harpy') {
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, enemy.size, enemy.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(5, -4, 3, 3);
      ctx.fillRect(5, 2, 3, 3);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-enemy.size * 0.8, -enemy.size * 0.5, 6, enemy.size);
    } else if (type.id === 'golem') {
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (type.id === 'dragon_boss') {
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(0, 0, enemy.size, enemy.size * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fillRect(enemy.size * 0.6, -4, 4, 3);
      ctx.fillRect(enemy.size * 0.6, 2, 4, 3);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  renderProjectiles(projectiles) {
    const ctx = this.ctx;
    projectiles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.damageType === 'physical') {
        const angle = Math.atan2(p.targetLastY - p.y, p.targetLastX - p.x);
        ctx.rotate(angle);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-10, -2, 4, 4);
      } else if (p.damageType === 'fire') {
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
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  renderParticles(particles) {
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

  renderFloatingTexts(texts) {
    const ctx = this.ctx;
    texts.forEach((t) => {
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${t.size}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }
}

// ==========================================
// 4. MAIN GAME ENGINE & STATE CONTROLLER
// ==========================================

const VIRTUAL_WIDTH = 960;
const VIRTUAL_HEIGHT = 540;

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.renderer = new CanvasRenderer(this.ctx, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Game state
    this.currentStage = STAGES[0];
    this.lives = this.currentStage.startingLives;
    this.gold = this.currentStage.startingGold;
    this.score = 0;
    this.kills = 0;
    this.currentWaveIndex = 1;
    this.isWaveInProgress = false;
    this.waveCountdown = 6;
    this.gameSpeed = 1;
    this.isPaused = false;

    // Selections
    this.selectedSummonTypeId = null;
    this.selectedGuardianId = null;
    this.hoveredSlotId = null;
    this.activeSpellId = null;

    // Spells
    this.spells = JSON.parse(JSON.stringify(COMMANDER_SPELLS));
    this.goldRushActiveUntil = 0;
    this.rallyActiveUntil = 0;

    // Entities
    this.guardians = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.slots = this.currentStage.placementSlots.map((s) => ({ ...s, occupiedGuardianId: null }));

    this.waveTracker = { spawnQueue: [], totalQueued: 0, spawnedCount: 0 };
    this.lastTime = performance.now();
    this.waveElapsed = 0;

    this.initDOM();
    this.initEventListeners();
    this.updateHUD();
    this.renderGuardianDock();
    this.renderSpellsDock();

    requestAnimationFrame(this.loop.bind(this));
  }

  initDOM() {
    this.dom = {
      stageName: document.getElementById('top-stage-name'),
      stageSubtitle: document.getElementById('top-stage-subtitle'),
      livesText: document.getElementById('top-lives-text'),
      livesBox: document.getElementById('top-lives-box'),
      goldText: document.getElementById('top-gold-text'),
      scoreText: document.getElementById('top-score-text'),
      killsText: document.getElementById('top-kills-text'),
      waveTitle: document.getElementById('top-wave-title'),
      waveStatus: document.getElementById('top-wave-status'),
      callWaveBtn: document.getElementById('call-wave-btn'),
      pauseBtn: document.getElementById('pause-btn'),
      muteBtn: document.getElementById('mute-btn'),
      bgmBtn: document.getElementById('bgm-btn'),
      speedBtns: document.querySelectorAll('.speed-btn'),
      pauseOverlay: document.getElementById('pause-overlay'),
      spellTargetBanner: document.getElementById('spell-target-banner'),
      cancelSpellBtn: document.getElementById('cancel-spell-btn'),

      // Inspector
      inspector: document.getElementById('unit-inspector'),
      inspectorName: document.getElementById('insp-name'),
      inspectorTitle: document.getElementById('insp-title'),
      inspectorBadge: document.getElementById('insp-badge'),
      inspectorAvatar: document.getElementById('insp-avatar'),
      inspDmg: document.getElementById('insp-dmg'),
      inspRange: document.getElementById('insp-range'),
      inspSpeed: document.getElementById('insp-speed'),
      inspKills: document.getElementById('insp-kills'),
      inspDamageTotal: document.getElementById('insp-total-dmg'),
      inspAbilityTitle: document.getElementById('insp-ability-title'),
      inspAbilityDesc: document.getElementById('insp-ability-desc'),
      inspUpgradeBtn: document.getElementById('insp-upgrade-btn'),
      inspSellBtn: document.getElementById('insp-sell-btn'),
      priorityBtns: document.querySelectorAll('.priority-btn'),

      // Modals
      bestiaryModal: document.getElementById('bestiary-modal'),
      stageModal: document.getElementById('stage-modal'),
      gameOverModal: document.getElementById('game-over-modal'),
      stageListContainer: document.getElementById('stage-list-container'),
    };
  }

  initEventListeners() {
    // Canvas click & mousemove
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));

    // Top buttons
    this.dom.callWaveBtn.addEventListener('click', () => this.handleCallNextWave());
    this.dom.pauseBtn.addEventListener('click', () => this.togglePause());
    document.getElementById('restart-btn').addEventListener('click', () => this.resetGame(this.currentStage));
    this.dom.muteBtn.addEventListener('click', () => this.toggleMute());
    this.dom.bgmBtn.addEventListener('click', () => this.toggleBgm());

    document.getElementById('stage-btn').addEventListener('click', () => this.openStageModal());
    document.getElementById('bestiary-btn').addEventListener('click', () => this.openBestiaryModal());

    // Speed buttons
    this.dom.speedBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const speed = parseInt(btn.dataset.speed);
        this.gameSpeed = speed;
        this.dom.speedBtns.forEach((b) => {
          if (parseInt(b.dataset.speed) === speed) {
            b.classList.add('bg-amber-500', 'text-slate-950');
            b.classList.remove('text-slate-400');
          } else {
            b.classList.remove('bg-amber-500', 'text-slate-950');
            b.classList.add('text-slate-400');
          }
        });
      });
    });

    // Spell cancel
    this.dom.cancelSpellBtn.addEventListener('click', () => {
      this.activeSpellId = null;
      this.dom.spellTargetBanner.classList.add('hidden');
    });

    // Inspector buttons
    document.getElementById('insp-close-btn').addEventListener('click', () => {
      this.selectedGuardianId = null;
      this.updateInspector();
    });

    this.dom.inspUpgradeBtn.addEventListener('click', () => {
      if (this.selectedGuardianId) this.handleUpgradeGuardian(this.selectedGuardianId);
    });

    this.dom.inspSellBtn.addEventListener('click', () => {
      if (this.selectedGuardianId) this.handleSellGuardian(this.selectedGuardianId);
    });

    this.dom.priorityBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!this.selectedGuardianId) return;
        const g = this.guardians.find((item) => item.id === this.selectedGuardianId);
        if (g) {
          g.targetPriority = btn.dataset.priority;
          this.updateInspector();
        }
      });
    });

    // Bestiary tabs
    document.querySelectorAll('.bestiary-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.bestiary-tab-btn').forEach((b) => {
          b.classList.remove('border-amber-500', 'text-amber-400');
          b.classList.add('border-transparent', 'text-slate-400');
        });
        btn.classList.add('border-amber-500', 'text-amber-400');
        btn.classList.remove('border-transparent', 'text-slate-400');

        document.getElementById('bestiary-tab-guardians').classList.toggle('hidden', tab !== 'guardians');
        document.getElementById('bestiary-tab-enemies').classList.toggle('hidden', tab !== 'enemies');
        document.getElementById('bestiary-tab-tips').classList.toggle('hidden', tab !== 'tips');
      });
    });

    document.getElementById('bestiary-close-btn').addEventListener('click', () => {
      this.dom.bestiaryModal.classList.add('hidden');
    });

    document.getElementById('stage-close-btn').addEventListener('click', () => {
      this.dom.stageModal.classList.add('hidden');
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key >= '1' && e.key <= '6') {
        const types = Object.keys(GUARDIAN_TYPES);
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < types.length) {
          const type = GUARDIAN_TYPES[types[idx]];
          if (this.gold >= type.cost) {
            this.selectedSummonTypeId = this.selectedSummonTypeId === type.id ? null : type.id;
            this.selectedGuardianId = null;
            this.activeSpellId = null;
            this.renderGuardianDock();
            this.updateInspector();
            this.dom.spellTargetBanner.classList.add('hidden');
          }
        }
      } else if (e.key.toLowerCase() === 'q') {
        this.handleActivateSpell('meteor');
      } else if (e.key.toLowerCase() === 'w') {
        this.handleActivateSpell('blizzard');
      } else if (e.key.toLowerCase() === 'e') {
        this.handleActivateSpell('rally');
      } else if (e.key.toLowerCase() === 'r') {
        this.handleActivateSpell('gold_rush');
      } else if (e.key === ' ') {
        e.preventDefault();
        this.togglePause();
      } else if (e.key === 'Escape') {
        this.selectedSummonTypeId = null;
        this.selectedGuardianId = null;
        this.activeSpellId = null;
        this.renderGuardianDock();
        this.updateInspector();
        this.dom.spellTargetBanner.classList.add('hidden');
      }
    });

    // Populate Bestiary content
    this.populateBestiary();
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  handleCanvasClick(e) {
    const coords = this.getCanvasCoords(e);

    // 1. Spell target
    if (this.activeSpellId) {
      this.executeGroundSpell(this.activeSpellId, coords.x, coords.y);
      return;
    }

    // 2. Click on placement slot
    const clickedSlot = this.slots.find((s) => Math.hypot(s.x - coords.x, s.y - coords.y) <= 24);
    if (clickedSlot) {
      if (clickedSlot.occupiedGuardianId) {
        this.selectedGuardianId = clickedSlot.occupiedGuardianId;
        this.selectedSummonTypeId = null;
        this.renderGuardianDock();
        this.updateInspector();
        return;
      } else if (this.selectedSummonTypeId) {
        this.handlePlaceGuardian(clickedSlot.id);
        return;
      }
    }

    // 3. Click on placed guardian
    const clickedGuardian = this.guardians.find((g) => Math.hypot(g.x - coords.x, g.y - coords.y) <= 24);
    if (clickedGuardian) {
      this.selectedGuardianId = clickedGuardian.id;
      this.selectedSummonTypeId = null;
      this.renderGuardianDock();
      this.updateInspector();
      return;
    }

    // Deselect
    this.selectedGuardianId = null;
    this.updateInspector();
  }

  handleCanvasMouseMove(e) {
    const coords = this.getCanvasCoords(e);
    const hoveredSlot = this.slots.find((s) => Math.hypot(s.x - coords.x, s.y - coords.y) <= 24);
    this.hoveredSlotId = hoveredSlot ? hoveredSlot.id : null;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.dom.pauseOverlay.classList.toggle('hidden', !this.isPaused);
    this.dom.pauseBtn.innerHTML = this.isPaused
      ? `<i data-lucide="play" class="w-4 h-4 fill-current text-amber-400"></i>`
      : `<i data-lucide="pause" class="w-4 h-4 text-slate-300"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }

  toggleMute() {
    const next = !soundEngine.isMuted;
    soundEngine.setMuted(next);
    this.dom.muteBtn.innerHTML = next
      ? `<i data-lucide="volume-x" class="w-4 h-4 text-slate-500"></i>`
      : `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }

  toggleBgm() {
    const active = soundEngine.toggleBgm();
    this.dom.bgmBtn.classList.toggle('border-indigo-500', active);
    this.dom.bgmBtn.classList.toggle('bg-indigo-950/60', active);
    this.dom.bgmBtn.classList.toggle('text-indigo-300', active);
  }

  resetGame(stage) {
    this.currentStage = stage;
    this.lives = stage.startingLives;
    this.gold = stage.startingGold;
    this.score = 0;
    this.kills = 0;
    this.currentWaveIndex = 1;
    this.isWaveInProgress = false;
    this.waveCountdown = 6;
    this.selectedSummonTypeId = null;
    this.selectedGuardianId = null;
    this.activeSpellId = null;

    this.guardians = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.slots = stage.placementSlots.map((s) => ({ ...s, occupiedGuardianId: null }));
    this.spells = JSON.parse(JSON.stringify(COMMANDER_SPELLS));
    this.goldRushActiveUntil = 0;
    this.rallyActiveUntil = 0;

    this.dom.gameOverModal.classList.add('hidden');
    this.dom.spellTargetBanner.classList.add('hidden');

    this.updateHUD();
    this.renderGuardianDock();
    this.renderSpellsDock();
    this.updateInspector();
  }

  startWave(waveNum) {
    const stage = this.currentStage;
    const wave = stage.waves.find((w) => w.waveNumber === waveNum);
    if (!wave) return;

    if (wave.isBossWave) {
      soundEngine.playBossAlarm();
      this.floatingTexts.push({
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

    const queue = [];
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

    queue.sort((a, b) => a.spawnTime - b.spawnTime);
    this.waveTracker = {
      spawnQueue: queue,
      totalQueued: queue.length,
      spawnedCount: 0,
    };
    this.isWaveInProgress = true;
    this.waveCountdown = 0;
    this.waveElapsed = 0;
    this.updateHUD();
  }

  handleCallNextWave() {
    if (this.isWaveInProgress || this.currentWaveIndex > this.currentStage.waves.length) return;
    const bonusEarlyGold = 25;
    this.gold += bonusEarlyGold;
    soundEngine.playCoin();
    this.floatingTexts.push({
      id: Math.random().toString(),
      x: VIRTUAL_WIDTH / 2,
      y: 160,
      text: `즉시 호출 보너스 +${bonusEarlyGold}G`,
      color: '#f59e0b',
      life: 2.0,
      maxLife: 2.0,
      size: 18,
    });
    this.startWave(this.currentWaveIndex);
    this.updateHUD();
  }

  handlePlaceGuardian(slotId) {
    if (!this.selectedSummonTypeId) return;
    const type = GUARDIAN_TYPES[this.selectedSummonTypeId];
    if (!type || this.gold < type.cost) return;

    const slot = this.slots.find((s) => s.id === slotId);
    if (!slot || slot.occupiedGuardianId) return;

    const newGuardian = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      typeId: this.selectedSummonTypeId,
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
    this.guardians.push(newGuardian);
    this.gold -= type.cost;
    soundEngine.playPlaceTower();

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      this.particles.push({
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

    this.selectedSummonTypeId = null;
    this.selectedGuardianId = newGuardian.id;
    this.updateHUD();
    this.renderGuardianDock();
    this.updateInspector();
  }

  handleUpgradeGuardian(guardianId) {
    const guardian = this.guardians.find((g) => g.id === guardianId);
    if (!guardian) return;
    const cost = getUpgradeCost(guardian.typeId, guardian.level);
    if (this.gold < cost || guardian.level >= 5) return;

    this.gold -= cost;
    guardian.level += 1;
    soundEngine.playUpgrade();

    this.floatingTexts.push({
      id: Math.random().toString(),
      x: guardian.x,
      y: guardian.y - 30,
      text: guardian.level === 3 ? '각성 승급!' : `레벨 ${guardian.level} 강화!`,
      color: guardian.level >= 3 ? '#f59e0b' : '#38bdf8',
      life: 1.8,
      maxLife: 1.8,
      size: 16,
    });

    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      this.particles.push({
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

    this.updateHUD();
    this.updateInspector();
  }

  handleSellGuardian(guardianId) {
    const idx = this.guardians.findIndex((g) => g.id === guardianId);
    if (idx === -1) return;
    const guardian = this.guardians[idx];
    const refund = getSellRefund(guardian.typeId, guardian.level);

    const slot = this.slots.find((s) => s.occupiedGuardianId === guardianId);
    if (slot) slot.occupiedGuardianId = null;

    this.guardians.splice(idx, 1);
    this.gold += refund;
    soundEngine.playSell();

    this.floatingTexts.push({
      id: Math.random().toString(),
      x: guardian.x,
      y: guardian.y - 20,
      text: `+${refund}G`,
      color: '#fbbf24',
      life: 1.5,
      maxLife: 1.5,
      size: 14,
    });

    this.selectedGuardianId = null;
    this.updateHUD();
    this.updateInspector();
  }

  handleActivateSpell(spellId) {
    const spell = this.spells.find((s) => s.id === spellId);
    if (!spell || spell.currentCooldown > 0) return;

    if (spell.targetType === 'instant') {
      if (spellId === 'rally') {
        this.rallyActiveUntil = Date.now() + 7000;
        soundEngine.playHolySmite();
        this.floatingTexts.push({
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
        this.gold += 120;
        this.goldRushActiveUntil = Date.now() + 10000;
        soundEngine.playCoin();
        this.floatingTexts.push({
          id: Math.random().toString(),
          x: VIRTUAL_WIDTH / 2,
          y: 180,
          text: '마이다스의 축복: +120G 및 골드 2배!',
          color: '#facc15',
          life: 2.5,
          maxLife: 2.5,
          size: 20,
        });
        this.updateHUD();
      }
      spell.currentCooldown = spell.cooldown;
      this.renderSpellsDock();
    } else if (spell.targetType === 'global') {
      if (spellId === 'blizzard') {
        soundEngine.playBlizzard();
        this.floatingTexts.push({
          id: Math.random().toString(),
          x: VIRTUAL_WIDTH / 2,
          y: 180,
          text: '혹한의 눈보라: 전장 결빙!',
          color: '#38bdf8',
          life: 2.5,
          maxLife: 2.5,
          size: 22,
        });
        this.enemies.forEach((enemy) => {
          enemy.hp -= 120;
          enemy.statusEffects.push({ type: 'freeze', duration: 4.0, value: 1.0 });
          for (let i = 0; i < 8; i++) {
            this.particles.push({
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
      spell.currentCooldown = spell.cooldown;
      this.renderSpellsDock();
    } else {
      this.activeSpellId = spellId;
      this.dom.spellTargetBanner.classList.remove('hidden');
    }
  }

  executeGroundSpell(spellId, x, y) {
    const spell = this.spells.find((s) => s.id === spellId);
    if (!spell) return;

    if (spellId === 'meteor') {
      soundEngine.playMeteor();
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 120;
        this.particles.push({
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
      this.particles.push({
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

      this.enemies.forEach((enemy) => {
        if (Math.hypot(enemy.x - x, enemy.y - y) <= 120) {
          enemy.hp -= 450;
          enemy.statusEffects.push({ type: 'burn', duration: 4, value: 30 });
          this.floatingTexts.push({
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

    spell.currentCooldown = spell.cooldown;
    this.activeSpellId = null;
    this.dom.spellTargetBanner.classList.add('hidden');
    this.renderSpellsDock();
  }

  updateHUD() {
    this.dom.stageName.innerText = this.currentStage.name;
    this.dom.stageSubtitle.innerText = `${this.currentStage.difficulty} · ${this.currentStage.waves.length} 웨이브`;
    this.dom.livesText.innerText = `${this.lives}/${this.currentStage.startingLives}`;
    this.dom.goldText.innerText = `${this.gold.toLocaleString()} G`;
    this.dom.scoreText.innerText = this.score.toLocaleString();
    this.dom.killsText.innerText = this.kills;

    const isLow = this.lives <= 5;
    this.dom.livesBox.classList.toggle('animate-pulse', isLow);
    this.dom.livesBox.classList.toggle('bg-rose-950/60', isLow);
    this.dom.livesBox.classList.toggle('border-rose-600', isLow);

    const isFinal = this.currentWaveIndex >= this.currentStage.waves.length;
    this.dom.waveTitle.innerText = isFinal ? '최종 웨이브' : `웨이브 ${this.currentWaveIndex} / ${this.currentStage.waves.length}`;

    if (this.isWaveInProgress) {
      this.dom.waveStatus.innerHTML = `<span class="text-emerald-400 font-medium animate-pulse">전투 진행 중</span>`;
      this.dom.callWaveBtn.classList.add('hidden');
    } else if (this.waveCountdown > 0) {
      this.dom.waveStatus.innerHTML = `다음 침공까지 <strong class="text-amber-400">${Math.ceil(this.waveCountdown)}초</strong>`;
      this.dom.callWaveBtn.classList.remove('hidden');
    } else {
      this.dom.waveStatus.innerHTML = `대기 중`;
      this.dom.callWaveBtn.classList.remove('hidden');
    }
  }

  renderGuardianDock() {
    const container = document.getElementById('guardian-dock-shelf');
    container.innerHTML = '';

    Object.values(GUARDIAN_TYPES).forEach((unit, idx) => {
      const isSelected = this.selectedSummonTypeId === unit.id;
      const canAfford = this.gold >= unit.cost;

      const card = document.createElement('button');
      card.className = `relative flex flex-col items-center justify-between w-24 h-28 p-2 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 -translate-y-1 shadow-lg'
          : canAfford
          ? 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 hover:border-slate-500 hover:-translate-y-0.5'
          : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
      }`;

      card.innerHTML = `
        <div class="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-950/70 px-1 rounded">${idx + 1}</div>
        <div class="text-[9px] font-medium text-slate-300 mt-0.5">${unit.roleLabel}</div>
        <div class="w-10 h-10 rounded-full flex items-center justify-center my-1 shadow-inner relative transition-transform hover:scale-110"
             style="background-color: ${unit.color}25; border: 2px solid ${unit.color};">
          <div class="w-5 h-5 rounded-full" style="background-color: ${unit.color};"></div>
        </div>
        <div class="text-[11px] font-bold text-slate-200 text-center truncate w-full">${unit.name.split(' ')[0]}</div>
        <div class="flex items-center gap-1 text-[11px] font-bold font-cinzel ${canAfford ? 'text-amber-300' : 'text-rose-400'}">
          <span>${unit.cost}G</span>
        </div>
      `;

      card.addEventListener('click', () => {
        if (isSelected) {
          this.selectedSummonTypeId = null;
        } else if (canAfford) {
          this.selectedSummonTypeId = unit.id;
          this.selectedGuardianId = null;
          this.activeSpellId = null;
          this.dom.spellTargetBanner.classList.add('hidden');
        }
        this.renderGuardianDock();
        this.updateInspector();
      });

      card.addEventListener('mouseenter', (e) => this.showUnitTooltip(unit, e.currentTarget));
      card.addEventListener('mouseleave', () => this.hideUnitTooltip());

      container.appendChild(card);
    });
  }

  showUnitTooltip(unit, targetEl) {
    const tooltip = document.getElementById('unit-dock-tooltip');
    tooltip.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
        <div>
          <div class="font-bold text-slate-100 font-cinzel">${unit.name}</div>
          <div class="text-[10px] text-slate-400">${unit.title}</div>
        </div>
        <div class="text-amber-400 font-bold font-cinzel text-sm">${unit.cost}G</div>
      </div>
      <p class="text-slate-300 text-[11px] leading-relaxed mb-2">${unit.description}</p>
      <div class="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1.5 rounded-lg text-[10px] text-center mb-2">
        <div><div class="text-slate-400">공격력</div><div class="font-bold text-slate-200">${unit.baseDamage}</div></div>
        <div><div class="text-slate-400">사거리</div><div class="font-bold text-slate-200">${unit.baseRange}</div></div>
        <div><div class="text-slate-400">공격속도</div><div class="font-bold text-slate-200">${unit.baseAttackSpeed}/s</div></div>
      </div>
      <div class="text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-900/40 rounded px-2 py-1">${unit.specialAbility}</div>
    `;
    tooltip.classList.remove('hidden');
  }

  hideUnitTooltip() {
    document.getElementById('unit-dock-tooltip').classList.add('hidden');
  }

  renderSpellsDock() {
    const container = document.getElementById('spells-dock-container');
    container.innerHTML = '';
    const hotkeys = ['Q', 'W', 'E', 'R'];

    this.spells.forEach((spell, idx) => {
      const isReady = spell.currentCooldown <= 0;
      const isActive = this.activeSpellId === spell.id;
      const cooldownPct = isReady ? 0 : (spell.currentCooldown / spell.cooldown) * 100;

      const btn = document.createElement('button');
      btn.className = `relative flex items-center justify-center w-12 h-12 rounded-lg border transition-all cursor-pointer overflow-hidden ${
        isActive
          ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400 shadow-md'
          : isReady
          ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 hover:border-slate-500 hover:scale-105'
          : 'bg-slate-900/60 border-slate-800 cursor-not-allowed opacity-60'
      }`;
      btn.title = `${spell.name} (${hotkeys[idx]}): ${spell.description}`;

      btn.innerHTML = `
        ${!isReady ? `<div class="absolute inset-x-0 bottom-0 bg-slate-950/80 transition-all pointer-events-none" style="height: ${cooldownPct}%"></div>` : ''}
        <i data-lucide="${spell.icon}" class="w-5 h-5 z-10 ${
          spell.icon === 'flame'
            ? 'text-rose-400'
            : spell.icon === 'snowflake'
            ? 'text-sky-400'
            : spell.icon === 'swords'
            ? 'text-amber-400'
            : 'text-yellow-300'
        }"></i>
        <span class="absolute top-1 left-1.5 text-[8px] font-mono font-bold text-slate-400 bg-slate-950/80 px-1 rounded z-10">${hotkeys[idx]}</span>
        ${!isReady ? `<span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-100 z-10">${Math.ceil(spell.currentCooldown)}s</span>` : ''}
      `;

      btn.addEventListener('click', () => {
        if (isActive) {
          this.activeSpellId = null;
          this.dom.spellTargetBanner.classList.add('hidden');
        } else if (isReady) {
          this.handleActivateSpell(spell.id);
        }
      });

      container.appendChild(btn);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  updateInspector() {
    if (!this.selectedGuardianId) {
      this.dom.inspector.classList.add('hidden');
      return;
    }
    const g = this.guardians.find((item) => item.id === this.selectedGuardianId);
    if (!g) {
      this.dom.inspector.classList.add('hidden');
      return;
    }
    const type = GUARDIAN_TYPES[g.typeId];
    if (!type) return;

    const stats = getGuardianStats(g.typeId, g.level);
    const nextStats = getGuardianStats(g.typeId, g.level + 1);
    const upgradeCost = getUpgradeCost(g.typeId, g.level);
    const refund = getSellRefund(g.typeId, g.level);
    const canAfford = this.gold >= upgradeCost && g.level < 5;

    this.dom.inspector.classList.remove('hidden');
    this.dom.inspectorName.innerText = type.name;
    this.dom.inspectorTitle.innerText = type.title;
    this.dom.inspectorBadge.innerText = `Lv.${g.level}`;
    this.dom.inspectorAvatar.style.backgroundColor = `${type.color}30`;
    this.dom.inspectorAvatar.style.border = `2px solid ${type.color}`;
    this.dom.inspectorAvatar.querySelector('div').style.backgroundColor = type.color;

    this.dom.inspDmg.innerText = `${stats.damage} (${stats.dps}/s)`;
    this.dom.inspRange.innerText = `${stats.range} px`;
    this.dom.inspSpeed.innerText = `${stats.attackSpeed}/s`;
    this.dom.inspKills.innerText = `${g.kills} 회`;
    this.dom.inspDamageTotal.innerText = Math.round(g.damageDealt).toLocaleString();

    this.dom.inspAbilityTitle.innerText = g.level >= 3 ? '각성 스킬 활성화' : '각성 스킬 (Lv.3 달성 시)';
    this.dom.inspAbilityDesc.innerText = type.specialAbility;

    this.dom.priorityBtns.forEach((btn) => {
      const isCur = btn.dataset.priority === g.targetPriority;
      btn.classList.toggle('bg-amber-500', isCur);
      btn.classList.toggle('text-slate-950', isCur);
      btn.classList.toggle('bg-slate-800', !isCur);
      btn.classList.toggle('text-slate-300', !isCur);
    });

    if (g.level < 5) {
      this.dom.inspUpgradeBtn.innerHTML = `
        <i data-lucide="arrow-up-circle" class="w-4 h-4"></i>
        <div class="flex flex-col text-left leading-none">
          <span class="text-xs">${g.level === 2 ? '각성 승급' : '레벨 강화'}</span>
          <span class="text-[10px] opacity-80">${upgradeCost}G (+${nextStats.damage - stats.damage} ATK)</span>
        </div>
      `;
      this.dom.inspUpgradeBtn.disabled = !canAfford;
      this.dom.inspUpgradeBtn.className = `flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer shadow-md ${
        canAfford
          ? 'bg-amber-600 hover:bg-amber-500 active:scale-95 text-slate-950 glow-gold'
          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
      }`;
    } else {
      this.dom.inspUpgradeBtn.innerHTML = `최대 레벨 도달`;
      this.dom.inspUpgradeBtn.disabled = true;
      this.dom.inspUpgradeBtn.className = `flex-1 py-2 text-center text-amber-400 font-bold bg-amber-950/30 rounded-xl border border-amber-800 cursor-not-allowed`;
    }

    document.getElementById('insp-sell-refund').innerText = `+${refund}G`;
    if (window.lucide) window.lucide.createIcons();
  }

  openBestiaryModal() {
    this.dom.bestiaryModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  populateBestiary() {
    const guardiansContainer = document.getElementById('bestiary-tab-guardians');
    guardiansContainer.innerHTML = '';
    Object.values(GUARDIAN_TYPES).forEach((unit) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between';
      card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow" style="background-color: ${unit.color}25; border: 2px solid ${unit.color};">
              <div class="w-5 h-5 rounded-full" style="background-color: ${unit.color};"></div>
            </div>
            <div>
              <div class="font-bold text-slate-100 font-cinzel text-sm">${unit.name}</div>
              <div class="text-[11px] text-slate-400">${unit.title}</div>
            </div>
          </div>
          <div class="text-amber-400 font-bold font-cinzel text-xs">${unit.cost}G</div>
        </div>
        <p class="text-slate-300 text-xs mb-3 leading-relaxed">${unit.description}</p>
        <div class="grid grid-cols-3 gap-1 bg-slate-950/60 p-2 rounded-lg text-center text-[10px] mb-2">
          <div><div class="text-slate-400">기본 공격력</div><div class="font-bold text-slate-200">${unit.baseDamage}</div></div>
          <div><div class="text-slate-400">사거리</div><div class="font-bold text-slate-200">${unit.baseRange}</div></div>
          <div><div class="text-slate-400">대공 공격</div><div class="font-bold text-slate-200">${unit.canTargetAir ? '가능' : '불가'}</div></div>
        </div>
        <div class="text-[11px] bg-amber-950/30 border border-amber-900/40 rounded-lg p-2 text-amber-300/90">
          <span class="font-bold">고유 특성: </span>${unit.specialAbility}
        </div>
      `;
      guardiansContainer.appendChild(card);
    });

    const enemiesContainer = document.getElementById('bestiary-tab-enemies');
    enemiesContainer.innerHTML = '';
    Object.values(ENEMY_TYPES).forEach((enemy) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between';
      card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow" style="background-color: ${enemy.color}25; border: 2px solid ${enemy.color};">
              <div class="w-5 h-5 rounded-full" style="background-color: ${enemy.color};"></div>
            </div>
            <div>
              <div class="font-bold text-slate-100 font-cinzel text-sm">${enemy.name}</div>
              <div class="text-[11px] text-slate-400">${enemy.isBoss ? '보스 몬스터' : enemy.isAir ? '공중 비행 유닛' : '지상 보병'}</div>
            </div>
          </div>
          <div class="text-amber-400 font-bold font-cinzel text-xs">+${enemy.goldReward}G</div>
        </div>
        <p class="text-slate-300 text-xs mb-3 leading-relaxed">${enemy.description}</p>
        <div class="grid grid-cols-3 gap-1 bg-slate-950/60 p-2 rounded-lg text-center text-[10px] mb-2">
          <div><div class="text-slate-400">기본 체력</div><div class="font-bold text-slate-200">${enemy.baseHp}</div></div>
          <div><div class="text-slate-400">이동 속도</div><div class="font-bold text-slate-200">${enemy.speed}</div></div>
          <div><div class="text-slate-400">물리 방어력</div><div class="font-bold text-slate-200">${Math.round(enemy.armor * 100)}%</div></div>
        </div>
        ${enemy.specialTrait ? `<div class="text-[11px] bg-rose-950/30 border border-rose-900/40 rounded-lg p-2 text-rose-300"><span class="font-bold">위협 요소: </span>${enemy.specialTrait}</div>` : ''}
      `;
      enemiesContainer.appendChild(card);
    });
  }

  openStageModal() {
    const list = this.dom.stageListContainer;
    list.innerHTML = '';

    STAGES.forEach((stage, idx) => {
      const isCur = stage.id === this.currentStage.id;
      const card = document.createElement('div');
      card.className = `flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
        isCur
          ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/50'
          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
      }`;

      card.innerHTML = `
        <div class="flex items-center gap-3.5 mb-3 sm:mb-0">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg font-cinzel shadow ${
            stage.theme === 'forest' ? 'bg-emerald-950 border-emerald-600 text-emerald-400' : stage.theme === 'canyon' ? 'bg-amber-950 border-amber-600 text-amber-400' : 'bg-rose-950 border-rose-600 text-rose-400'
          }">
            ${idx === 0 ? 'I' : idx === 1 ? 'II' : 'III'}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-slate-100 font-cinzel text-base">${stage.name}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                stage.difficulty === '쉬움' ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-400' : stage.difficulty === '보통' ? 'bg-amber-950/60 border-amber-600/50 text-amber-400' : 'bg-rose-950/60 border-rose-600/50 text-rose-400'
              }">${stage.difficulty}</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${stage.subtitle}</p>
            <div class="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
              <span>총 ${stage.waves.length} 웨이브</span><span>·</span>
              <span>시작 골드: ${stage.startingGold}G</span><span>·</span>
              <span>배치 슬롯: ${stage.placementSlots.length}개</span>
            </div>
          </div>
        </div>
        <button class="stage-enter-btn px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
          isCur ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
        }">
          <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
          <span>${isCur ? '현재 전장' : '전장 입장'}</span>
        </button>
      `;

      card.querySelector('.stage-enter-btn').addEventListener('click', () => {
        this.resetGame(stage);
        this.dom.stageModal.classList.add('hidden');
      });

      list.appendChild(card);
    });

    this.dom.stageModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  showGameOver(isVictory) {
    const modal = this.dom.gameOverModal;
    modal.classList.remove('hidden');

    const iconBox = document.getElementById('game-over-icon-box');
    const title = document.getElementById('game-over-title');
    const desc = document.getElementById('game-over-desc');

    if (isVictory) {
      soundEngine.playVictory();
      if (window.confetti) {
        window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          window.confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
          window.confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
        }, 400);
      }
      iconBox.className = 'w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl border-2 bg-amber-950/60 border-amber-400 text-amber-400 glow-gold';
      iconBox.innerHTML = `<i data-lucide="trophy" class="w-10 h-10 animate-bounce"></i>`;
      title.innerText = '영광의 승리!';
      desc.innerText = `${this.currentStage.name}의 모든 몬스터와 보스를 격퇴하고 왕국을 지켜냈습니다!`;
    } else {
      soundEngine.playDefeat();
      iconBox.className = 'w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl border-2 bg-rose-950/60 border-rose-500 text-rose-400 glow-red';
      iconBox.innerHTML = `<i data-lucide="skull" class="w-10 h-10"></i>`;
      title.innerText = '방어선 함락...';
      desc.innerText = `몬스터 군단의 맹공에 성채가 무너졌습니다. 전열을 재정비하세요.`;
    }

    document.getElementById('go-waves').innerText = `${this.currentWaveIndex} / ${this.currentStage.waves.length}`;
    document.getElementById('go-kills').innerText = `${this.kills} 마리`;
    document.getElementById('go-score').innerText = this.score.toLocaleString();
    document.getElementById('go-guardians').innerText = `${this.guardians.length} 명`;

    // MVP
    const mvpCard = document.getElementById('go-mvp-card');
    if (this.guardians.length > 0) {
      const mvp = [...this.guardians].sort((a, b) => b.damageDealt - a.damageDealt)[0];
      const mvpType = GUARDIAN_TYPES[mvp.typeId];
      mvpCard.classList.remove('hidden');
      document.getElementById('go-mvp-name').innerText = `${mvpType.name} (Lv.${mvp.level})`;
      document.getElementById('go-mvp-dmg').innerText = Math.round(mvp.damageDealt).toLocaleString();
    } else {
      mvpCard.classList.add('hidden');
    }

    const nextBtn = document.getElementById('go-next-stage-btn');
    const currentIdx = STAGES.findIndex((s) => s.id === this.currentStage.id);
    if (isVictory && currentIdx < STAGES.length - 1) {
      nextBtn.classList.remove('hidden');
      nextBtn.onclick = () => {
        this.resetGame(STAGES[currentIdx + 1]);
      };
    } else {
      nextBtn.classList.add('hidden');
    }

    document.getElementById('go-restart-btn').onclick = () => this.resetGame(this.currentStage);
    document.getElementById('go-stage-list-btn').onclick = () => {
      this.dom.gameOverModal.classList.add('hidden');
      this.openStageModal();
    };

    if (window.lucide) window.lucide.createIcons();
  }

  // --- Main Animation Loop ---
  loop(currentTime) {
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.1) * (this.isPaused ? 0 : this.gameSpeed);
    const isRallyActive = Date.now() < this.rallyActiveUntil;
    const isGoldRushActive = Date.now() < this.goldRushActiveUntil;

    // Update Cooldowns
    if (!this.isPaused && dt > 0) {
      let needsSpellRedraw = false;
      this.spells.forEach((s) => {
        if (s.currentCooldown > 0) {
          s.currentCooldown = Math.max(0, s.currentCooldown - dt);
          needsSpellRedraw = true;
        }
      });
      if (needsSpellRedraw) this.renderSpellsDock();
    }

    // 1. Spawning
    if (this.isWaveInProgress && !this.isPaused) {
      this.waveElapsed += dt;
      const tracker = this.waveTracker;

      while (tracker.spawnQueue.length > 0 && tracker.spawnQueue[0].spawnTime <= this.waveElapsed) {
        const nextSpawn = tracker.spawnQueue.shift();
        const enemyType = ENEMY_TYPES[nextSpawn.enemyTypeId];
        if (enemyType) {
          const path = this.currentStage.paths[nextSpawn.pathIndex] || this.currentStage.paths[0];
          const startNode = path[0];

          this.enemies.push({
            id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            typeId: enemyType.id,
            x: startNode.x,
            y: startNode.y,
            hp: enemyType.baseHp,
            maxHp: enemyType.baseHp,
            speed: enemyType.speed,
            goldReward: enemyType.goldReward,
            scoreReward: enemyType.scoreReward,
            armor: enemyType.armor,
            magicResist: enemyType.magicResist,
            pathIndex: 0,
            subProgress: 0,
            distanceTraveled: 0,
            statusEffects: [],
            isAir: enemyType.isAir,
            isBoss: enemyType.isBoss,
            size: enemyType.size,
            angle: 0,
            spawnTime: this.waveElapsed,
          });
          tracker.spawnedCount++;
        }
      }

      // Wave cleared
      if (tracker.spawnQueue.length === 0 && this.enemies.length === 0) {
        this.isWaveInProgress = false;
        this.waveElapsed = 0;

        const wave = this.currentStage.waves.find((w) => w.waveNumber === this.currentWaveIndex);
        const bonus = wave ? wave.bonusGoldReward : 50;
        this.gold += bonus;
        soundEngine.playCoin();

        this.floatingTexts.push({
          id: Math.random().toString(),
          x: VIRTUAL_WIDTH / 2,
          y: 180,
          text: `웨이브 클리어! 보너스 +${bonus}G`,
          color: '#22c55e',
          life: 2.2,
          maxLife: 2.2,
          size: 20,
        });

        if (this.currentWaveIndex >= this.currentStage.waves.length) {
          this.showGameOver(true);
        } else {
          this.currentWaveIndex++;
          this.waveCountdown = 8;
        }
        this.updateHUD();
      }
    }

    // Wave countdown
    if (!this.isWaveInProgress && this.waveCountdown > 0 && !this.isPaused && dt > 0) {
      this.waveCountdown -= dt;
      if (this.waveCountdown <= 0) {
        this.waveCountdown = 0;
        this.startWave(this.currentWaveIndex);
      }
      this.updateHUD();
    }

    // 2. Enemies
    if (!this.isPaused) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        const path = this.currentStage.paths[0];

        let speedFactor = 1.0;
        let isFrozen = false;

        for (let s = enemy.statusEffects.length - 1; s >= 0; s--) {
          const effect = enemy.statusEffects[s];
          effect.duration -= dt;
          if (effect.type === 'burn' || effect.type === 'poison') {
            enemy.hp -= effect.value * dt;
          } else if (effect.type === 'slow') {
            speedFactor *= Math.max(0.2, 1 - effect.value);
          } else if (effect.type === 'freeze') {
            isFrozen = true;
          }
          if (effect.duration <= 0) enemy.statusEffects.splice(s, 1);
        }

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

            const curW = path[enemy.pathIndex] || nextWaypoint;
            const nxtW = path[enemy.pathIndex + 1] || curW;
            enemy.x = curW.x + (nxtW.x - curW.x) * enemy.subProgress;
            enemy.y = curW.y + (nxtW.y - curW.y) * enemy.subProgress;
          } else {
            // Reached gate
            soundEngine.playLifeLost();
            const dmg = enemy.isBoss ? 5 : 1;
            this.lives = Math.max(0, this.lives - dmg);
            this.floatingTexts.push({
              id: Math.random().toString(),
              x: enemy.x,
              y: enemy.y - 10,
              text: `-${dmg} HP`,
              color: '#ef4444',
              life: 1.5,
              maxLife: 1.5,
              size: 16,
            });
            this.enemies.splice(i, 1);
            this.updateHUD();

            if (this.lives <= 0) {
              this.showGameOver(false);
            }
            continue;
          }
        }

        if (enemy.hp <= 0) {
          const finalGold = isGoldRushActive ? enemy.goldReward * 2 : enemy.goldReward;
          this.gold += finalGold;
          this.score += enemy.scoreReward;
          this.kills++;
          soundEngine.playCoin();
          this.floatingTexts.push({
            id: Math.random().toString(),
            x: enemy.x,
            y: enemy.y - 10,
            text: `+${finalGold}G`,
            color: '#fbbf24',
            life: 1.2,
            maxLife: 1.2,
            size: 14,
          });
          this.enemies.splice(i, 1);
          this.updateHUD();
        }
      }
    }

    // 3. Guardians AI
    if (!this.isPaused) {
      const paladins = this.guardians.filter((g) => g.typeId === 'paladin' && g.level >= 3);

      this.guardians.forEach((guardian) => {
        const type = GUARDIAN_TYPES[guardian.typeId];
        const stats = getGuardianStats(guardian.typeId, guardian.level);
        if (!type || !stats) return;

        let damageMultiplier = 1.0;
        paladins.forEach((pal) => {
          if (Math.hypot(pal.x - guardian.x, pal.y - guardian.y) <= 140) {
            damageMultiplier *= 1.25;
          }
        });

        const effectiveAttackSpeed = stats.attackSpeed * (isRallyActive ? 1.6 : 1.0);
        const attackInterval = 1 / effectiveAttackSpeed;

        const slot = this.slots.find((s) => s.occupiedGuardianId === guardian.id);
        let effectiveRange = stats.range;
        if (slot?.terrainBonus === 'range') effectiveRange *= 1.2;
        if (slot?.terrainBonus === 'damage') damageMultiplier *= 1.15;

        const candidates = this.enemies.filter((e) => {
          if (!type.canTargetAir && e.isAir) return false;
          return Math.hypot(e.x - guardian.x, e.y - guardian.y) <= effectiveRange;
        });

        if (candidates.length === 0) {
          guardian.targetEnemyId = null;
          return;
        }

        if (guardian.targetPriority === 'first') {
          candidates.sort((a, b) => b.distanceTraveled - a.distanceTraveled);
        } else if (guardian.targetPriority === 'last') {
          candidates.sort((a, b) => a.distanceTraveled - b.distanceTraveled);
        } else if (guardian.targetPriority === 'strongest') {
          candidates.sort((a, b) => b.hp - a.hp);
        } else if (guardian.targetPriority === 'closest') {
          candidates.sort(
            (a, b) =>
              Math.hypot(a.x - guardian.x, a.y - guardian.y) - Math.hypot(b.x - guardian.x, b.y - guardian.y)
          );
        }

        const target = candidates[0];
        guardian.targetEnemyId = target.id;
        guardian.angle = Math.atan2(target.y - guardian.y, target.x - guardian.x);

        if (currentTime / 1000 - guardian.lastShotTime >= attackInterval) {
          guardian.lastShotTime = currentTime / 1000;
          const finalDamage = stats.damage * damageMultiplier;

          if (type.id === 'archer') soundEngine.playArrow();
          else if (type.id === 'mage') soundEngine.playFireball();
          else if (type.id === 'frost') soundEngine.playFrost();
          else if (type.id === 'assassin') soundEngine.playPoison();
          else if (type.id === 'dragon') soundEngine.playDragonBreath();
          else soundEngine.playHolySmite();

          if (type.id === 'paladin') {
            const targets = candidates.slice(0, guardian.level >= 3 ? 4 : 2);
            targets.forEach((t) => {
              const dmg = finalDamage * (1 - t.armor * 0.5);
              t.hp -= dmg;
              guardian.damageDealt += dmg;
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: t.x,
                y: t.y - 12,
                text: `-${Math.round(dmg)}`,
                color: '#fbbf24',
                life: 0.8,
                maxLife: 0.8,
                size: 13,
              });
              if (t.hp <= 0) guardian.kills++;
            });
          } else {
            this.projectiles.push({
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
                  ? { type: 'poison', duration: 3.5, value: 20 * guardian.level }
                  : type.id === 'mage'
                  ? { type: 'burn', duration: 3.0, value: 15 * guardian.level }
                  : undefined,
              color: type.color,
              size: type.id === 'mage' ? 8 : type.id === 'dragon' ? 10 : 4,
            });
          }
        }
      });
    }

    // 4. Projectiles
    if (!this.isPaused) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        const target = this.enemies.find((e) => e.id === p.targetEnemyId);
        if (target) {
          p.targetLastX = target.x;
          p.targetLastY = target.y;
        }

        const dx = p.targetLastX - p.x;
        const dy = p.targetLastY - p.y;
        const dist = Math.hypot(dx, dy);
        const step = p.speed * dt;

        if (dist <= step || dist < 12) {
          const hitEnemies =
            p.splashRadius > 0
              ? this.enemies.filter((e) => Math.hypot(e.x - p.targetLastX, e.y - p.targetLastY) <= p.splashRadius)
              : target
              ? [target]
              : [];

          hitEnemies.forEach((e) => {
            let reduction = 0;
            if (p.damageType === 'physical') reduction = e.armor;
            else if (p.damageType === 'magic' || p.damageType === 'frost' || p.damageType === 'fire') {
              reduction = e.magicResist;
            } else if (p.damageType === 'poison') {
              reduction = e.armor * 0.2;
            }

            let isCrit = false;
            let effectiveDmg = p.damage * (1 - reduction);
            if (p.damageType === 'physical' && Math.random() < 0.3) {
              isCrit = true;
              effectiveDmg *= 2.2;
            }

            e.hp -= effectiveDmg;
            if (p.statusEffect) e.statusEffects.push({ ...p.statusEffect });

            this.floatingTexts.push({
              id: Math.random().toString(),
              x: e.x,
              y: e.y - 12,
              text: `${isCrit ? '치명타! ' : ''}-${Math.round(effectiveDmg)}`,
              color: isCrit ? '#facc15' : p.color,
              life: 0.9,
              maxLife: 0.9,
              size: isCrit ? 15 : 12,
            });

            if (e.hp <= 0) {
              const finalGold = isGoldRushActive ? e.goldReward * 2 : e.goldReward;
              this.gold += finalGold;
              this.score += e.scoreReward;
              this.kills++;
              soundEngine.playCoin();
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: e.x,
                y: e.y - 10,
                text: `+${finalGold}G`,
                color: '#fbbf24',
                life: 1.2,
                maxLife: 1.2,
                size: 14,
              });
              this.updateHUD();
            }
          });

          for (let k = 0; k < (p.splashRadius > 0 ? 16 : 6); k++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
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

          this.projectiles.splice(i, 1);
        } else {
          p.x += (dx / dist) * step;
          p.y += (dy / dist) * step;
        }
      }
    }

    // 5. Particles & Texts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha = Math.max(0, pt.life / pt.maxLife);
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 22 * dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 6. Canvas Render
    const timeSec = currentTime / 1000;
    this.renderer.renderBackground(this.currentStage, timeSec);
    this.renderer.renderPaths(this.currentStage, timeSec);
    this.renderer.renderSlots(
      this.slots,
      this.hoveredSlotId,
      this.selectedGuardianId,
      this.selectedSummonTypeId !== null
    );
    this.renderer.renderGuardians(this.guardians, this.selectedGuardianId, timeSec);
    this.renderer.renderEnemies(this.enemies, timeSec);
    this.renderer.renderProjectiles(this.projectiles);
    this.renderer.renderParticles(this.particles);
    this.renderer.renderFloatingTexts(this.floatingTexts);

    requestAnimationFrame(this.loop.bind(this));
  }
}

// Launch engine once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
  if (window.lucide) window.lucide.createIcons();
});
