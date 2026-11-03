/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommanderSpell } from '../types/game';

export const COMMANDER_SPELLS: CommanderSpell[] = [
  {
    id: 'meteor',
    name: '메테오 스트라이크',
    description: '목표 지점에 불타는 운석을 낙하시켜 반경 120 내의 모든 적에게 450의 막대한 화염 피해를 입힙니다.',
    cooldown: 35,
    currentCooldown: 0,
    cost: 0,
    icon: 'Flame',
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
    icon: 'Snowflake',
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
    icon: 'Swords',
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
    icon: 'Coins',
    radius: 0,
    targetType: 'instant',
  },
];
