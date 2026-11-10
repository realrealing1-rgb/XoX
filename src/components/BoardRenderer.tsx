import React from 'react';
import {
  GameMove,
  GobbletSize,
  MatchState,
  Player,
} from '../game/types';
import { TAPATAN_ADJACENCY } from '../game/rules';
import { SymbolMark } from './GameIcons';

interface BoardRendererProps {
  state: MatchState;
  isAiThinking: boolean;
  onMove: (move: GameMove) => void;
  onSelectGobbletSize: (size: GobbletSize) => void;
  onSelectNumber: (num: number) => void;
  onSelectSOSLetter: (letter: 'S' | 'O') => void;
}

export function BoardRenderer({
  state,
  isAiThinking,
  onMove,
  onSelectGobbletSize,
  onSelectNumber,
  onSelectSOSLetter,
}: BoardRendererProps) {
  const winningSet = new Set(state.winningLine);
  const currentPlayer = state.currentTurn;

  // Render specialized board for Ultimate XoX (9 sub-boards of 3x3)
  if (state.gameId === 'ultimate-xox') {
    const subWinners = state.subWinners || Array(9).fill(null);
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-2">
        <div
          className="grid grid-cols-3 gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-2xl bg-[#241c15] border-2 border-[#5c4632] shadow-2xl w-full max-w-[500px] aspect-square"
          role="grid"
          aria-label="Süper XoX 9 Alt Tahta"
        >
          {Array.from({ length: 9 }, (_, subIdx) => {
            const subWinner = subWinners[subIdx];
            const isTargetSub =
              state.winner === null &&
              subWinner === null &&
              (state.activeSubBoard === null || state.activeSubBoard === subIdx);

            return (
              <div
                key={subIdx}
                className={`relative grid grid-cols-3 gap-1 p-1.5 rounded-xl border-2 transition-all ${
                  isTargetSub
                    ? 'bg-[#36291d] border-[#e89b3c] shadow-[0_0_16px_rgba(232,155,60,0.3)]'
                    : 'bg-[#17120d] border-[#33271c] opacity-55'
                }`}
              >
                {Array.from({ length: 9 }, (_, localIdx) => {
                  const globalIdx = subIdx * 9 + localIdx;
                  const cellVal = state.cells[globalIdx];
                  const isLast = state.lastMoveIndex === globalIdx;
                  const canClick =
                    !isAiThinking &&
                    state.winner === null &&
                    subWinner === null &&
                    isTargetSub &&
                    cellVal === null;

                  return (
                    <button
                      key={globalIdx}
                      type="button"
                      disabled={!canClick}
                      onClick={() => onMove({ index: globalIdx })}
                      aria-label={`Alt Tahta ${subIdx + 1} Kare ${localIdx + 1}${
                        cellVal ? ` (${cellVal})` : ''
                      }`}
                      className={`relative flex items-center justify-center rounded aspect-square transition-transform ${
                        isLast
                          ? 'bg-[#4d3a28] ring-1 ring-[#e89b3c]'
                          : isTargetSub
                          ? 'bg-[#261d15] hover:bg-[#3d2e21] border border-[#4a392a]'
                          : 'bg-[#1f1812]'
                      } ${canClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                    >
                      {cellVal && <SymbolMark symbol={cellVal} size="xs" />}
                    </button>
                  );
                })}

                {/* Overlay if sub-board is won or drawn */}
                {subWinner && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#18120de6] border border-[#6e553d]">
                    {subWinner === 'DRAW' ? (
                      <span className="font-mono-tabular text-xs font-bold text-[#a89886]">
                        BERABERE
                      </span>
                    ) : (
                      <SymbolMark symbol={subWinner} size="lg" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render specialized board for Dots & Boxes (3x3 boxes, 24 clickable edges)
  if (state.gameId === 'dots-boxes') {
    const edges = state.dotsEdges || Array(24).fill(null);
    const boxes = state.dotsBoxes || Array(9).fill(null);

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-2">
        <div
          className="relative p-6 sm:p-8 rounded-2xl bg-[#241c15] border-2 border-[#5c4632] shadow-2xl w-full max-w-[440px] aspect-square flex flex-col justify-between"
          role="region"
          aria-label="Kutu Kapmaca Tahtası"
        >
          {[0, 1, 2, 3].map((row) => (
            <React.Fragment key={row}>
              {/* Horizontal row of dots and horizontal edges */}
              <div className="flex items-center justify-between w-full">
                {[0, 1, 2, 3].map((col) => {
                  const hEdgeIdx = row * 3 + col;
                  const hOwner = col < 3 ? edges[hEdgeIdx] : null;
                  const isLast = state.lastMoveIndex === hEdgeIdx;
                  return (
                    <React.Fragment key={col}>
                      {/* Brass Peg Dot */}
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#d4a359] border-2 border-[#16120e] shadow-md shrink-0 z-10" />
                      {col < 3 && (
                        <button
                          type="button"
                          disabled={isAiThinking || state.winner !== null || hOwner !== null}
                          onClick={() => onMove({ index: hEdgeIdx })}
                          aria-label={`Yatay Çizgi Satır ${row + 1} Sütun ${col + 1}${
                            hOwner ? ` (${hOwner})` : ''
                          }`}
                          className={`h-4 sm:h-5 flex-1 mx-1 rounded-full transition-colors cursor-pointer ${
                            hOwner === 'X'
                              ? 'bg-[#e89b3c]'
                              : hOwner === 'O'
                              ? 'bg-[#38bdf8]'
                              : 'bg-[#382b20] hover:bg-[#6e553d]'
                          } ${isLast ? 'ring-2 ring-[#f5efe6]' : ''}`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Vertical edges and captured boxes for rows 0..2 */}
              {row < 3 && (
                <div className="flex items-stretch justify-between w-full flex-1 my-1">
                  {[0, 1, 2, 3].map((col) => {
                    const vEdgeIdx = 12 + row * 4 + col;
                    const vOwner = edges[vEdgeIdx];
                    const isLast = state.lastMoveIndex === vEdgeIdx;
                    const boxIdx = row * 3 + col;
                    const boxOwner = col < 3 ? boxes[boxIdx] : null;

                    return (
                      <React.Fragment key={col}>
                        <button
                          type="button"
                          disabled={isAiThinking || state.winner !== null || vOwner !== null}
                          onClick={() => onMove({ index: vEdgeIdx })}
                          aria-label={`Dikey Çizgi Satır ${row + 1} Sütun ${col + 1}${
                            vOwner ? ` (${vOwner})` : ''
                          }`}
                          className={`w-4 sm:w-5 h-full rounded-full transition-colors cursor-pointer ${
                            vOwner === 'X'
                              ? 'bg-[#e89b3c]'
                              : vOwner === 'O'
                              ? 'bg-[#38bdf8]'
                              : 'bg-[#382b20] hover:bg-[#6e553d]'
                          } ${isLast ? 'ring-2 ring-[#f5efe6]' : ''}`}
                        />
                        {col < 3 && (
                          <div
                            className={`flex-1 mx-2 my-1 rounded-xl flex items-center justify-center transition-colors ${
                              boxOwner === 'X'
                                ? 'bg-[#e89b3c]/20 border border-[#e89b3c]/50'
                                : boxOwner === 'O'
                                ? 'bg-[#38bdf8]/20 border border-[#38bdf8]/50'
                                : 'bg-[#1b1510]/60'
                            }`}
                          >
                            {boxOwner && <SymbolMark symbol={boxOwner} size="md" />}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Standard & Variant Grid Renderer (3x3, 4x4, 5x5, 6x6, 7x6, 9x9)
  const gridColsClass =
    state.cols === 3
      ? 'grid-cols-3 max-w-[390px]'
      : state.cols === 4
      ? 'grid-cols-4 max-w-[420px]'
      : state.cols === 5
      ? 'grid-cols-5 max-w-[440px]'
      : state.cols === 6
      ? 'grid-cols-6 max-w-[450px]'
      : state.cols === 7
      ? 'grid-cols-7 max-w-[500px]'
      : 'grid-cols-9 max-w-[510px]';

  const gapClass =
    state.cols >= 7 ? 'gap-1.5 sm:gap-2 p-2.5 sm:p-3.5' : 'gap-2.5 sm:gap-3 p-3.5 sm:p-4';

  // Oldest stones in Infinite XoX (will vanish on next placement by that player)
  const oldestX =
    state.gameId === 'infinite-xox' && (state.fifoQueues?.X.length || 0) >= 3
      ? state.fifoQueues!.X[0]
      : -1;
  const oldestO =
    state.gameId === 'infinite-xox' && (state.fifoQueues?.O.length || 0) >= 3
      ? state.fifoQueues!.O[0]
      : -1;

  // Tapatan legal destinations when a stone is selected
  const tapatanTargets =
    state.gameId === 'tapatan-xox' &&
    state.tapatanPhase === 'slide' &&
    state.selectedStoneIndex !== null &&
    state.selectedStoneIndex !== undefined
      ? new Set(
          (TAPATAN_ADJACENCY[state.selectedStoneIndex] || []).filter(
            (idx) => state.cells[idx] === null
          )
        )
      : new Set<number>();

  // Reversi legal moves set
  const reversiValidSet =
    state.gameId === 'reversi-xox'
      ? new Set(state.reversiValidMoves || [])
      : new Set<number>();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-3 px-2">
      {/* Sub-tool dock for Gobblet, Numeric 15, or SOS */}
      {state.gameId === 'gobblet-xox' && (
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#241c15] border border-[#5c4632]"
          role="group"
          aria-label="Gobblet Taş Boyutu Seçimi"
        >
          <span className="text-xs font-medium text-[#cbbba6] mr-1">
            {currentPlayer} Taş Boyutu:
          </span>
          {([1, 2, 3] as GobbletSize[]).map((sz) => {
            const count = state.gobbletReserve?.[currentPlayer]?.[sz] ?? 0;
            const isSelected = state.selectedGobbletSize === sz;
            const label = sz === 1 ? 'Küçük' : sz === 2 ? 'Orta' : 'Büyük';
            return (
              <button
                key={sz}
                type="button"
                disabled={count <= 0 || isAiThinking}
                onClick={() => onSelectGobbletSize(sz)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#e89b3c] text-[#16120e]'
                    : count > 0
                    ? 'bg-[#18120d] text-[#f5efe6] hover:bg-[#33271d]'
                    : 'bg-[#18120d]/40 text-[#786b5e] cursor-not-allowed'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {state.gameId === 'numeric-xox' && (
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#241c15] border border-[#5c4632]"
          role="group"
          aria-label="Sayı Seçimi"
        >
          <span className="text-xs font-medium text-[#cbbba6] mr-1">
            {currentPlayer} Sayı Havuzu:
          </span>
          {(state.availableNumbers?.[currentPlayer] || []).map((num) => {
            const isSelected = state.selectedNumber === num;
            return (
              <button
                key={num}
                type="button"
                disabled={isAiThinking}
                onClick={() => onSelectNumber(num)}
                aria-label={`Sayı ${num} Seç`}
                className={`w-9 h-9 rounded-lg font-mono-tabular text-sm font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#e89b3c] text-[#16120e] ring-2 ring-[#f5efe6]'
                    : 'bg-[#18120d] text-[#f5efe6] hover:bg-[#33271d]'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      )}

      {state.gameId === 'sos-xox' && (
        <div
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#241c15] border border-[#5c4632]"
          role="group"
          aria-label="SOS Harf Seçimi"
        >
          <span className="text-xs font-medium text-[#cbbba6]">
            Yerleştirilecek Harf ({currentPlayer}):
          </span>
          {(['S', 'O'] as const).map((letter) => {
            const currentChoice = state.sosLetterChoice?.[currentPlayer] || 'S';
            const isSelected = currentChoice === letter;
            return (
              <button
                key={letter}
                type="button"
                disabled={isAiThinking}
                onClick={() => onSelectSOSLetter(letter)}
                aria-label={`${letter} Harfini Seç`}
                className={`px-4 py-1.5 rounded-lg font-mono-tabular text-sm font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#e89b3c] text-[#16120e]'
                    : 'bg-[#18120d] text-[#f5efe6] hover:bg-[#33271d]'
                }`}
              >
                {letter} Harfi
              </button>
            );
          })}
        </div>
      )}

      {/* Main Grid Container */}
      <div
        className={`relative grid ${gridColsClass} ${gapClass} rounded-2xl bg-[#241c15] border-2 border-[#5c4632] shadow-2xl w-full ${
          state.gameId === 'connect4-xox' ? 'aspect-[7/6]' : 'aspect-square'
        }`}
        role="grid"
        aria-label="Oyun Tahtası"
      >
        {/* Tapatan Rail Lines Overlay */}
        {state.gameId === 'tapatan-xox' && (
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none p-8 opacity-35"
            aria-hidden="true"
          >
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="#d4a359" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="90" y2="90" stroke="#d4a359" strokeWidth="1.5" />
            <line x1="90" y1="10" x2="10" y2="90" stroke="#d4a359" strokeWidth="1.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#d4a359" strokeWidth="1.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#d4a359" strokeWidth="1.5" />
          </svg>
        )}
        {state.cells.map((cell, idx) => {
          const row = Math.floor(idx / state.cols) + 1;
          const col = (idx % state.cols) + 1;
          const isWinningCell = winningSet.has(idx);
          const isLastMove = state.lastMoveIndex === idx;
          const isFading = idx === oldestX || idx === oldestO;
          const isBlocked = cell === 'BLOCKED';

          // Determine clickability
          let canInteract = !isAiThinking && state.winner === null && !isBlocked;
          if (state.gameId === 'connect4-xox') {
            // In Connect 4, clicking anywhere in a column drops in that column if top cell is free
            const topOfCol = idx % 7;
            canInteract = canInteract && state.cells[topOfCol] === null;
          } else if (state.gameId === 'gobblet-xox') {
            const sz = state.selectedGobbletSize || 3;
            const reserveCount = state.gobbletReserve?.[currentPlayer]?.[sz] ?? 0;
            const stack = state.gobbletStacks?.[idx] || [];
            const topPiece = stack.length > 0 ? stack[stack.length - 1] : null;
            canInteract =
              canInteract && reserveCount > 0 && (!topPiece || topPiece.size < sz);
          } else if (state.gameId === 'tapatan-xox' && state.tapatanPhase === 'slide') {
            canInteract =
              canInteract && (cell === currentPlayer || tapatanTargets.has(idx));
          } else if (state.gameId === 'reversi-xox') {
            canInteract = canInteract && reversiValidSet.has(idx);
          } else {
            canInteract = canInteract && cell === null;
          }

          const isSelectedTapatanStone =
            state.gameId === 'tapatan-xox' && state.selectedStoneIndex === idx;
          const isTapatanTarget = tapatanTargets.has(idx);
          const isReversiHint = reversiValidSet.has(idx);

          return (
            <button
              key={idx}
              type="button"
              disabled={!canInteract}
              onClick={() =>
                onMove({
                  index: idx,
                  gobbletSize: state.selectedGobbletSize,
                  numberValue: state.selectedNumber,
                  sosLetter: state.sosLetterChoice?.[currentPlayer],
                })
              }
              aria-label={`Kare Satır ${row} Sütun ${col}${
                isBlocked ? ' (Kaya Engeli)' : cell ? ` (${cell})` : ''
              }`}
              className={`relative flex items-center justify-center rounded-xl transition-all ${
                isBlocked
                  ? 'bg-[#14110f] border border-[#3a332c] cursor-not-allowed'
                  : isWinningCell
                  ? 'bg-[#3d2e1b] ring-2 ring-[#e89b3c] shadow-[0_0_15px_rgba(232,155,60,0.35)]'
                  : isSelectedTapatanStone
                  ? 'bg-[#463525] ring-2 ring-[#e89b3c]'
                  : isTapatanTarget
                  ? 'bg-[#2c2219] ring-1 ring-dashed ring-[#e89b3c] hover:bg-[#3b2d21]'
                  : isLastMove
                  ? 'bg-[#36291e] ring-1 ring-[#d4a359]/60'
                  : 'bg-[#1a140f] hover:bg-[#2c2219] border border-[#382b20]'
              } ${canInteract ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
            >
              {/* Blocked Basalt Rock rendering */}
              {isBlocked && (
                <svg viewBox="0 0 32 32" className="w-3/5 h-3/5 text-[#78716c]" aria-hidden="true">
                  <polygon
                    points="16 3 28 10 24 27 8 27 4 10"
                    fill="#292524"
                    stroke="#57534e"
                    strokeWidth="2"
                  />
                  <path d="M10 14l6-4 6 5" stroke="#78716c" strokeWidth="1.5" fill="none" />
                </svg>
              )}

              {/* Gobblet nested piece rendering */}
              {state.gameId === 'gobblet-xox' && state.gobbletStacks && (
                <>
                  {state.gobbletStacks[idx].length > 0 && (() => {
                    const stack = state.gobbletStacks[idx];
                    const top = stack[stack.length - 1];
                    const ringSize =
                      top.size === 1
                        ? 'w-6 h-6 text-[10px]'
                        : top.size === 2
                        ? 'w-10 h-10 text-xs'
                        : 'w-14 h-14 text-sm';
                    const colorClass =
                      top.owner === 'X'
                        ? 'bg-[#e89b3c]/25 border-2 border-[#e89b3c] text-[#e89b3c]'
                        : 'bg-[#38bdf8]/25 border-2 border-[#38bdf8] text-[#38bdf8]';
                    return (
                      <div
                        className={`${ringSize} ${colorClass} rounded-full flex items-center justify-center font-mono-tabular font-bold animate-piece shadow-md`}
                      >
                        {top.owner}
                        <span className="text-[10px] ml-0.5 opacity-85">{top.size}</span>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Numeric XoX (1..9) rendering */}
              {state.gameId === 'numeric-xox' && cell !== null && (
                <div
                  className={`flex flex-col items-center justify-center animate-piece ${
                    state.numericOwners?.[idx] === 'X' ? 'text-[#e89b3c]' : 'text-[#38bdf8]'
                  }`}
                >
                  <span className="font-mono-tabular text-2xl sm:text-3xl font-bold leading-none">
                    {cell}
                  </span>
                  <span className="text-[10px] font-semibold opacity-75 mt-0.5">
                    {state.numericOwners?.[idx]}
                  </span>
                </div>
              )}

              {/* SOS Letter rendering */}
              {state.gameId === 'sos-xox' && cell !== null && (
                <span
                  className={`font-mono-tabular text-xl sm:text-2xl font-bold animate-piece ${
                    cell === 'S' ? 'text-[#e89b3c]' : 'text-[#38bdf8]'
                  }`}
                >
                  {cell}
                </span>
              )}

              {/* Standard X / O Symbol rendering for other games */}
              {state.gameId !== 'gobblet-xox' &&
                state.gameId !== 'numeric-xox' &&
                state.gameId !== 'sos-xox' &&
                (cell === 'X' || cell === 'O') && (
                  <SymbolMark
                    symbol={cell}
                    size={state.cols >= 7 ? 'sm' : state.cols >= 5 ? 'md' : 'lg'}
                    isFading={isFading}
                  />
                )}

              {/* Legal move indicator dot for Reversi or Tapatan slide target */}
              {(isReversiHint || isTapatanTarget) && cell === null && (
                <span
                  className={`w-3 h-3 rounded-full ${
                    currentPlayer === 'X' ? 'bg-[#e89b3c]/55' : 'bg-[#38bdf8]/55'
                  }`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
