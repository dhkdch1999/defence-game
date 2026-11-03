/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Heart,
  Coins,
  Shield,
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  Music,
  BookOpen,
  Map as MapIcon,
  RotateCcw,
} from 'lucide-react';
import { StageDefinition } from '../types/game';

interface TopBarProps {
  currentStage: StageDefinition;
  lives: number;
  maxLives: number;
  gold: number;
  currentWaveIndex: number;
  totalWaves: number;
  isWaveInProgress: boolean;
  waveCountdown: number;
  score: number;
  kills: number;
  gameSpeed: number;
  isPaused: boolean;
  isMuted: boolean;
  isBgmPlaying: boolean;
  onSpeedChange: (speed: number) => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onCallNextWave: () => void;
  onOpenStageSelect: () => void;
  onOpenBestiary: () => void;
  onRestart: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentStage,
  lives,
  maxLives,
  gold,
  currentWaveIndex,
  totalWaves,
  isWaveInProgress,
  waveCountdown,
  score,
  kills,
  gameSpeed,
  isPaused,
  isMuted,
  isBgmPlaying,
  onSpeedChange,
  onTogglePause,
  onToggleMute,
  onToggleBgm,
  onCallNextWave,
  onOpenStageSelect,
  onOpenBestiary,
  onRestart,
}) => {
  const isLowHealth = lives <= 5;
  const isFinalWave = currentWaveIndex >= totalWaves;

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-sm select-none z-20 shadow-lg">
      {/* Left: Stage Title & Essential Resources */}
      <div className="flex items-center gap-4">
        {/* Stage Selector Button */}
        <button
          onClick={onOpenStageSelect}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer group"
          title="스테이지 변경"
        >
          <MapIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-100 font-cinzel">
              {currentStage.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {currentStage.difficulty} · {totalWaves} 웨이브
            </span>
          </div>
        </button>

        {/* Lives Counter */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            isLowHealth
              ? 'bg-rose-950/60 border-rose-600 text-rose-300 animate-pulse'
              : 'bg-slate-800/60 border-slate-700/80 text-rose-400'
          }`}
          title="성채 생명력"
        >
          <Heart className={`w-4 h-4 fill-current ${isLowHealth ? 'text-rose-500' : ''}`} />
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base font-cinzel text-slate-100">{lives}</span>
            <span className="text-[11px] text-slate-400">/{maxLives}</span>
          </div>
        </div>

        {/* Gold Counter */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-600/50 text-amber-400"
          title="보유 골드"
        >
          <Coins className="w-4 h-4 fill-amber-500 text-amber-300" />
          <span className="font-bold text-base font-cinzel text-amber-200 tracking-wide">
            {gold.toLocaleString()} G
          </span>
        </div>

        {/* Score & Kills */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 border-l border-slate-800 pl-4">
          <div>
            처치: <span className="font-semibold text-slate-200">{kills}</span>
          </div>
          <div>
            점수: <span className="font-semibold text-amber-300">{score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Center: Wave Progress & Next Wave Trigger */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-100">
              {isFinalWave ? '최종 웨이브' : `웨이브 ${currentWaveIndex} / ${totalWaves}`}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isWaveInProgress ? (
              <span className="text-emerald-400 font-medium animate-pulse">전투 진행 중</span>
            ) : waveCountdown > 0 ? (
              <span>다음 침공까지 <strong className="text-amber-400">{waveCountdown}초</strong></span>
            ) : (
              <span>대기 중</span>
            )}
          </div>
        </div>

        {/* Early Call Next Wave Button */}
        {!isWaveInProgress && currentWaveIndex < totalWaves && (
          <button
            onClick={onCallNextWave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer glow-gold"
            title="즉시 다음 웨이브를 호출하고 보너스 골드를 획득합니다"
          >
            <FastForward className="w-3.5 h-3.5 fill-current" />
            <span>즉시 호출 (+보너스 골드)</span>
          </button>
        )}
      </div>

      {/* Right: Controls, Speed, Sound, Bestiary */}
      <div className="flex items-center gap-2">
        {/* Speed Controls */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                gameSpeed === speed
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Pause / Resume */}
        <button
          onClick={onTogglePause}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isPaused
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title={isPaused ? '계속하기 (Space)' : '일시정지 (Space)'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-all cursor-pointer"
          title="스테이지 재시작"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isMuted
              ? 'bg-slate-800 border-slate-700 text-slate-500'
              : 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
          }`}
          title={isMuted ? '음향 켜기' : '음향 음소거'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Ambient BGM Toggle */}
        <button
          onClick={onToggleBgm}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isBgmPlaying
              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
          }`}
          title={isBgmPlaying ? '배경음악 끄기' : '배경음악 켜기'}
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Bestiary / Guide Modal */}
        <button
          onClick={onOpenBestiary}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-all cursor-pointer"
          title="도감 및 가이드"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">도감</span>
        </button>
      </div>
    </header>
  );
};
