import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CATALOG, getGameMetadata } from './game/catalog';
import { applyMove, chooseAIMove, createInitialState } from './game/rules';
import {
  Difficulty,
  GameId,
  GameMove,
  GobbletSize,
  MatchState,
  PlayerStats,
  PlayMode,
  ShellState,
} from './game/types';
import { BoardRenderer } from './components/BoardRenderer';
import { GameEmblemIcon } from './components/GameIcons';
import { GameModals } from './components/GameModals';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './utils/sound';

const STATS_STORAGE_KEY = 'tahta_xox_collection_stats_v1';

const DEFAULT_STATS: PlayerStats = {
  played: 0,
  winsX: 0,
  winsO: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  perGameWins: {},
};

function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export default function App() {
  const [shellState, setShellState] = useState<ShellState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  });

  const [selectedGameId, setSelectedGameId] = useState<GameId>('classic-xox');
  const [playMode, setPlayMode] = useState<PlayMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('orta');
  const [matchState, setMatchState] = useState<MatchState>(() =>
    createInitialState('classic-xox')
  );
  const [history, setHistory] = useState<MatchState[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const aiTimeoutRef = useRef<number | null>(null);
  const gameoverTimeoutRef = useRef<number | null>(null);

  // Sync shellState to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = shellState;
  }, [shellState]);

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore storage errors
    }
  }, [stats]);

  // Match timer while in 'playing'
  useEffect(() => {
    if (shellState !== 'playing' || matchState.winner !== null) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [shellState, matchState.winner]);

  const clearPendingTimers = useCallback(() => {
    if (aiTimeoutRef.current !== null) {
      window.clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    if (gameoverTimeoutRef.current !== null) {
      window.clearTimeout(gameoverTimeoutRef.current);
      gameoverTimeoutRef.current = null;
    }
    setIsAiThinking(false);
  }, []);

  const recordMatchOutcome = useCallback(
    (winner: 'X' | 'O' | 'DRAW', gId: GameId) => {
      setStats((prev) => {
        const nextPlayed = prev.played + 1;
        const nextWinsX = winner === 'X' ? prev.winsX + 1 : prev.winsX;
        const nextWinsO = winner === 'O' ? prev.winsO + 1 : prev.winsO;
        const nextDraws = winner === 'DRAW' ? prev.draws + 1 : prev.draws;
        const nextStreak = winner === 'X' ? prev.currentStreak + 1 : 0;
        const nextBest = Math.max(prev.bestStreak, nextStreak);
        const nextPerGame = { ...prev.perGameWins };
        if (winner === 'X') {
          nextPerGame[gId] = (nextPerGame[gId] || 0) + 1;
        }
        return {
          played: nextPlayed,
          winsX: nextWinsX,
          winsO: nextWinsO,
          draws: nextDraws,
          currentStreak: nextStreak,
          bestStreak: nextBest,
          perGameWins: nextPerGame,
        };
      });
    },
    []
  );

  const startGame = useCallback(
    (targetGameId?: GameId) => {
      clearPendingTimers();
      const gId = targetGameId || selectedGameId;
      setSelectedGameId(gId);
      setMatchState(createInitialState(gId));
      setHistory([]);
      setElapsedSeconds(0);
      setShowRulesModal(false);
      document.body.dataset.state = 'playing';
      setShellState('playing');
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    [clearPendingTimers, selectedGameId]
  );

  const handleRestart = useCallback(() => {
    startGame(selectedGameId);
  }, [startGame, selectedGameId]);

  const handleNextGame = useCallback(() => {
    const idx = GAME_CATALOG.findIndex((g) => g.id === selectedGameId);
    const nextIdx = (idx + 1) % GAME_CATALOG.length;
    startGame(GAME_CATALOG[nextIdx].id);
  }, [selectedGameId, startGame]);

  const handleBackToTitle = useCallback(() => {
    clearPendingTimers();
    setShowRulesModal(false);
    document.body.dataset.state = 'title';
    setShellState('title');
  }, [clearPendingTimers]);

  const handleUndo = useCallback(() => {
    if (shellState !== 'playing' || history.length === 0) return;
    clearPendingTimers();
    // In AI mode, if it is X's turn and history has >= 2 snapshots, pop back to X's previous turn
    if (playMode === 'ai' && history.length >= 2) {
      const targetState = history[history.length - 2];
      setMatchState(targetState);
      setHistory((prev) => prev.slice(0, prev.length - 2));
    } else {
      const targetState = history[history.length - 1];
      setMatchState(targetState);
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  }, [shellState, history, playMode, clearPendingTimers]);

  const handleMove = useCallback(
    (move: GameMove) => {
      if (shellState !== 'playing' || isAiThinking || matchState.winner !== null) {
        return;
      }

      const nextState = applyMove(matchState, move);
      // If move only changed selectedStoneIndex (in Tapatan slide selection), update without pushing history
      if (
        nextState.moveCount === matchState.moveCount &&
        nextState.selectedStoneIndex !== matchState.selectedStoneIndex
      ) {
        setMatchState(nextState);
        return;
      }

      if (nextState === matchState) return; // Illegal move ignored

      soundEngine.playPlace(matchState.currentTurn);
      setHistory((prev) => [...prev, matchState]);
      setMatchState(nextState);

      if (nextState.winner !== null) {
        recordMatchOutcome(nextState.winner, nextState.gameId);
        if (nextState.winner === 'X') {
          soundEngine.playVictory();
        } else {
          soundEngine.playDefeatOrDraw();
        }
        gameoverTimeoutRef.current = window.setTimeout(() => {
          document.body.dataset.state = 'gameover';
          setShellState('gameover');
        }, 420);
      }
    },
    [shellState, isAiThinking, matchState, recordMatchOutcome]
  );

  // Trigger AI Bot turn automatically when it is O's turn in 'ai' mode
  useEffect(() => {
    if (
      shellState !== 'playing' ||
      playMode !== 'ai' ||
      matchState.winner !== null ||
      matchState.currentTurn !== 'O'
    ) {
      return;
    }

    setIsAiThinking(true);
    aiTimeoutRef.current = window.setTimeout(() => {
      const aiMove = chooseAIMove(matchState, difficulty);
      setIsAiThinking(false);
      if (!aiMove) return;

      const afterAi = applyMove(matchState, aiMove);
      soundEngine.playPlace('O');
      setHistory((prev) => [...prev, matchState]);
      setMatchState(afterAi);

      if (afterAi.winner !== null) {
        recordMatchOutcome(afterAi.winner, afterAi.gameId);
        if (afterAi.winner === 'X') {
          soundEngine.playVictory();
        } else {
          soundEngine.playDefeatOrDraw();
        }
        gameoverTimeoutRef.current = window.setTimeout(() => {
          document.body.dataset.state = 'gameover';
          setShellState('gameover');
        }, 420);
      }
    }, 360);

    return () => {
      if (aiTimeoutRef.current !== null) {
        window.clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
  }, [shellState, playMode, difficulty, matchState, recordMatchOutcome]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (shellState === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startGame(selectedGameId);
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (showRulesModal) {
          setShowRulesModal(false);
          return;
        }
        if (shellState === 'playing') {
          document.body.dataset.state = 'paused';
          setShellState('paused');
        } else if (shellState === 'paused') {
          document.body.dataset.state = 'playing';
          setShellState('playing');
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (shellState === 'playing' || shellState === 'gameover') {
          e.preventDefault();
          handleRestart();
        }
      } else if (e.key === 'g' || e.key === 'G') {
        if (shellState === 'playing') {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMuted((prev) => {
          const next = !prev;
          soundEngine.muted = next;
          return next;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shellState, selectedGameId, showRulesModal, startGame, handleRestart, handleUndo]);

  const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setMuted((prev) => {
      const next = !prev;
      soundEngine.muted = next;
      return next;
    });
  };

  if (shellState === 'title') {
    return (
      <TitleScreen
        selectedGameId={selectedGameId}
        playMode={playMode}
        difficulty={difficulty}
        stats={stats}
        onSelectGame={setSelectedGameId}
        onChangePlayMode={setPlayMode}
        onChangeDifficulty={setDifficulty}
        onStartGame={startGame}
      />
    );
  }

  const activeMeta = getGameMetadata(matchState.gameId);

  // Extract auxiliary score counters for SOS, Dots & Boxes, or Reversi
  const scoreX =
    matchState.gameId === 'sos-xox'
      ? matchState.sosScores?.X ?? 0
      : matchState.gameId === 'dots-boxes'
      ? matchState.dotsScores?.X ?? 0
      : matchState.gameId === 'reversi-xox'
      ? matchState.reversiScores?.X ?? 2
      : stats.winsX;

  const scoreO =
    matchState.gameId === 'sos-xox'
      ? matchState.sosScores?.O ?? 0
      : matchState.gameId === 'dots-boxes'
      ? matchState.dotsScores?.O ?? 0
      : matchState.gameId === 'reversi-xox'
      ? matchState.reversiScores?.O ?? 2
      : stats.winsO;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#16120e] text-[#f5efe6] overflow-hidden select-none">
      {/* Unified Top Perimeter HUD Strip */}
      <div className="w-full px-3 sm:px-6 py-2.5 bg-[#201812] border-b border-[#3d2f22] flex items-center justify-between gap-3 shrink-0">
        {/* Left Cluster: Active Game Switcher & Back to Collection */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleBackToTitle}
            aria-label="Oyun Koleksiyonu Ana Ekranı"
            className="px-3 py-1.5 rounded-xl bg-[#16120e] hover:bg-[#2c2219] border border-[#4a392a] text-xs font-semibold text-[#cbbba6] hover:text-[#f5efe6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            ← 13 Oyun
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex p-1.5 rounded-lg bg-[#16120e] text-[#e89b3c] border border-[#3d2f22] shrink-0">
              <GameEmblemIcon gameId={activeMeta.id} className="w-5 h-5" />
            </div>
            <label htmlFor="active-game-select" className="sr-only">
              Oyun Seçin
            </label>
            <select
              id="active-game-select"
              aria-label="Aktif Oyunu Değiştir"
              value={matchState.gameId}
              onChange={(e) => startGame(e.target.value as GameId)}
              className="bg-[#16120e] text-[#f5efe6] font-display font-bold text-sm sm:text-base px-3 py-1.5 rounded-xl border border-[#5c4632] focus:outline-none focus:border-[#e89b3c] cursor-pointer truncate max-w-[190px] sm:max-w-[260px]"
            >
              {GAME_CATALOG.map((g) => (
                <option key={g.id} value={g.id}>
                  {String(g.order).padStart(2, '0')}. {g.name} ({g.gridLabel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Cluster: Turn & Live Score Readout (Tabular Numerals) */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Player X Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-colors ${
              matchState.currentTurn === 'X' && matchState.winner === null
                ? 'bg-[#2e2216] border-[#e89b3c]'
                : 'bg-[#16120e] border-[#382b20] opacity-75'
            }`}
          >
            <span className="font-mono-tabular font-bold text-sm text-[#e89b3c]">
              X (Sen)
            </span>
            <span className="font-mono-tabular text-base font-bold text-[#f5efe6]">
              {Math.round(scoreX)}
            </span>
          </div>

          {/* Move Counter */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-[10px] tracking-wider text-[#a89886]">HAMLE</span>
            <span className="font-mono-tabular text-sm font-bold text-[#f5efe6]">
              {Math.round(matchState.moveCount)}
            </span>
          </div>

          {/* Player O Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-colors ${
              matchState.currentTurn === 'O' && matchState.winner === null
                ? 'bg-[#15232b] border-[#38bdf8]'
                : 'bg-[#16120e] border-[#382b20] opacity-75'
            }`}
          >
            <span className="font-mono-tabular font-bold text-sm text-[#38bdf8]">
              O ({playMode === 'ai' ? `Bot · ${difficulty.toUpperCase()}` : '2. Oyuncu'})
            </span>
            <span className="font-mono-tabular text-base font-bold text-[#f5efe6]">
              {Math.round(scoreO)}
            </span>
          </div>
        </div>

        {/* Right Cluster: Compact Utility Icon Buttons (Undo [G], Rules [?], Mute [M], Restart [R], Pause [P]) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            tabIndex={-1}
            disabled={history.length === 0 || isAiThinking}
            onClick={(e) => {
              e.currentTarget.blur();
              handleUndo();
            }}
            aria-label="Hamleyi Geri Al"
            title="Hamleyi Geri Al [G]"
            className="w-9 h-9 rounded-xl bg-[#16120e] hover:bg-[#2c2219] disabled:opacity-40 border border-[#4a392a] flex items-center justify-center text-[#f5efe6] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              setShowRulesModal(true);
            }}
            aria-label="Oyun Kuralları"
            title="Nasıl Oynanır?"
            className="w-9 h-9 rounded-xl bg-[#16120e] hover:bg-[#2c2219] border border-[#4a392a] flex items-center justify-center text-[#e89b3c] font-mono-tabular font-bold text-sm cursor-pointer"
          >
            ?
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={toggleMute}
            aria-label={muted ? 'Sesi Aç' : 'Sesi Kapat'}
            title="Ses Aç/Kapat [M]"
            className="w-9 h-9 rounded-xl bg-[#16120e] hover:bg-[#2c2219] border border-[#4a392a] flex items-center justify-center text-[#f5efe6] cursor-pointer"
          >
            {muted ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              handleRestart();
            }}
            aria-label="Yeniden Başlat"
            title="Yeniden Başlat [R]"
            className="w-9 h-9 rounded-xl bg-[#16120e] hover:bg-[#2c2219] border border-[#4a392a] flex items-center justify-center text-[#f5efe6] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" />
              <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              document.body.dataset.state = 'paused';
              setShellState('paused');
            }}
            aria-label="Oyunu Duraklat"
            title="Duraklat [P]"
            className="w-9 h-9 rounded-xl bg-[#16120e] hover:bg-[#2c2219] border border-[#4a392a] flex items-center justify-center text-[#f5efe6] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Central Playfield Area (>= 85% Clear Tabletop Arena) */}
      <main className="flex-1 w-full flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Live Status & Rule Banner */}
        <div
          className="mb-2 px-4 py-1.5 rounded-xl bg-[#201812] border border-[#3d2f22] text-xs sm:text-sm font-medium text-[#dfd3c3] text-center max-w-xl truncate"
          aria-live="polite"
        >
          {isAiThinking ? 'Yapay Zeka (O) hamlesini hesaplıyor...' : matchState.statusMessage}
        </div>

        <div className="flex-1 w-full flex items-center justify-center min-h-0">
          <BoardRenderer
            state={matchState}
            isAiThinking={isAiThinking}
            onMove={handleMove}
            onSelectGobbletSize={(sz: GobbletSize) =>
              setMatchState((prev) => ({ ...prev, selectedGobbletSize: sz }))
            }
            onSelectNumber={(num: number) =>
              setMatchState((prev) => ({ ...prev, selectedNumber: num }))
            }
            onSelectSOSLetter={(letter: 'S' | 'O') =>
              setMatchState((prev) => ({
                ...prev,
                sosLetterChoice: {
                  ...(prev.sosLetterChoice || { X: 'S', O: 'S' }),
                  [prev.currentTurn]: letter,
                },
              }))
            }
          />
        </div>
      </main>

      {/* Bottom Quick-Switch Game Ribbon */}
      <div
        className="w-full px-2 sm:px-4 py-2 bg-[#201812] border-t border-[#3d2f22] flex items-center justify-start xl:justify-center gap-1 overflow-x-auto shrink-0"
        role="navigation"
        aria-label="Hızlı Oyun Geçiş Çubuğu"
      >
        {GAME_CATALOG.map((g) => {
          const isCurrent = g.id === matchState.gameId;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => startGame(g.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isCurrent
                  ? 'bg-[#e89b3c] text-[#16120e] font-bold'
                  : 'bg-[#16120e] text-[#cbbba6] hover:text-[#f5efe6] hover:bg-[#2c2219] border border-[#382b20]'
              }`}
            >
              {String(g.order).padStart(2, '0')}. {g.shortName}
            </button>
          );
        })}
      </div>

      {/* Focused Status Modals (Paused / Game Over / Rules) */}
      <GameModals
        shellState={shellState}
        showRulesModal={showRulesModal}
        gameId={matchState.gameId}
        winner={matchState.winner}
        moveCount={matchState.moveCount}
        elapsedSeconds={elapsedSeconds}
        stats={stats}
        onResume={() => {
          document.body.dataset.state = 'playing';
          setShellState('playing');
        }}
        onRestart={handleRestart}
        onNextGame={handleNextGame}
        onBackToTitle={handleBackToTitle}
        onCloseRules={() => setShowRulesModal(false)}
      />
    </div>
  );
}
