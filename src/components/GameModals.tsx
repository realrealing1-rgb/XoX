import React from 'react';
import { getGameMetadata } from '../game/catalog';
import { GameId, Player, PlayerStats, ShellState } from '../game/types';

interface GameModalsProps {
  shellState: ShellState;
  showRulesModal: boolean;
  gameId: GameId;
  winner: Player | 'DRAW' | null;
  moveCount: number;
  elapsedSeconds: number;
  stats: PlayerStats;
  onResume: () => void;
  onRestart: () => void;
  onNextGame: () => void;
  onBackToTitle: () => void;
  onCloseRules: () => void;
}

export function GameModals({
  shellState,
  showRulesModal,
  gameId,
  winner,
  moveCount,
  elapsedSeconds,
  stats,
  onResume,
  onRestart,
  onNextGame,
  onBackToTitle,
  onCloseRules,
}: GameModalsProps) {
  const meta = getGameMetadata(gameId);

  if (shellState === 'paused') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0a07]/85"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-modal-title"
      >
        <div className="w-full max-w-md rounded-2xl bg-[#241c15] border-2 border-[#5c4632] p-6 shadow-2xl text-[#f5efe6]">
          <div className="text-xs font-mono-tabular text-[#e89b3c]">
            OYUN DURAKLATILDI
          </div>
          <h2 id="pause-modal-title" className="font-display text-2xl font-bold mt-1">
            {meta.name}
          </h2>
          <p className="text-xs text-[#cbbba6] mt-1">{meta.tagline}</p>

          <div className="grid grid-cols-3 gap-2.5 my-5">
            <div className="p-3 rounded-xl bg-[#18120d] border border-[#3a2d21]">
              <div className="text-[11px] text-[#a89886]">HAMLE</div>
              <div className="font-mono-tabular text-xl font-bold text-[#f5efe6] mt-0.5">
                {Math.round(moveCount)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#18120d] border border-[#3a2d21]">
              <div className="text-[11px] text-[#a89886]">SÜRE</div>
              <div className="font-mono-tabular text-xl font-bold text-[#f5efe6] mt-0.5">
                {Math.round(elapsedSeconds)}sn
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#18120d] border border-[#3a2d21]">
              <div className="text-[11px] text-[#a89886]">SERİ</div>
              <div className="font-mono-tabular text-xl font-bold text-[#e89b3c] mt-0.5">
                {Math.round(stats.currentStreak)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 px-4 rounded-xl bg-[#e89b3c] hover:bg-[#f0a84e] text-[#16120e] font-bold text-sm transition-colors cursor-pointer"
            >
              Oyuna Devam Et
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 px-4 rounded-xl bg-[#32261c] hover:bg-[#413225] text-[#f5efe6] font-semibold text-sm border border-[#5c4632] transition-colors cursor-pointer"
            >
              Tahtayı Sıfırla (Yeniden Başlat)
            </button>
            <button
              type="button"
              onClick={onBackToTitle}
              className="w-full py-2.5 px-4 rounded-xl bg-[#18120d] hover:bg-[#281f17] text-[#cbbba6] font-medium text-sm border border-[#3a2d21] transition-colors cursor-pointer"
            >
              Oyun Koleksiyonuna Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (shellState === 'gameover') {
    const isVictoryX = winner === 'X';
    const isDraw = winner === 'DRAW';
    const headline = isDraw
      ? 'Karşılaşma Berabere!'
      : `${winner} Oyuncusu Kazandı!`;
    const badgeText = isDraw
      ? 'DENGELİ MÜCADELE'
      : isVictoryX
      ? 'ZAFER · X OYUNCUSU'
      : 'ZAFER · O OYUNCUSU';

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0a07]/85"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-modal-title"
      >
        <div className="w-full max-w-md rounded-2xl bg-[#241c15] border-2 border-[#e89b3c] p-6 shadow-2xl text-[#f5efe6]">
          <div className="text-xs font-mono-tabular text-[#e89b3c] font-semibold">
            {badgeText}
          </div>
          <h2 id="gameover-modal-title" className="font-display text-2xl font-bold mt-1">
            {headline}
          </h2>
          <p className="text-xs text-[#cbbba6] mt-1">
            {meta.name} · {meta.winConditionLabel}
          </p>

          <div className="grid grid-cols-3 gap-2.5 my-5">
            <div className="p-3 rounded-xl bg-[#18120d] border border-[#3a2d21]">
              <div className="text-[11px] text-[#a89886]">HAMLE SAYISI</div>
              <div className="font-mono-tabular text-xl font-bold text-[#f5efe6] mt-0.5">
                {Math.round(moveCount)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#18120d] border border-[#3a2d21]">
              <div className="text-[11px] text-[#a89886]">MAÇ SÜRESİ</div>
              <div className="font-mono-tabular text-xl font-bold text-[#f5efe6] mt-0.5">
                {Math.round(elapsedSeconds)}sn
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#18120d] border border-[#3a2d21]">
              <div className="text-[11px] text-[#a89886]">SKOR (X - O)</div>
              <div className="font-mono-tabular text-xl font-bold text-[#e89b3c] mt-0.5">
                {stats.winsX}-{stats.winsO}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-3 px-4 rounded-xl bg-[#e89b3c] hover:bg-[#f0a84e] text-[#16120e] font-bold text-sm transition-colors cursor-pointer"
            >
              Tekrar Oyna
            </button>
            <button
              type="button"
              onClick={onNextGame}
              className="w-full py-2.5 px-4 rounded-xl bg-[#32261c] hover:bg-[#413225] text-[#f5efe6] font-semibold text-sm border border-[#5c4632] transition-colors cursor-pointer"
            >
              Sonraki Oyuna Geç
            </button>
            <button
              type="button"
              onClick={onBackToTitle}
              className="w-full py-2.5 px-4 rounded-xl bg-[#18120d] hover:bg-[#281f17] text-[#cbbba6] font-medium text-sm border border-[#3a2d21] transition-colors cursor-pointer"
            >
              Oyun Koleksiyonu (Ana Ekran)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showRulesModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0a07]/85"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
      >
        <div className="w-full max-w-md rounded-2xl bg-[#241c15] border-2 border-[#5c4632] p-6 shadow-2xl text-[#f5efe6]">
          <div className="text-xs font-mono-tabular text-[#e89b3c]">
            NASIL OYNANIR? · {meta.gridLabel}
          </div>
          <h2 id="rules-modal-title" className="font-display text-2xl font-bold mt-1">
            {meta.name}
          </h2>
          <p className="text-xs text-[#cbbba6] mt-1">{meta.tagline}</p>

          <ul className="space-y-2.5 my-4 text-xs text-[#dfd3c3] leading-relaxed">
            {meta.rules.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono-tabular font-bold text-[#e89b3c]">
                  {idx + 1}.
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>

          <div className="p-3 rounded-xl bg-[#18120d] border border-[#3a2d21] text-xs text-[#cbbba6] mb-5">
            <span className="font-semibold text-[#e89b3c]">Strateji İpucu: </span>
            {meta.tacticalTip}
          </div>

          <button
            type="button"
            onClick={onCloseRules}
            className="w-full py-2.5 px-4 rounded-xl bg-[#e89b3c] hover:bg-[#f0a84e] text-[#16120e] font-bold text-sm transition-colors cursor-pointer"
          >
            Anladım, Oyuna Dön
          </button>
        </div>
      </div>
    );
  }

  return null;
}
