export type GameId =
  | 'classic-xox'
  | 'infinite-xox'
  | 'ultimate-xox'
  | 'gobblet-xox'
  | 'numeric-xox'
  | 'tapatan-xox'
  | 'misere-xox'
  | 'connect4-xox'
  | 'obstacle-xox'
  | 'gomoku-xox'
  | 'sos-xox'
  | 'dots-boxes'
  | 'reversi-xox';

export type Player = 'X' | 'O';
export type Difficulty = 'kolay' | 'orta' | 'uzman';
export type PlayMode = 'ai' | 'local';
export type ShellState = 'title' | 'playing' | 'paused' | 'gameover';

export type GobbletSize = 1 | 2 | 3; // 1: Küçük, 2: Orta, 3: Büyük

export interface GobbletPiece {
  owner: Player;
  size: GobbletSize;
}

export interface SOSLine {
  cells: [number, number, number];
  owner: Player;
}

export interface DotsEdge {
  id: string; // e.g. "h-0-0" or "v-0-0"
  type: 'h' | 'v';
  row: number;
  col: number;
  owner: Player | null;
}

export interface GameMove {
  index: number; // Cell index or edge index
  fromIndex?: number; // For Tapatan sliding or Gobblet board-to-board
  gobbletSize?: GobbletSize;
  numberValue?: number; // 1..9 for Numeric XoX
  sosLetter?: 'S' | 'O'; // For SOS
}

export interface MatchState {
  gameId: GameId;
  rows: number;
  cols: number;
  currentTurn: Player;
  winner: Player | 'DRAW' | null;
  winningLine: number[];
  moveCount: number;
  statusMessage: string;

  // Standard / Grid cells ('X' | 'O' | 'S' | 'BLOCKED' | null)
  cells: (string | null)[];

  // 1. Infinite XoX: ordered queue of placed indices for each player (max 3)
  fifoQueues?: {
    X: number[];
    O: number[];
  };

  // 2. Ultimate XoX: 9 sub-boards (index 0..8), each has 9 cells (total 81 cells in `cells`)
  // subWinners tracks who won each of the 9 macro boards ('X' | 'O' | 'DRAW' | null)
  subWinners?: (Player | 'DRAW' | null)[];
  activeSubBoard?: number | null; // null = can play in any unfinished sub-board

  // 3. Gobblet XoX: 9 cells, each cell holds a stack of GobbletPiece (last is top)
  gobbletStacks?: GobbletPiece[][];
  gobbletReserve?: {
    X: Record<GobbletSize, number>;
    O: Record<GobbletSize, number>;
  };
  selectedGobbletSize?: GobbletSize;

  // 4. Numeric XoX (Sum 15): cells store "1".."9"
  numericOwners?: (Player | null)[]; // Tracks whether X (odd) or O (even) placed it
  availableNumbers?: {
    X: number[]; // [1, 3, 5, 7, 9]
    O: number[]; // [2, 4, 6, 8]
  };
  selectedNumber?: number;

  // 5. Tapatan (3-stone drop then slide):
  tapatanPhase?: 'drop' | 'slide';
  selectedStoneIndex?: number | null;

  // 6. SOS Game:
  sosLetterChoice?: {
    X: 'S' | 'O';
    O: 'S' | 'O';
  };
  sosScores?: {
    X: number;
    O: number;
  };
  sosLines?: SOSLine[];

  // 7. Dots & Boxes (3x3 boxes = 12 horizontal edges + 12 vertical edges = 24 edges)
  dotsEdges?: (Player | null)[]; // length 24
  dotsBoxes?: (Player | null)[]; // length 9 (3x3 boxes)
  dotsScores?: {
    X: number;
    O: number;
  };

  // 8. Reversi (6x6):
  reversiValidMoves?: number[];
  reversiScores?: {
    X: number;
    O: number;
  };

  // Last move highlight
  lastMoveIndex?: number | null;
}

export interface GameMetadata {
  id: GameId;
  order: number;
  name: string;
  shortName: string;
  tagline: string;
  gridLabel: string;
  winConditionLabel: string;
  rules: string[];
  tacticalTip: string;
}

export interface PlayerStats {
  played: number;
  winsX: number;
  winsO: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  perGameWins: Partial<Record<GameId, number>>;
}
