/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Snowflake, Swords, Coins } from 'lucide-react';
import { CommanderSpell } from '../types/game';

interface SpellsDockProps {
  spells: CommanderSpell[];
  activeSpellId: string | null;
  onActivateSpell: (spellId: string) => void;
  onCancelSpell: () => void;
}

export const SpellsDock: React.FC<SpellsDockProps> = ({
  spells,
  activeSpellId,
  onActivateSpell,
  onCancelSpell,
}) => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Snowflake':
        return <Snowflake className="w-5 h-5 text-sky-400" />;
      case 'Swords':
        return <Swords className="w-5 h-5 text-amber-400" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-yellow-300" />;
      default:
        return null;
    }
  };

  const hotkeys = ['Q', 'W', 'E', 'R'];

  return (
    <div className="flex flex-col items-center gap-1 select-none z-20">
      {activeSpellId && (
        <div className="bg-amber-500/90 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-2">
          <span>전장에 투하할 지점을 클릭하세요</span>
          <button
            onClick={onCancelSpell}
            className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-800"
          >
            취소 (ESC)
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-xl">
        {spells.map((spell, index) => {
          const isReady = spell.currentCooldown <= 0;
          const isActive = activeSpellId === spell.id;
          const cooldownPct = isReady ? 0 : (spell.currentCooldown / spell.cooldown) * 100;

          return (
            <button
              key={spell.id}
              onClick={() => {
                if (isActive) {
                  onCancelSpell();
                } else if (isReady) {
                  onActivateSpell(spell.id);
                }
              }}
              disabled={!isReady}
              title={`${spell.name} (${hotkeys[index]}): ${spell.description}`}
              className={`relative flex items-center justify-center w-12 h-12 rounded-lg border transition-all cursor-pointer overflow-hidden ${
                isActive
                  ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400 shadow-md'
                  : isReady
                  ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 hover:border-slate-500 hover:scale-105'
                  : 'bg-slate-900/60 border-slate-800 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Cooldown Overlay */}
              {!isReady && (
                <div
                  className="absolute inset-x-0 bottom-0 bg-slate-950/80 transition-all pointer-events-none"
                  style={{ height: `${cooldownPct}%` }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">{getIcon(spell.icon)}</div>

              {/* Hotkey Tag */}
              <span className="absolute top-1 left-1.5 text-[8px] font-mono font-bold text-slate-400 bg-slate-950/80 px-1 rounded z-10">
                {hotkeys[index]}
              </span>

              {/* Cooldown Text */}
              {!isReady && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-100 z-10">
                  {Math.ceil(spell.currentCooldown)}s
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
