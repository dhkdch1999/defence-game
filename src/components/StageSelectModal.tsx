/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Map, Shield, Play } from 'lucide-react';
import { STAGES } from '../data/maps';
import { StageDefinition } from '../types/game';

interface StageSelectModalProps {
  isOpen: boolean;
  currentStageId: string;
  onSelectStage: (stage: StageDefinition) => void;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  currentStageId,
  onSelectStage,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-cinzel">전장 스테이지 선택</h2>
              <p className="text-xs text-slate-400">수호할 영지를 선택하여 원정을 시작하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage List */}
        <div className="p-6 space-y-3">
          {STAGES.map((stage) => {
            const isSelected = stage.id === currentStageId;

            return (
              <div
                key={stage.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/50'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3.5 mb-3 sm:mb-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg font-cinzel shadow ${
                      stage.theme === 'forest'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-400'
                        : stage.theme === 'canyon'
                        ? 'bg-amber-950 border-amber-600 text-amber-400'
                        : 'bg-rose-950 border-rose-600 text-rose-400'
                    }`}
                  >
                    {stage.theme === 'forest' ? 'I' : stage.theme === 'canyon' ? 'II' : 'III'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 font-cinzel text-base">
                        {stage.name}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          stage.difficulty === '쉬움'
                            ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-400'
                            : stage.difficulty === '보통'
                            ? 'bg-amber-950/60 border-amber-600/50 text-amber-400'
                            : 'bg-rose-950/60 border-rose-600/50 text-rose-400'
                        }`}
                      >
                        {stage.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{stage.subtitle}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>총 {stage.waves.length} 웨이브</span>
                      <span>·</span>
                      <span>시작 골드: {stage.startingGold}G</span>
                      <span>·</span>
                      <span>배치 슬롯: {stage.placementSlots.length}개</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectStage(stage);
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSelected ? '현재 전장' : '전장 입장'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
