/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GuardianTypeInfo } from '../types/game';

export const GUARDIAN_TYPES: Record<string, GuardianTypeInfo> = {
  paladin: {
    id: 'paladin',
    name: '성기사 발두르',
    title: '신의 방패',
    role: 'melee',
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

export function getGuardianStats(typeId: string, level: number) {
  const base = GUARDIAN_TYPES[typeId];
  if (!base) return null;

  // Level scaling formulas
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

export function getUpgradeCost(typeId: string, currentLevel: number): number {
  const base = GUARDIAN_TYPES[typeId];
  if (!base) return 999;
  return Math.round(base.cost * Math.pow(base.upgradeCostFactor, currentLevel));
}

export function getSellRefund(typeId: string, currentLevel: number): number {
  const base = GUARDIAN_TYPES[typeId];
  if (!base) return 0;
  let totalInvested = base.cost;
  for (let l = 1; l < currentLevel; l++) {
    totalInvested += getUpgradeCost(typeId, l);
  }
  return Math.floor(totalInvested * 0.7); // 70% refund
}
