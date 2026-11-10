import React from 'react';
import { GAME_CATALOG } from '../game/catalog';
import { Difficulty, GameId, PlayMode, PlayerStats } from '../game/types';
import { GameEmblemIcon, TahtaTitleEmblem } from './GameIcons';

interface TitleScreenProps {
  selectedGameId: GameId;
  playMode: PlayMode;
  difficulty: Difficulty;
  stats: PlayerStats;
  onSelectGame: (id: GameId) => void;
  onChangePlayMode: (mode: PlayMode) => void;
  onChangeDifficulty: (diff: Difficulty) => void;
  onStartGame: (gameId?: GameId) => void;
}

export function TitleScreen({
  selectedGameId,
  playMode,
  difficulty,
  stats,
  onSelectGame,
  onChangePlayMode,
  onChangeDifficulty,
  onStartGame,
}: TitleScreenProps) {
  const activeMeta =
    GAME_CATALOG.find((g) => g.id === selectedGameId) || GAME_CATALOG[0];

  return (
    <main className="w-full h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#16120e] text-[#f5efe6] overflow-y-auto">
      {/* Top Row: Emblem Lockup & Mode/Difficulty Selector */}
      <div className="w-full max-w-[1320px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#3a2d21]">
        <TahtaTitleEmblem />

        {/* Mode & AI Difficulty Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center p-1 rounded-xl bg-[#241c15] border border-[#4a392a]"
            role="group"
            aria-label="Oyun Modu Seçimi"
          >
            <button
              type="button"
              onClick={() => onChangePlayMode('ai')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                playMode === 'ai'
                  ? 'bg-[#e89b3c] text-[#16120e]'
                  : 'text-[#cbbba6] hover:text-[#f5efe6]'
              }`}
            >
              Yapay Zekaya Karşı
            </button>
            <button
              type="button"
              onClick={() => onChangePlayMode('local')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                playMode === 'local'
                  ? 'bg-[#e89b3c] text-[#16120e]'
                  : 'text-[#cbbba6] hover:text-[#f5efe6]'
              }`}
            >
              2 Oyuncu (Yan Yana)
            </button>
          </div>

          {playMode === 'ai' && (
            <div
              className="flex items-center p-1 rounded-xl bg-[#241c15] border border-[#4a392a]"
              role="group"
              aria-label="Zorluk Seviyesi"
            >
              {(['kolay', 'orta', 'uzman'] as Difficulty[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChangeDifficulty(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    difficulty === lvl
                      ? 'bg-[#38bdf8] text-[#0c151c]'
                      : 'text-[#cbbba6] hover:text-[#f5efe6]'
                  }`}
                >
                  {lvl === 'kolay' ? 'Kolay' : lvl === 'orta' ? 'Orta' : 'Uzman'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Split: 13-Game Grid Showcase (Left) + Selected Game Spotlight & Start CTA (Right) */}
      <div className="w-full max-w-[1320px] mx-auto my-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: 13 Games Interactive Collection Grid */}
        <section
          className="lg:col-span-8 flex flex-col justify-between"
          aria-label="13 XoX ve Strateji Oyunu Seçimi"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-[#f5efe6]">
              Oyun Koleksiyonu (13 Oyun)
            </h2>
            <div className="text-xs text-[#cbbba6] font-mono-tabular">
              Toplam Maç: {stats.played} · Galibiyet Serisi: {stats.currentStreak}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {GAME_CATALOG.map((game) => {
              const isSelected = game.id === selectedGameId;
              const wins = stats.perGameWins[game.id] || 0;
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => onSelectGame(game.id)}
                  onDoubleClick={() => onStartGame(game.id)}
                  className={`group text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                    isSelected
                      ? 'bg-[#2e2319] border-[#e89b3c] ring-1 ring-[#e89b3c]'
                      : 'bg-[#211912] border-[#3d2f22] hover:bg-[#2a2017] hover:border-[#6e553d]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="p-1.5 rounded-lg bg-[#16120e] text-[#e89b3c] border border-[#3a2d21] shrink-0">
                      <GameEmblemIcon gameId={game.id} className="w-5 h-5" />
                    </div>
                    <span className="font-mono-tabular text-[11px] text-[#a89886] whitespace-nowrap shrink-0">
                      {String(game.order).padStart(2, '0')} · {game.gridLabel}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="font-semibold text-sm text-[#f5efe6] truncate">
                      {game.name}
                    </div>
                    <div className="text-[11px] text-[#b8a793] flex items-center justify-between mt-0.5">
                      <span className="truncate">{game.winConditionLabel}</span>
                      {wins > 0 && (
                        <span className="font-mono-tabular text-[#e89b3c] ml-1 shrink-0">
                          {wins}G
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right 4 Cols: Selected Game Centerpiece Card & Primary Start Action */}
        <aside
          className="lg:col-span-4 rounded-2xl bg-[#231b14] border border-[#5c4632] p-5 sm:p-6 flex flex-col justify-between shadow-2xl"
          aria-label="Seçili Oyun Detayı"
        >
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#3a2d21]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#16120e] border border-[#4a392a]">
                  <GameEmblemIcon gameId={activeMeta.id} className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-mono-tabular text-[#e89b3c]">
                    OYUN #{String(activeMeta.order).padStart(2, '0')} · {activeMeta.gridLabel}
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#f5efe6]">
                    {activeMeta.name}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#dfd3c3] mt-3 leading-relaxed">
              {activeMeta.tagline}
            </p>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold text-[#cbbba6]">
                Temel Kurallar
              </div>
              <ul className="space-y-1.5 text-xs text-[#cbbba6] leading-relaxed">
                {activeMeta.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono-tabular text-[#e89b3c] font-bold">
                      {i + 1}.
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#18120d] border border-[#3a2d21] text-xs text-[#cbbba6]">
              <span className="font-semibold text-[#e89b3c]">Taktik İpucu: </span>
              {activeMeta.tacticalTip}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#3a2d21] flex flex-col gap-2.5">
            <button
              type="button"
              data-start="true"
              onClick={() => onStartGame(activeMeta.id)}
              className="w-full py-3.5 px-6 rounded-xl bg-[#e89b3c] hover:bg-[#f0a84e] active:scale-[0.99] text-[#16120e] font-bold text-base transition-all cursor-pointer shadow-lg whitespace-nowrap"
            >
              Oyuna Başla · {activeMeta.shortName}
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Safe Margin: Single Flat Inline Control Hint */}
      <div className="w-full max-w-[1320px] mx-auto pt-2 text-center text-xs text-[#a89886]">
        Fare Tıklaması ile Hamle Yap · Enter / Boşluk Başlat · G Hamleyi Geri Al · R Yeniden Başlat · P Duraklat
      </div>
    </main>
  );
}
