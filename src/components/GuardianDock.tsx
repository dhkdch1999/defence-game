/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GUARDIAN_TYPES } from '../data/guardians';
import { GuardianTypeInfo } from '../types/game';
import { Shield, Crosshair, Flame, Snowflake, Skull, Sparkles, Coins } from 'lucide-react';

interface GuardianDockProps {
  gold: number;
  selectedTypeId: string | null;
  onSelectType: (typeId: string | null) => void;
}

export const GuardianDock: React.FC<GuardianDockProps> = ({
  gold,
  selectedTypeId,
  onSelectType,
}) => {
  const [hoveredUnit, setHoveredUnit] = useState<GuardianTypeInfo | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'melee':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'sniper':
        return <Crosshair className="w-3.5 h-3.5 text-emerald-400" />;
      case 'aoe_mage':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'crowd_control':
        return <Snowflake className="w-3.5 h-3.5 text-sky-400" />;
      case 'assassin':
        return <Skull className="w-3.5 h-3.5 text-purple-400" />;
      case 'legendary':
        return <Sparkles className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'melee':
        return '근접 수호';
      case 'sniper':
        return '단일 저격';
      case 'aoe_mage':
        return '광역 화염';
      case 'crowd_control':
        return '군중 제어';
      case 'assassin':
        return '방어 관통';
      case 'legendary':
        return '전설 비룡';
      default:
        return role;
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none z-20">
      {/* Unit Hover Information Tooltip */}
      {hoveredUnit && (
        <div className="absolute -top-36 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md w-72 text-xs pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-1.5 font-cinzel">
                {getRoleIcon(hoveredUnit.role)}
                {hoveredUnit.name}
              </div>
              <div className="text-[10px] text-slate-400">{hoveredUnit.title}</div>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-bold font-cinzel text-sm">
              <Coins className="w-3.5 h-3.5 fill-current" />
              {hoveredUnit.cost}G
            </div>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
            {hoveredUnit.description}
          </p>

          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1.5 rounded-lg text-[10px] text-center mb-2">
            <div>
              <div className="text-slate-400">기본 공격력</div>
              <div className="font-bold text-slate-200">{hoveredUnit.baseDamage}</div>
            </div>
            <div>
              <div className="text-slate-400">사거리</div>
              <div className="font-bold text-slate-200">{hoveredUnit.baseRange}</div>
            </div>
            <div>
              <div className="text-slate-400">공격속도</div>
              <div className="font-bold text-slate-200">{hoveredUnit.baseAttackSpeed}/s</div>
            </div>
          </div>

          <div className="text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-900/40 rounded px-2 py-1">
            {hoveredUnit.specialAbility}
          </div>
        </div>
      )}

      {/* Hero Cards Shelf */}
      <div className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl">
        {Object.values(GUARDIAN_TYPES).map((unit, index) => {
          const isSelected = selectedTypeId === unit.id;
          const canAfford = gold >= unit.cost;

          return (
            <button
              key={unit.id}
              onClick={() => {
                if (isSelected) {
                  onSelectType(null);
                } else if (canAfford) {
                  onSelectType(unit.id);
                }
              }}
              onMouseEnter={() => setHoveredUnit(unit)}
              onMouseLeave={() => setHoveredUnit(null)}
              className={`relative flex flex-col items-center justify-between w-24 h-28 p-2 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 -translate-y-1 shadow-lg'
                  : canAfford
                  ? 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 hover:border-slate-500 hover:-translate-y-0.5'
                  : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Hotkey Tag */}
              <div className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-950/70 px-1 rounded">
                {index + 1}
              </div>

              {/* Unit Role Badge */}
              <div className="text-[9px] flex items-center gap-1 font-medium text-slate-300 mt-0.5">
                {getRoleIcon(unit.role)}
                <span>{getRoleLabel(unit.role)}</span>
              </div>

              {/* Unit Avatar Preview Orb */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center my-1 shadow-inner relative transition-transform hover:scale-110"
                style={{
                  backgroundColor: `${unit.color}25`,
                  border: `2px solid ${unit.color}`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: unit.color }}
                />
              </div>

              {/* Unit Name */}
              <div className="text-[11px] font-bold text-slate-200 text-center truncate w-full">
                {unit.name.split(' ')[0]}
              </div>

              {/* Cost */}
              <div
                className={`flex items-center gap-1 text-[11px] font-bold font-cinzel ${
                  canAfford ? 'text-amber-300' : 'text-rose-400'
                }`}
              >
                <Coins className="w-3 h-3 fill-current" />
                <span>{unit.cost}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
