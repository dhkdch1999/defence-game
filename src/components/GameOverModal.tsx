/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw, ArrowRight, Map as MapIcon, Award } from 'lucide-react';
import { Guardian, StageDefinition } from '../types/game';
import { GUARDIAN_TYPES } from '../data/guardians';

interface GameOverModalProps {
  isVictory: boolean;
  stage: StageDefinition;
  wavesCleared: number;
  totalWaves: number;
  score: number;
  kills: number;
  guardians: Guardian[];
  onRestart: () => void;
  onNextStage?: () => void;
  onOpenStageSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  stage,
  wavesCleared,
  totalWaves,
  score,
  kills,
  guardians,
  onRestart,
  onNextStage,
  onOpenStageSelect,
}) => {
  useEffect(() => {
    if (isVictory) {
      // Fire confetti burst!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isVictory]);

  // Find MVP Guardian
  const mvp = guardians.length > 0
    ? [...guardians].sort((a, b) => b.damageDealt - a.damageDealt)[0]
    : null;
  const mvpType = mvp ? GUARDIAN_TYPES[mvp.typeId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-250">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 text-center">
        {/* Result Icon */}
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl border-2 ${
            isVictory
              ? 'bg-amber-950/60 border-amber-400 text-amber-400 glow-gold'
              : 'bg-rose-950/60 border-rose-500 text-rose-400 glow-red'
          }`}
        >
          {isVictory ? <Trophy className="w-10 h-10 animate-bounce" /> : <Skull className="w-10 h-10" />}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold font-cinzel text-slate-100 tracking-wide mb-1">
          {isVictory ? '영광의 승리!' : '방어선 함락...'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {isVictory
            ? `${stage.name}의 모든 몬스터와 보스를 격퇴하고 왕국을 지켜냈습니다!`
            : `몬스터 군단의 맹공에 성채가 무너졌습니다. 전열을 재정비하세요.`}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl mb-4 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[11px]">방어한 웨이브</span>
            <span className="text-base font-bold text-slate-100 font-cinzel">
              {wavesCleared} / {totalWaves}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[11px]">총 처치 수</span>
            <span className="text-base font-bold text-slate-100 font-cinzel">
              {kills} 마리
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[11px]">최종 점수</span>
            <span className="text-base font-bold text-amber-400 font-cinzel">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[11px]">배치한 수호자</span>
            <span className="text-base font-bold text-slate-100 font-cinzel">
              {guardians.length} 명
            </span>
          </div>
        </div>

        {/* MVP Card */}
        {mvp && mvpType && (
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-3 mb-6 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  전투 MVP 가디언
                </div>
                <div className="text-xs font-bold text-slate-100 font-cinzel">
                  {mvpType.name} (Lv.{mvp.level})
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">누적 피해량</div>
              <div className="text-xs font-bold text-amber-300 font-cinzel">
                {Math.round(mvp.damageDealt).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isVictory && onNextStage && (
            <button
              onClick={onNextStage}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 active:scale-95 text-slate-950 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg glow-gold"
            >
              <span>다음 스테이지로 진격</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>다시 도전</span>
            </button>

            <button
              onClick={onOpenStageSelect}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MapIcon className="w-4 h-4 text-blue-400" />
              <span>전장 목록</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
