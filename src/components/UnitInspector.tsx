/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Guardian, TargetPriority } from '../types/game';
import { GUARDIAN_TYPES, getGuardianStats, getUpgradeCost, getSellRefund } from '../data/guardians';
import {
  X,
  ArrowUpCircle,
  Trash2,
  Sword,
  Crosshair,
  Zap,
  Sparkles,
  Trophy,
  Activity,
  Coins,
} from 'lucide-react';

interface UnitInspectorProps {
  guardian: Guardian | null;
  gold: number;
  onClose: () => void;
  onUpgrade: (guardianId: string) => void;
  onSell: (guardianId: string) => void;
  onChangePriority: (guardianId: string, priority: TargetPriority) => void;
}

export const UnitInspector: React.FC<UnitInspectorProps> = ({
  guardian,
  gold,
  onClose,
  onUpgrade,
  onSell,
  onChangePriority,
}) => {
  if (!guardian) return null;

  const type = GUARDIAN_TYPES[guardian.typeId];
  if (!type) return null;

  const currentStats = getGuardianStats(guardian.typeId, guardian.level);
  const nextStats = getGuardianStats(guardian.typeId, guardian.level + 1);
  const upgradeCost = getUpgradeCost(guardian.typeId, guardian.level);
  const refundAmount = getSellRefund(guardian.typeId, guardian.level);
  const canAffordUpgrade = gold >= upgradeCost && guardian.level < 5;

  const priorityOptions: { value: TargetPriority; label: string }[] = [
    { value: 'first', label: '선두' },
    { value: 'strongest', label: '최강' },
    { value: 'closest', label: '최근접' },
    { value: 'last', label: '후미' },
  ];

  return (
    <div className="absolute right-4 top-16 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md p-4 text-xs select-none z-30 animate-in fade-in slide-in-from-right-4 duration-150">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md relative"
            style={{
              backgroundColor: `${type.color}30`,
              border: `2px solid ${type.color}`,
            }}
          >
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: type.color }} />
            <span className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-750 text-[10px] px-1 rounded font-bold text-amber-300">
              Lv.{guardian.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-100 font-cinzel">{type.name}</h3>
              {guardian.level >= 3 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  각성
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">{type.title}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Combat Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl flex items-center gap-2">
          <Sword className="w-4 h-4 text-rose-400" />
          <div>
            <div className="text-[10px] text-slate-400">공격력 (DPS)</div>
            <div className="font-bold text-slate-100 text-sm">
              {currentStats?.damage}{' '}
              <span className="text-[10px] text-slate-400">({currentStats?.dps}/s)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400">사거리</div>
            <div className="font-bold text-slate-100 text-sm">{currentStats?.range} px</div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400">공격 속도</div>
            <div className="font-bold text-slate-100 text-sm">{currentStats?.attackSpeed}/s</div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl flex items-center gap-2">
          <Trophy className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-[10px] text-slate-400">처치 수</div>
            <div className="font-bold text-slate-100 text-sm">{guardian.kills} 회</div>
          </div>
        </div>
      </div>

      {/* Total Damage Dealt */}
      <div className="bg-slate-950/40 border border-slate-800/60 p-2 rounded-xl mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>누적 입힌 피해량</span>
        </div>
        <span className="font-bold text-slate-200 font-cinzel">
          {Math.round(guardian.damageDealt).toLocaleString()}
        </span>
      </div>

      {/* Target Priority Selector */}
      <div className="mb-3">
        <div className="text-[11px] font-semibold text-slate-300 mb-1.5">우선 타겟 지정</div>
        <div className="grid grid-cols-4 gap-1">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChangePriority(guardian.id, opt.value)}
              className={`py-1 rounded-lg text-center font-semibold text-[11px] transition-all cursor-pointer ${
                guardian.targetPriority === opt.value
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Special Ability / Awakening Perk */}
      <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-2 mb-3">
        <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mb-0.5">
          <Sparkles className="w-3 h-3" />
          {guardian.level >= 3 ? '각성 스킬 활성화' : '각성 스킬 (Lv.3 달성 시)'}
        </div>
        <div className="text-[11px] text-amber-200/90 leading-tight">
          {type.specialAbility}
        </div>
      </div>

      {/* Upgrade & Sell Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        {/* Upgrade Button */}
        {guardian.level < 5 ? (
          <button
            onClick={() => onUpgrade(guardian.id)}
            disabled={!canAffordUpgrade}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer shadow-md ${
              canAffordUpgrade
                ? 'bg-amber-600 hover:bg-amber-500 active:scale-95 text-slate-950 glow-gold'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs">
                {guardian.level === 2 ? '각성 승급' : '레벨 강화'}
              </span>
              <span className="text-[10px] opacity-80 flex items-center gap-0.5">
                <Coins className="w-2.5 h-2.5" />
                {upgradeCost}G
                {nextStats && ` (+${nextStats.damage - (currentStats?.damage || 0)} ATK)`}
              </span>
            </div>
          </button>
        ) : (
          <div className="flex-1 py-2 text-center text-amber-400 font-bold bg-amber-950/30 rounded-xl border border-amber-800">
            최대 레벨 도달
          </div>
        )}

        {/* Sell Button */}
        <button
          onClick={() => onSell(guardian.id)}
          className="flex items-center gap-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 border border-slate-700 text-slate-300 transition-all cursor-pointer"
          title={`수호자를 회수하고 골드의 70%(${refundAmount}G)를 환급받습니다`}
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs">판매</span>
            <span className="text-[9px] text-amber-400">+{refundAmount}G</span>
          </div>
        </button>
      </div>
    </div>
  );
};
