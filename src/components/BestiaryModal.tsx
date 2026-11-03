/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Shield, Skull, Lightbulb, Coins } from 'lucide-react';
import { GUARDIAN_TYPES } from '../data/guardians';
import { ENEMY_TYPES } from '../data/enemies';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guardians' | 'enemies' | 'tips'>('guardians');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-cinzel">왕국 수호록 & 몬스터 도감</h2>
            <p className="text-xs text-slate-400">가디언의 특성과 침공해오는 몬스터들의 약점을 분석하세요</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 px-6 gap-2 bg-slate-900">
          <button
            onClick={() => setActiveTab('guardians')}
            className={`flex items-center gap-1.5 py-3 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'guardians'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>수호자 영웅들 ({Object.keys(GUARDIAN_TYPES).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enemies')}
            className={`flex items-center gap-1.5 py-3 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'enemies'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span>침공 몬스터군 ({Object.keys(ENEMY_TYPES).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`flex items-center gap-1.5 py-3 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'tips'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>전략 전술 가이드</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'guardians' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(GUARDIAN_TYPES).map((unit) => (
                <div
                  key={unit.id}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
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
                      <div>
                        <div className="font-bold text-slate-100 font-cinzel text-sm">
                          {unit.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{unit.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold font-cinzel text-xs">
                      <Coins className="w-3.5 h-3.5 fill-current" />
                      {unit.cost}G
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                    {unit.description}
                  </p>

                  <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-2 rounded-lg text-center text-[10px] mb-2">
                    <div>
                      <div className="text-slate-400">기본 공격력</div>
                      <div className="font-bold text-slate-200">{unit.baseDamage}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">사거리</div>
                      <div className="font-bold text-slate-200">{unit.baseRange}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">대공 공격</div>
                      <div className="font-bold text-slate-200">
                        {unit.canTargetAir ? '가능' : '불가'}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] bg-amber-950/30 border border-amber-900/40 rounded-lg p-2 text-amber-300/90">
                    <span className="font-bold">고유 특성: </span>
                    {unit.specialAbility}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'enemies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(ENEMY_TYPES).map((enemy) => (
                <div
                  key={enemy.id}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
                        style={{
                          backgroundColor: `${enemy.color}25`,
                          border: `2px solid ${enemy.color}`,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: enemy.color }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 font-cinzel text-sm">
                          {enemy.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {enemy.isBoss ? '보스 몬스터' : enemy.isAir ? '공중 비행 유닛' : '지상 보병'}
                        </div>
                      </div>
                    </div>
                    <div className="text-amber-400 font-bold font-cinzel text-xs">
                      +{enemy.goldReward}G
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                    {enemy.description}
                  </p>

                  <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-2 rounded-lg text-center text-[10px] mb-2">
                    <div>
                      <div className="text-slate-400">기본 체력</div>
                      <div className="font-bold text-slate-200">{enemy.baseHp}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">이동 속도</div>
                      <div className="font-bold text-slate-200">{enemy.speed}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">물리 방어력</div>
                      <div className="font-bold text-slate-200">
                        {Math.round(enemy.armor * 100)}%
                      </div>
                    </div>
                  </div>

                  {enemy.specialTrait && (
                    <div className="text-[11px] bg-rose-950/30 border border-rose-900/40 rounded-lg p-2 text-rose-300">
                      <span className="font-bold">위협 요소: </span>
                      {enemy.specialTrait}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl">
                <h4 className="font-bold text-amber-400 text-sm mb-1">1. 원소 시너지와 감속 연계</h4>
                <p>
                  <strong>빙결 드루이드</strong>의 냉기 탄환으로 적의 이동속도를 늦추면, <strong>대마법사</strong>의 화염구와 <strong>비룡</strong>의 화염 브레스가 적에게 머무는 시간이 길어져 입히는 누적 피해량이 폭발적으로 상승합니다.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl">
                <h4 className="font-bold text-amber-400 text-sm mb-1">2. 성기사의 신성 오라</h4>
                <p>
                  <strong>성기사</strong>를 레벨 3으로 승급(각성)시키면 주변 반경에 있는 모든 가디언 영웅들의 공격력이 +25% 증가합니다. 딜러들이 밀집된 요충지에 성기사를 배치하여 화력을 극대화하세요.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl">
                <h4 className="font-bold text-amber-400 text-sm mb-1">3. 보스 및 하피 대응</h4>
                <p>
                  <strong>하피</strong>는 공중 유닛으로 지상 전용 근접 공격을 받지 않습니다. 엘프 궁수나 대마법사를 미리 육성해두어야 방어선이 뚫리지 않습니다. 체력이 높은 보스전에서는 <strong>그림자 암살자</strong>의 방어력 관통 독 공격과 <strong>메테오 스트라이크</strong>가 필수적입니다.
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl">
                <h4 className="font-bold text-amber-400 text-sm mb-1">4. 웨이브 즉시 호출 보너스</h4>
                <p>
                  자신이 있다면 다음 웨이브를 기다리지 않고 상단의 [즉시 호출] 버튼을 눌러 추가 보너스 골드를 챙기세요. 초반 스노우볼링에 큰 도움이 됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
