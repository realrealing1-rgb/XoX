import {
  Difficulty,
  GameId,
  GameMove,
  GobbletPiece,
  GobbletSize,
  MatchState,
  Player,
  SOSLine,
} from './types';

export function getOpponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Helper to generate all k-in-a-row line index arrays for a grid of (rows x cols)
 */
export function generateLines(rows: number, cols: number, k: number): number[][] {
  const lines: number[][] = [];
  // Horizontal
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols - k; c++) {
      const line: number[] = [];
      for (let i = 0; i < k; i++) line.push(r * cols + (c + i));
      lines.push(line);
    }
  }
  // Vertical
  for (let r = 0; r <= rows - k; r++) {
    for (let c = 0; c < cols; c++) {
      const line: number[] = [];
      for (let i = 0; i < k; i++) line.push((r + i) * cols + c);
      lines.push(line);
    }
  }
  // Diagonal down-right
  for (let r = 0; r <= rows - k; r++) {
    for (let c = 0; c <= cols - k; c++) {
      const line: number[] = [];
      for (let i = 0; i < k; i++) line.push((r + i) * cols + (c + i));
      lines.push(line);
    }
  }
  // Diagonal up-right
  for (let r = k - 1; r < rows; r++) {
    for (let c = 0; c <= cols - k; c++) {
      const line: number[] = [];
      for (let i = 0; i < k; i++) line.push((r - i) * cols + (c + i));
      lines.push(line);
    }
  }
  return lines;
}

const LINES_3X3 = generateLines(3, 3, 3);
const LINES_4X4_3 = generateLines(4, 4, 3);
const LINES_5X5_4 = generateLines(5, 5, 4);
const LINES_7X6_4 = generateLines(6, 7, 4);
const LINES_9X9_5 = generateLines(9, 9, 5);

export function checkKInARow(
  cells: (string | null)[],
  lines: number[][]
): { winner: Player | null; line: number[] } {
  for (const line of lines) {
    const first = cells[line[0]];
    if (first !== 'X' && first !== 'O') continue;
    let allMatch = true;
    for (let i = 1; i < line.length; i++) {
      if (cells[line[i]] !== first) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) {
      return { winner: first, line };
    }
  }
  return { winner: null, line: [] };
}

/**
 * Tapatan (3x3) adjacency graph:
 * Center (4) connects to all 8 perimeter cells.
 * Perimeter cells connect orthogonally along the outer ring.
 */
export const TAPATAN_ADJACENCY: Record<number, number[]> = {
  0: [1, 3, 4],
  1: [0, 2, 4],
  2: [1, 5, 4],
  3: [0, 6, 4],
  4: [0, 1, 2, 3, 5, 6, 7, 8],
  5: [2, 8, 4],
  6: [3, 7, 4],
  7: [6, 8, 4],
  8: [5, 7, 4],
};

/**
 * Dots & Boxes (3x3 boxes):
 * 24 edges total:
 * - Indices 0..11: Horizontal edges (4 rows of 3 edges: row 0..3, col 0..2 -> idx = row * 3 + col)
 * - Indices 12..23: Vertical edges (3 rows of 4 edges: row 0..2, col 0..3 -> idx = 12 + row * 4 + col)
 * For each box (br = 0..2, bc = 0..2, boxIdx = br * 3 + bc):
 * Top edge = br * 3 + bc
 * Bottom edge = (br + 1) * 3 + bc
 * Left edge = 12 + br * 4 + bc
 * Right edge = 12 + br * 4 + bc + 1
 */
export function getBoxEdges(boxIndex: number): [number, number, number, number] {
  const br = Math.floor(boxIndex / 3);
  const bc = boxIndex % 3;
  const top = br * 3 + bc;
  const bottom = (br + 1) * 3 + bc;
  const left = 12 + br * 4 + bc;
  const right = 12 + br * 4 + (bc + 1);
  return [top, bottom, left, right];
}

/**
 * Reversi (6x6) helper to find flipped opponent indices if `player` places at `index`
 */
export function getReversiFlips(
  cells: (string | null)[],
  index: number,
  player: Player
): number[] {
  if (cells[index] !== null) return [];
  const opp = getOpponent(player);
  const r0 = Math.floor(index / 6);
  const c0 = index % 6;
  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  const flips: number[] = [];

  for (const [dr, dc] of dirs) {
    const lineFlips: number[] = [];
    let r = r0 + dr;
    let c = c0 + dc;
    while (r >= 0 && r < 6 && c >= 0 && c < 6) {
      const idx = r * 6 + c;
      if (cells[idx] === opp) {
        lineFlips.push(idx);
      } else if (cells[idx] === player) {
        if (lineFlips.length > 0) {
          flips.push(...lineFlips);
        }
        break;
      } else {
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return flips;
}

export function getAllReversiValidMoves(cells: (string | null)[], player: Player): number[] {
  const valid: number[] = [];
  for (let i = 0; i < 36; i++) {
    if (getReversiFlips(cells, i, player).length > 0) {
      valid.push(i);
    }
  }
  return valid;
}

/**
 * Create initial state for any of the 13 games
 */
export function createInitialState(gameId: GameId): MatchState {
  switch (gameId) {
    case 'classic-xox':
      return {
        gameId,
        rows: 3,
        cols: 3,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · Üçlü hiza kurun',
        cells: Array(9).fill(null),
        lastMoveIndex: null,
      };

    case 'infinite-xox':
      return {
        gameId,
        rows: 3,
        cols: 3,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · Tahtada en fazla 3 taşınız kalır',
        cells: Array(9).fill(null),
        fifoQueues: { X: [], O: [] },
        lastMoveIndex: null,
      };

    case 'ultimate-xox':
      return {
        gameId,
        rows: 9,
        cols: 9,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · İstediğiniz alt tahtadan başlayın',
        cells: Array(81).fill(null),
        subWinners: Array(9).fill(null),
        activeSubBoard: null,
        lastMoveIndex: null,
      };

    case 'gobblet-xox':
      return {
        gameId,
        rows: 3,
        cols: 3,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · Taş boyutu seçip yerleştirin',
        cells: Array(9).fill(null),
        gobbletStacks: Array.from({ length: 9 }, () => []),
        gobbletReserve: {
          X: { 1: 2, 2: 2, 3: 2 },
          O: { 1: 2, 2: 2, 3: 2 },
        },
        selectedGobbletSize: 3,
        lastMoveIndex: null,
      };

    case 'numeric-xox':
      return {
        gameId,
        rows: 3,
        cols: 3,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X (Tek Sayılar) · Toplamı 15 olan çizgi kazanır',
        cells: Array(9).fill(null),
        numericOwners: Array(9).fill(null),
        availableNumbers: {
          X: [1, 3, 5, 7, 9],
          O: [2, 4, 6, 8],
        },
        selectedNumber: 5,
        lastMoveIndex: null,
      };

    case 'tapatan-xox':
      return {
        gameId,
        rows: 3,
        cols: 3,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Yerleştirme Aşaması (1/6) · X taşını koyun',
        cells: Array(9).fill(null),
        tapatanPhase: 'drop',
        selectedStoneIndex: null,
        lastMoveIndex: null,
      };

    case 'misere-xox':
      return {
        gameId,
        rows: 4,
        cols: 4,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Dikkat: 3’lü hiza yapan KAYBEDER!',
        cells: Array(16).fill(null),
        lastMoveIndex: null,
      };

    case 'connect4-xox':
      return {
        gameId,
        rows: 6,
        cols: 7,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · Sütun seçip taş bırakın',
        cells: Array(42).fill(null),
        lastMoveIndex: null,
      };

    case 'obstacle-xox': {
      const cells = Array(25).fill(null);
      // Deterministic balanced obstacle rocks at indices 6, 12, 18
      cells[6] = 'BLOCKED';
      cells[12] = 'BLOCKED';
      cells[18] = 'BLOCKED';
      return {
        gameId,
        rows: 5,
        cols: 5,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · Kayaların etrafından 4’lü hiza kurun',
        cells,
        lastMoveIndex: null,
      };
    }

    case 'gomoku-xox':
      return {
        gameId,
        rows: 9,
        cols: 9,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · 5 taşı kesintisiz hizalayın',
        cells: Array(81).fill(null),
        lastMoveIndex: null,
      };

    case 'sos-xox':
      return {
        gameId,
        rows: 5,
        cols: 5,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · S veya O harfi yerleştirin',
        cells: Array(25).fill(null),
        sosLetterChoice: { X: 'S', O: 'S' },
        sosScores: { X: 0, O: 0 },
        sosLines: [],
        lastMoveIndex: null,
      };

    case 'dots-boxes':
      return {
        gameId,
        rows: 3,
        cols: 3,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · Noktalar arasına çizgi çekin',
        cells: Array(9).fill(null),
        dotsEdges: Array(24).fill(null),
        dotsBoxes: Array(9).fill(null),
        dotsScores: { X: 0, O: 0 },
        lastMoveIndex: null,
      };

    case 'reversi-xox': {
      const cells: (string | null)[] = Array(36).fill(null);
      // Center 2x2 starting pattern on 6x6 board: rows 2,3 and cols 2,3
      cells[2 * 6 + 2] = 'O';
      cells[2 * 6 + 3] = 'X';
      cells[3 * 6 + 2] = 'X';
      cells[3 * 6 + 3] = 'O';
      const validMoves = getAllReversiValidMoves(cells, 'X');
      return {
        gameId,
        rows: 6,
        cols: 6,
        currentTurn: 'X',
        winner: null,
        winningLine: [],
        moveCount: 0,
        statusMessage: 'Sıra X oyuncusunda · İşaretli karelere taş koyarak kıskaca alın',
        cells,
        reversiValidMoves: validMoves,
        reversiScores: { X: 2, O: 2 },
        lastMoveIndex: null,
      };
    }
  }
}

/**
 * Apply a player or AI move and return a brand new immutable MatchState
 */
export function applyMove(state: MatchState, move: GameMove): MatchState {
  if (state.winner !== null) return state;

  const player = state.currentTurn;
  const nextPlayer = getOpponent(player);

  switch (state.gameId) {
    case 'classic-xox': {
      if (move.index < 0 || move.index >= 9 || state.cells[move.index] !== null) {
        return state;
      }
      const cells = [...state.cells];
      cells[move.index] = player;
      const moveCount = state.moveCount + 1;
      const { winner, line } = checkKInARow(cells, LINES_3X3);
      const isDraw = !winner && cells.every((c) => c !== null);
      const finalWinner = winner ? winner : isDraw ? 'DRAW' : null;
      return {
        ...state,
        cells,
        moveCount,
        currentTurn: finalWinner ? player : nextPlayer,
        winner: finalWinner,
        winningLine: line,
        lastMoveIndex: move.index,
        statusMessage: winner
          ? `${winner} Oyuncusu 3’lü Hiza ile Kazandı!`
          : isDraw
          ? 'Tahta Doldu · Oyun Berabere!'
          : `Sıra ${nextPlayer} oyuncusunda`,
      };
    }

    case 'infinite-xox': {
      if (move.index < 0 || move.index >= 9 || state.cells[move.index] !== null) {
        return state;
      }
      const cells = [...state.cells];
      const queues = {
        X: [...(state.fifoQueues?.X || [])],
        O: [...(state.fifoQueues?.O || [])],
      };
      // If current player already has 3 stones on board, remove their oldest stone first
      if (queues[player].length >= 3) {
        const oldestIdx = queues[player].shift()!;
        cells[oldestIdx] = null;
      }
      cells[move.index] = player;
      queues[player].push(move.index);

      const moveCount = state.moveCount + 1;
      const { winner, line } = checkKInARow(cells, LINES_3X3);
      return {
        ...state,
        cells,
        fifoQueues: queues,
        moveCount,
        currentTurn: winner ? player : nextPlayer,
        winner: winner || null,
        winningLine: line,
        lastMoveIndex: move.index,
        statusMessage: winner
          ? `${winner} Oyuncusu Sonsuz XoX’u Kazandı!`
          : `Sıra ${nextPlayer} oyuncusunda · En eski taş halkayla işaretli`,
      };
    }

    case 'ultimate-xox': {
      if (move.index < 0 || move.index >= 81 || state.cells[move.index] !== null) {
        return state;
      }
      const subBoardIdx = Math.floor(move.index / 9);
      const localCellIdx = move.index % 9;
      const subWinners = [...(state.subWinners || Array(9).fill(null))];

      // Validate sub-board constraint
      if (subWinners[subBoardIdx] !== null) return state;
      if (state.activeSubBoard !== null && state.activeSubBoard !== undefined && state.activeSubBoard !== subBoardIdx) {
        return state;
      }

      const cells = [...state.cells];
      cells[move.index] = player;
      const moveCount = state.moveCount + 1;

      // Check if this sub-board was just won or drawn
      const subStart = subBoardIdx * 9;
      const subSlice = cells.slice(subStart, subStart + 9);
      const subCheck = checkKInARow(subSlice, LINES_3X3);
      if (subCheck.winner) {
        subWinners[subBoardIdx] = subCheck.winner;
      } else if (subSlice.every((c) => c !== null)) {
        subWinners[subBoardIdx] = 'DRAW';
      }

      // Check macro 3x3 winner across subWinners
      const macroCells = subWinners.map((w) => (w === 'X' || w === 'O' ? w : null));
      const macroCheck = checkKInARow(macroCells, LINES_3X3);
      let finalWinner: Player | 'DRAW' | null = macroCheck.winner;

      if (!finalWinner && subWinners.every((w) => w !== null)) {
        // Count won sub-boards if all 9 are finished
        const countX = subWinners.filter((w) => w === 'X').length;
        const countO = subWinners.filter((w) => w === 'O').length;
        finalWinner = countX > countO ? 'X' : countO > countX ? 'O' : 'DRAW';
      }

      // Next active sub-board is `localCellIdx`, unless that sub-board is already finished
      const nextSubBoard = subWinners[localCellIdx] === null ? localCellIdx : null;

      return {
        ...state,
        cells,
        subWinners,
        activeSubBoard: finalWinner ? null : nextSubBoard,
        moveCount,
        currentTurn: finalWinner ? player : nextPlayer,
        winner: finalWinner,
        winningLine: macroCheck.line,
        lastMoveIndex: move.index,
        statusMessage: finalWinner
          ? finalWinner === 'DRAW'
            ? 'Süper XoX Berabere Tamamlandı!'
            : `${finalWinner} Oyuncusu Süper XoX’u Kazandı!`
          : nextSubBoard !== null
          ? `Sıra ${nextPlayer} · ${nextSubBoard + 1}. Alt Tahtada Oynayın`
          : `Sıra ${nextPlayer} · Serbest Alt Tahta Seçimi!`,
      };
    }

    case 'gobblet-xox': {
      const size: GobbletSize = move.gobbletSize || state.selectedGobbletSize || 3;
      const reserve = {
        X: { ...(state.gobbletReserve?.X || { 1: 2, 2: 2, 3: 2 }) },
        O: { ...(state.gobbletReserve?.O || { 1: 2, 2: 2, 3: 2 }) },
      };
      if (reserve[player][size] <= 0) return state;
      if (move.index < 0 || move.index >= 9) return state;

      const stacks = (state.gobbletStacks || Array.from({ length: 9 }, () => [])).map((s) => [...s]);
      const targetStack = stacks[move.index];
      const topPiece = targetStack.length > 0 ? targetStack[targetStack.length - 1] : null;

      // Can only place over an empty square or a strictly smaller piece
      if (topPiece && topPiece.size >= size) {
        return state;
      }

      targetStack.push({ owner: player, size });
      reserve[player][size] -= 1;

      const cells = stacks.map((s) => (s.length > 0 ? s[s.length - 1].owner : null));
      const moveCount = state.moveCount + 1;
      const { winner, line } = checkKInARow(cells, LINES_3X3);

      // Check if nextPlayer has any valid move or reserve left
      const nextHasMoves = ([1, 2, 3] as GobbletSize[]).some((sz) => {
        if (reserve[nextPlayer][sz] <= 0) return false;
        return stacks.some((st) => st.length === 0 || st[st.length - 1].size < sz);
      });
      const isDraw = !winner && !nextHasMoves;
      const finalWinner = winner ? winner : isDraw ? 'DRAW' : null;

      // Auto-select an available size for the next player
      let nextSelectedSize: GobbletSize = 3;
      for (const sz of [3, 2, 1] as GobbletSize[]) {
        if (reserve[nextPlayer][sz] > 0) {
          nextSelectedSize = sz;
          break;
        }
      }

      return {
        ...state,
        cells,
        gobbletStacks: stacks,
        gobbletReserve: reserve,
        selectedGobbletSize: finalWinner ? size : nextSelectedSize,
        moveCount,
        currentTurn: finalWinner ? player : nextPlayer,
        winner: finalWinner,
        winningLine: line,
        lastMoveIndex: move.index,
        statusMessage: winner
          ? `${winner} Oyuncusu Gobblet XoX’u Kazandı!`
          : isDraw
          ? 'Hamle Kalmadı · Oyun Berabere!'
          : `Sıra ${nextPlayer} oyuncusunda · Boyut seçip yerleştirin`,
      };
    }

    case 'numeric-xox': {
      if (move.index < 0 || move.index >= 9 || state.cells[move.index] !== null) {
        return state;
      }
      const avail = {
        X: [...(state.availableNumbers?.X || [1, 3, 5, 7, 9])],
        O: [...(state.availableNumbers?.O || [2, 4, 6, 8])],
      };
      const num = move.numberValue ?? state.selectedNumber ?? avail[player][0];
      if (num === undefined || !avail[player].includes(num)) {
        return state;
      }

      const cells = [...state.cells];
      const owners = [...(state.numericOwners || Array(9).fill(null))];
      cells[move.index] = String(num);
      owners[move.index] = player;
      avail[player] = avail[player].filter((n) => n !== num);

      // Check if any line of 3 filled numbers sums to 15
      let winningLine: number[] = [];
      for (const line of LINES_3X3) {
        const [a, b, c] = line;
        if (cells[a] !== null && cells[b] !== null && cells[c] !== null) {
          const sum = Number(cells[a]) + Number(cells[b]) + Number(cells[c]);
          if (sum === 15) {
            winningLine = line;
            break;
          }
        }
      }

      const moveCount = state.moveCount + 1;
      const hasWon = winningLine.length > 0;
      const isDraw = !hasWon && cells.every((c) => c !== null);
      const finalWinner = hasWon ? player : isDraw ? 'DRAW' : null;
      const nextDefaultNum = avail[nextPlayer][0];

      return {
        ...state,
        cells,
        numericOwners: owners,
        availableNumbers: avail,
        selectedNumber: finalWinner ? num : nextDefaultNum,
        moveCount,
        currentTurn: finalWinner ? player : nextPlayer,
        winner: finalWinner,
        winningLine,
        lastMoveIndex: move.index,
        statusMessage: hasWon
          ? `${player} Oyuncusu Toplam 15 Yaparak Kazandı!`
          : isDraw
          ? 'Tüm Sayılar Kullanıldı · Oyun Berabere!'
          : `Sıra ${nextPlayer} (${nextPlayer === 'X' ? 'Tek' : 'Çift'} Sayılar) · Hedef: 15`,
      };
    }

    case 'tapatan-xox': {
      const cells = [...state.cells];
      const phase = state.tapatanPhase || 'drop';

      if (phase === 'drop') {
        if (move.index < 0 || move.index >= 9 || cells[move.index] !== null) {
          return state;
        }
        cells[move.index] = player;
        const moveCount = state.moveCount + 1;
        const { winner, line } = checkKInARow(cells, LINES_3X3);
        const nextPhase = moveCount >= 6 ? 'slide' : 'drop';

        return {
          ...state,
          cells,
          moveCount,
          tapatanPhase: nextPhase,
          selectedStoneIndex: null,
          currentTurn: winner ? player : nextPlayer,
          winner: winner || null,
          winningLine: line,
          lastMoveIndex: move.index,
          statusMessage: winner
            ? `${winner} Oyuncusu Üç Taş’ı Kazandı!`
            : nextPhase === 'slide'
            ? `Kaydırma Aşaması · ${nextPlayer} taşını seçip komşu boş kareye kaydırın`
            : `Yerleştirme Aşaması (${moveCount + 1}/6) · Sıra ${nextPlayer}`,
        };
      } else {
        // Slide phase: either selecting own stone or sliding from `fromIndex` (or `selectedStoneIndex`) to `index`
        const fromIdx = move.fromIndex ?? state.selectedStoneIndex;
        if (cells[move.index] === player) {
          // Selecting / switching which stone to move
          return {
            ...state,
            selectedStoneIndex: move.index,
            statusMessage: `Taş seçildi · Şimdi bağlı boş bir kareye tıklayın`,
          };
        }
        if (
          fromIdx === null ||
          fromIdx === undefined ||
          cells[fromIdx] !== player ||
          cells[move.index] !== null
        ) {
          return state;
        }
        const neighbors = TAPATAN_ADJACENCY[fromIdx] || [];
        if (!neighbors.includes(move.index)) {
          return state;
        }

        cells[fromIdx] = null;
        cells[move.index] = player;
        const moveCount = state.moveCount + 1;
        const { winner, line } = checkKInARow(cells, LINES_3X3);

        return {
          ...state,
          cells,
          moveCount,
          selectedStoneIndex: null,
          currentTurn: winner ? player : nextPlayer,
          winner: winner || null,
          winningLine: line,
          lastMoveIndex: move.index,
          statusMessage: winner
            ? `${winner} Oyuncusu Üç Taş’ı Kazandı!`
            : `Kaydırma Aşaması · Sıra ${nextPlayer} oyuncusunda`,
        };
      }
    }

    case 'misere-xox': {
      if (move.index < 0 || move.index >= 16 || state.cells[move.index] !== null) {
        return state;
      }
      const cells = [...state.cells];
      cells[move.index] = player;
      const moveCount = state.moveCount + 1;

      // In Misère XoX, making a 3-in-a-row loses immediately (so nextPlayer wins!)
      const { winner: madeThree, line } = checkKInARow(cells, LINES_4X4_3);
      const actualWinner: Player | 'DRAW' | null = madeThree
        ? getOpponent(madeThree)
        : cells.every((c) => c !== null)
        ? 'DRAW'
        : null;

      return {
        ...state,
        cells,
        moveCount,
        currentTurn: actualWinner ? player : nextPlayer,
        winner: actualWinner,
        winningLine: line,
        lastMoveIndex: move.index,
        statusMessage: madeThree
          ? `${madeThree} Üçlü Yaptı ve Kaybetti · ${actualWinner} Kazandı!`
          : actualWinner === 'DRAW'
          ? 'Kimse Tuzağa Düşmedi · Berabere!'
          : `Sıra ${nextPlayer} oyuncusunda · 3’lü hizadan kaçının!`,
      };
    }

    case 'connect4-xox': {
      if (move.index < 0 || move.index >= 42) return state;
      const col = move.index % 7;
      // Find lowest empty row in `col`
      let targetIdx = -1;
      for (let r = 5; r >= 0; r--) {
        if (state.cells[r * 7 + col] === null) {
          targetIdx = r * 7 + col;
          break;
        }
      }
      if (targetIdx === -1) return state;

      const cells = [...state.cells];
      cells[targetIdx] = player;
      const moveCount = state.moveCount + 1;
      const { winner, line } = checkKInARow(cells, LINES_7X6_4);
      const isDraw = !winner && cells.every((c) => c !== null);
      const finalWinner = winner ? winner : isDraw ? 'DRAW' : null;

      return {
        ...state,
        cells,
        moveCount,
        currentTurn: finalWinner ? player : nextPlayer,
        winner: finalWinner,
        winningLine: line,
        lastMoveIndex: targetIdx,
        statusMessage: winner
          ? `${winner} Oyuncusu Dörtlü Hiza Kurarak Kazandı!`
          : isDraw
          ? 'Sütunlar Doldu · Oyun Berabere!'
          : `Sıra ${nextPlayer} oyuncusunda · Sütun seçin`,
      };
    }

    case 'obstacle-xox': {
      if (move.index < 0 || move.index >= 25 || state.cells[move.index] !== null) {
        return state;
      }
      const cells = [...state.cells];
      cells[move.index] = player;
      const moveCount = state.moveCount + 1;
      const { winner, line } = checkKInARow(cells, LINES_5X5_4);
      const isDraw = !winner && cells.every((c) => c !== null);
      const finalWinner = winner ? winner : isDraw ? 'DRAW' : null;

      return {
        ...state,
        cells,
        moveCount,
        currentTurn: finalWinner ? player : nextPlayer,
        winner: finalWinner,
        winningLine: line,
        lastMoveIndex: move.index,
        statusMessage: winner
          ? `${winner} Oyuncusu Kaya Kalesi’ni Kazandı!`
          : isDraw
          ? 'Tüm Boş Kareler Doldu · Berabere!'
          : `Sıra ${nextPlayer} oyuncusunda · 4’lü hiza kurun`,
      };
    }

    case 'gomoku-xox': {
      if (move.index < 0 || move.index >= 81 || state.cells[move.index] !== null) {
        return state;
      }
      const cells = [...state.cells];
      cells[move.index] = player;
      const moveCount = state.moveCount + 1;
      const { winner, line } = checkKInARow(cells, LINES_9X9_5);
      const isDraw = !winner && cells.every((c) => c !== null);
      const finalWinner = winner ? winner : isDraw ? 'DRAW' : null;

      return {
        ...state,
        cells,
        moveCount,
        currentTurn: finalWinner ? player : nextPlayer,
        winner: finalWinner,
        winningLine: line,
        lastMoveIndex: move.index,
        statusMessage: winner
          ? `${winner} Oyuncusu 5 Taş (Gomoku) İle Kazandı!`
          : isDraw
          ? 'Tahta Doldu · Berabere!'
          : `Sıra ${nextPlayer} oyuncusunda · 5 taş hizalayın`,
      };
    }

    case 'sos-xox': {
      if (move.index < 0 || move.index >= 25 || state.cells[move.index] !== null) {
        return state;
      }
      const letter = move.sosLetter || state.sosLetterChoice?.[player] || 'S';
      const cells = [...state.cells];
      cells[move.index] = letter;

      const r0 = Math.floor(move.index / 5);
      const c0 = move.index % 5;
      const newSOSLines: SOSLine[] = [];

      const dirs = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ];

      if (letter === 'O') {
        // Placed 'O' in the middle of S - O - S
        for (const [dr, dc] of dirs) {
          const r1 = r0 - dr, c1 = c0 - dc;
          const r2 = r0 + dr, c2 = c0 + dc;
          if (r1 >= 0 && r1 < 5 && c1 >= 0 && c1 < 5 && r2 >= 0 && r2 < 5 && c2 >= 0 && c2 < 5) {
            const idx1 = r1 * 5 + c1;
            const idx2 = r2 * 5 + c2;
            if (cells[idx1] === 'S' && cells[idx2] === 'S') {
              newSOSLines.push({ cells: [idx1, move.index, idx2], owner: player });
            }
          }
        }
      } else {
        // Placed 'S' at an endpoint of S - O - S (check all 8 rays)
        const allDirs = [
          [0, 1], [0, -1], [1, 0], [-1, 0],
          [1, 1], [-1, -1], [1, -1], [-1, 1],
        ];
        for (const [dr, dc] of allDirs) {
          const r1 = r0 + dr, c1 = c0 + dc;
          const r2 = r0 + 2 * dr, c2 = c0 + 2 * dc;
          if (r2 >= 0 && r2 < 5 && c2 >= 0 && c2 < 5) {
            const idx1 = r1 * 5 + c1;
            const idx2 = r2 * 5 + c2;
            if (cells[idx1] === 'O' && cells[idx2] === 'S') {
              newSOSLines.push({ cells: [move.index, idx1, idx2], owner: player });
            }
          }
        }
      }

      const scores = { ...(state.sosScores || { X: 0, O: 0 }) };
      scores[player] += newSOSLines.length;
      const allLines = [...(state.sosLines || []), ...newSOSLines];
      const moveCount = state.moveCount + 1;
      const boardFull = cells.every((c) => c !== null);

      let finalWinner: Player | 'DRAW' | null = null;
      if (boardFull) {
        finalWinner =
          scores.X > scores.O ? 'X' : scores.O > scores.X ? 'O' : 'DRAW';
      }

      // Extra turn if at least one SOS was formed and board is not full!
      const nextTurn = finalWinner || newSOSLines.length > 0 ? player : nextPlayer;

      return {
        ...state,
        cells,
        sosScores: scores,
        sosLines: allLines,
        moveCount,
        currentTurn: nextTurn,
        winner: finalWinner,
        winningLine: newSOSLines.length > 0 ? newSOSLines[0].cells : state.winningLine,
        lastMoveIndex: move.index,
        statusMessage: finalWinner
          ? finalWinner === 'DRAW'
            ? `Oyun Bitti · ${scores.X}-${scores.O} Berabere!`
            : `${finalWinner} Oyuncusu ${scores[finalWinner]} SOS ile Kazandı!`
          : newSOSLines.length > 0
          ? `Harika! ${player} SOS Yaptı (+${newSOSLines.length}) · Ekstra Hamle Hakkı!`
          : `Sıra ${nextTurn} oyuncusunda · Skor X:${scores.X} - O:${scores.O}`,
      };
    }

    case 'dots-boxes': {
      const edges = [...(state.dotsEdges || Array(24).fill(null))];
      if (move.index < 0 || move.index >= 24 || edges[move.index] !== null) {
        return state;
      }
      edges[move.index] = player;

      const boxes = [...(state.dotsBoxes || Array(9).fill(null))];
      let newlyCaptured = 0;
      for (let b = 0; b < 9; b++) {
        if (boxes[b] === null) {
          const [top, bottom, left, right] = getBoxEdges(b);
          if (
            edges[top] !== null &&
            edges[bottom] !== null &&
            edges[left] !== null &&
            edges[right] !== null
          ) {
            boxes[b] = player;
            newlyCaptured++;
          }
        }
      }

      const scores = { ...(state.dotsScores || { X: 0, O: 0 }) };
      scores[player] += newlyCaptured;
      const moveCount = state.moveCount + 1;
      const allBoxesFilled = boxes.every((b) => b !== null);

      let finalWinner: Player | 'DRAW' | null = null;
      if (allBoxesFilled) {
        finalWinner = scores.X > scores.O ? 'X' : scores.O > scores.X ? 'O' : 'DRAW';
      }

      const nextTurn = finalWinner || newlyCaptured > 0 ? player : nextPlayer;

      return {
        ...state,
        cells: boxes,
        dotsEdges: edges,
        dotsBoxes: boxes,
        dotsScores: scores,
        moveCount,
        currentTurn: nextTurn,
        winner: finalWinner,
        lastMoveIndex: move.index,
        statusMessage: finalWinner
          ? finalWinner === 'DRAW'
            ? 'Kutular Tamamlandı · Berabere!'
            : `${finalWinner} Oyuncusu ${scores[finalWinner]} Kutu ile Kazandı!`
          : newlyCaptured > 0
          ? `${player} Kutu Kapattı (+${newlyCaptured}) · Tekrar Oynayın!`
          : `Sıra ${nextTurn} oyuncusunda · Kutular X:${scores.X} - O:${scores.O}`,
      };
    }

    case 'reversi-xox': {
      if (move.index < 0 || move.index >= 36) return state;
      const flips = getReversiFlips(state.cells, move.index, player);
      if (flips.length === 0) return state;

      const cells = [...state.cells];
      cells[move.index] = player;
      for (const idx of flips) {
        cells[idx] = player;
      }

      const countX = cells.filter((c) => c === 'X').length;
      const countO = cells.filter((c) => c === 'O').length;
      const moveCount = state.moveCount + 1;

      const nextMoves = getAllReversiValidMoves(cells, nextPlayer);
      const currentAgainMoves = getAllReversiValidMoves(cells, player);

      let finalWinner: Player | 'DRAW' | null = null;
      let activeTurn: Player = nextPlayer;
      let activeValidMoves: number[] = nextMoves;
      let msg = '';

      if (nextMoves.length === 0 && currentAgainMoves.length === 0) {
        finalWinner = countX > countO ? 'X' : countO > countX ? 'O' : 'DRAW';
        activeValidMoves = [];
        msg =
          finalWinner === 'DRAW'
            ? `Reversi ${countX}-${countO} Berabere Bitti!`
            : `${finalWinner} Oyuncusu ${Math.max(countX, countO)}-${Math.min(countX, countO)} Kazandı!`;
      } else if (nextMoves.length === 0) {
        // Opponent has no moves, pass back to player
        activeTurn = player;
        activeValidMoves = currentAgainMoves;
        msg = `${nextPlayer} İçin Geçerli Hamle Yok (Pas) · Sıra Tekrar ${player} Oyuncusunda!`;
      } else {
        msg = `Sıra ${nextPlayer} oyuncusunda · ${flips.length} taş çevrildi`;
      }

      return {
        ...state,
        cells,
        moveCount,
        currentTurn: activeTurn,
        winner: finalWinner,
        winningLine: flips,
        reversiValidMoves: activeValidMoves,
        reversiScores: { X: countX, O: countO },
        lastMoveIndex: move.index,
        statusMessage: msg,
      };
    }
  }
}

/**
 * Generate all legal moves for the current turn in `state`
 */
export function getLegalMoves(state: MatchState): GameMove[] {
  if (state.winner !== null) return [];
  const player = state.currentTurn;

  switch (state.gameId) {
    case 'classic-xox':
    case 'infinite-xox':
    case 'misere-xox':
    case 'obstacle-xox':
    case 'gomoku-xox': {
      const moves: GameMove[] = [];
      for (let i = 0; i < state.cells.length; i++) {
        if (state.cells[i] === null) moves.push({ index: i });
      }
      return moves;
    }

    case 'ultimate-xox': {
      const moves: GameMove[] = [];
      const subWinners = state.subWinners || Array(9).fill(null);
      for (let i = 0; i < 81; i++) {
        if (state.cells[i] !== null) continue;
        const subIdx = Math.floor(i / 9);
        if (subWinners[subIdx] !== null) continue;
        if (
          state.activeSubBoard !== null &&
          state.activeSubBoard !== undefined &&
          state.activeSubBoard !== subIdx
        ) {
          continue;
        }
        moves.push({ index: i });
      }
      return moves;
    }

    case 'gobblet-xox': {
      const moves: GameMove[] = [];
      const reserve = state.gobbletReserve?.[player] || { 1: 0, 2: 0, 3: 0 };
      const stacks = state.gobbletStacks || Array.from({ length: 9 }, () => []);
      for (const sz of [3, 2, 1] as GobbletSize[]) {
        if (reserve[sz] <= 0) continue;
        for (let i = 0; i < 9; i++) {
          const st = stacks[i];
          const top = st.length > 0 ? st[st.length - 1] : null;
          if (!top || top.size < sz) {
            moves.push({ index: i, gobbletSize: sz });
          }
        }
      }
      return moves;
    }

    case 'numeric-xox': {
      const moves: GameMove[] = [];
      const nums = state.availableNumbers?.[player] || [];
      for (const n of nums) {
        for (let i = 0; i < 9; i++) {
          if (state.cells[i] === null) {
            moves.push({ index: i, numberValue: n });
          }
        }
      }
      return moves;
    }

    case 'tapatan-xox': {
      const moves: GameMove[] = [];
      if (state.tapatanPhase === 'drop') {
        for (let i = 0; i < 9; i++) {
          if (state.cells[i] === null) moves.push({ index: i });
        }
      } else {
        for (let from = 0; from < 9; from++) {
          if (state.cells[from] === player) {
            for (const to of TAPATAN_ADJACENCY[from] || []) {
              if (state.cells[to] === null) {
                moves.push({ fromIndex: from, index: to });
              }
            }
          }
        }
      }
      return moves;
    }

    case 'connect4-xox': {
      const moves: GameMove[] = [];
      for (let c = 0; c < 7; c++) {
        // Check if top cell in column `c` is empty
        if (state.cells[c] === null) {
          moves.push({ index: c });
        }
      }
      return moves;
    }

    case 'sos-xox': {
      const moves: GameMove[] = [];
      for (let i = 0; i < 25; i++) {
        if (state.cells[i] === null) {
          moves.push({ index: i, sosLetter: 'S' });
          moves.push({ index: i, sosLetter: 'O' });
        }
      }
      return moves;
    }

    case 'dots-boxes': {
      const moves: GameMove[] = [];
      const edges = state.dotsEdges || Array(24).fill(null);
      for (let i = 0; i < 24; i++) {
        if (edges[i] === null) moves.push({ index: i });
      }
      return moves;
    }

    case 'reversi-xox': {
      const valid = state.reversiValidMoves || getAllReversiValidMoves(state.cells, player);
      return valid.map((idx) => ({ index: idx }));
    }
  }
}

/**
 * Choose an AI move for `state.currentTurn` based on `difficulty`
 */
export function chooseAIMove(state: MatchState, difficulty: Difficulty = 'orta'): GameMove | null {
  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) return null;

  // Easy mode: 65% random move, 35% smart move
  if (difficulty === 'kolay' && Math.random() < 0.65) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const aiPlayer = state.currentTurn;
  const humanPlayer = getOpponent(aiPlayer);

  // 1. Check for immediate winning move
  for (const move of legalMoves) {
    const nextState = applyMove(state, move);
    if (nextState.winner === aiPlayer) {
      return move;
    }
  }

  // 2. For games where extra turns happen (SOS, Dots & Boxes), prioritize scoring moves!
  if (state.gameId === 'sos-xox') {
    const scoringMoves = legalMoves.filter((m) => {
      const next = applyMove(state, m);
      return (next.sosScores?.[aiPlayer] || 0) > (state.sosScores?.[aiPlayer] || 0);
    });
    if (scoringMoves.length > 0) return scoringMoves[0];

    // Avoid giving human an immediate SOS if on orta/uzman
    if (difficulty !== 'kolay') {
      const safeMoves = legalMoves.filter((m) => {
        const next = applyMove(state, m);
        const oppMoves = getLegalMoves(next);
        return !oppMoves.some((om) => {
          const afterOpp = applyMove(next, om);
          return (afterOpp.sosScores?.[humanPlayer] || 0) > (next.sosScores?.[humanPlayer] || 0);
        });
      });
      if (safeMoves.length > 0) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  if (state.gameId === 'dots-boxes') {
    // Take any box that has 3 edges filled
    const captureMoves = legalMoves.filter((m) => {
      const next = applyMove(state, m);
      return (next.dotsScores?.[aiPlayer] || 0) > (state.dotsScores?.[aiPlayer] || 0);
    });
    if (captureMoves.length > 0) return captureMoves[0];

    // Avoid creating a 3-edge box for the opponent
    const safeMoves = legalMoves.filter((m) => {
      const next = applyMove(state, m);
      const edges = next.dotsEdges || [];
      for (let b = 0; b < 9; b++) {
        if (next.dotsBoxes?.[b] !== null) continue;
        const boxEdges = getBoxEdges(b);
        const filledCount = boxEdges.filter((eIdx) => edges[eIdx] !== null).length;
        if (filledCount === 3) return false;
      }
      return true;
    });
    if (safeMoves.length > 0) {
      return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }
    return legalMoves[0];
  }

  // 3. Reversi heuristic: prioritize corners (0, 5, 30, 35) and max flips
  if (state.gameId === 'reversi-xox') {
    const corners = new Set([0, 5, 30, 35]);
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;
    for (const m of legalMoves) {
      const flips = getReversiFlips(state.cells, m.index, aiPlayer).length;
      const cornerBonus = corners.has(m.index) ? 20 : 0;
      const score = flips + cornerBonus;
      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
    return bestMove;
  }

  // 4. Misère XoX: filter out any move that causes self-loss!
  if (state.gameId === 'misere-xox') {
    const nonLosing = legalMoves.filter((m) => {
      const next = applyMove(state, m);
      return next.winner !== humanPlayer;
    });
    if (nonLosing.length > 0) {
      return nonLosing[Math.floor(Math.random() * nonLosing.length)];
    }
    return legalMoves[0];
  }

  // 5. Block opponent's immediate winning move!
  // Simulate if it were humanPlayer's turn right now
  const hypotheticalHumanState: MatchState = {
    ...state,
    currentTurn: humanPlayer,
  };
  const humanLegalMoves = getLegalMoves(hypotheticalHumanState);
  for (const hMove of humanLegalMoves) {
    const afterHuman = applyMove(hypotheticalHumanState, hMove);
    if (afterHuman.winner === humanPlayer) {
      // Find a legal AI move that plays on `hMove.index` (or blocks that line)
      const directBlock = legalMoves.find((m) => m.index === hMove.index);
      if (directBlock) return directBlock;
      // Otherwise find a move after which human can no longer win immediately
      for (const aiCandidate of legalMoves) {
        const nextAfterAi = applyMove(state, aiCandidate);
        const nextHumanMoves = getLegalMoves(nextAfterAi);
        const humanStillWins = nextHumanMoves.some(
          (hm) => applyMove(nextAfterAi, hm).winner === humanPlayer
        );
        if (!humanStillWins) return aiCandidate;
      }
    }
  }

  // 6. Minimax depth-2 lookahead for Classic XoX & Infinite XoX on Uzman/Orta
  if (
    (state.gameId === 'classic-xox' || state.gameId === 'infinite-xox') &&
    difficulty === 'uzman'
  ) {
    let bestMove = legalMoves[0];
    let bestVal = -Infinity;
    for (const move of legalMoves) {
      const next = applyMove(state, move);
      const val = minimaxSmallBoard(next, 4, false, aiPlayer);
      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // 7. Positional center preference for grid games
  const centerIdx = Math.floor((state.rows * state.cols) / 2);
  const centerMove = legalMoves.find((m) => m.index === centerIdx);
  if (centerMove && Math.random() < 0.75) {
    return centerMove;
  }

  // For Gomoku / Obstacle / Connect4, prefer moves adjacent to existing stones
  if (state.gameId === 'gomoku-xox' || state.gameId === 'obstacle-xox') {
    const occupied = new Set<number>();
    state.cells.forEach((c, idx) => {
      if (c === 'X' || c === 'O') occupied.add(idx);
    });
    if (occupied.size > 0) {
      const nearMoves = legalMoves.filter((m) => {
        const r = Math.floor(m.index / state.cols);
        const c = m.index % state.cols;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
              if (occupied.has(nr * state.cols + nc)) return true;
            }
          }
        }
        return false;
      });
      if (nearMoves.length > 0) {
        return nearMoves[Math.floor(Math.random() * nearMoves.length)];
      }
    }
  }

  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

function minimaxSmallBoard(
  state: MatchState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  const humanPlayer = getOpponent(aiPlayer);
  if (state.winner === aiPlayer) return 10 + depth;
  if (state.winner === humanPlayer) return -10 - depth;
  if (state.winner === 'DRAW' || depth === 0) return 0;

  const moves = getLegalMoves(state);
  if (moves.length === 0) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const val = minimaxSmallBoard(applyMove(state, m), depth - 1, false, aiPlayer);
      if (val > best) best = val;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const val = minimaxSmallBoard(applyMove(state, m), depth - 1, true, aiPlayer);
      if (val < best) best = val;
    }
    return best;
  }
}
