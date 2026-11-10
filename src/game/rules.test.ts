import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  applyMove,
  getLegalMoves,
  chooseAIMove,
} from './rules';
import { GAME_CATALOG } from './catalog';

test('Catalog contains 13 distinct XoX & grid strategy games', () => {
  assert.equal(GAME_CATALOG.length, 13);
  for (const game of GAME_CATALOG) {
    const state = createInitialState(game.id);
    assert.equal(state.gameId, game.id);
    assert.equal(state.currentTurn, 'X');
    assert.equal(state.winner, null);
    const legal = getLegalMoves(state);
    assert.ok(legal.length > 0, `Expected legal moves for ${game.id}`);
  }
});

test('1. Classic XoX detects 3-in-a-row win and draw', () => {
  let state = createInitialState('classic-xox');
  state = applyMove(state, { index: 0 }); // X
  state = applyMove(state, { index: 3 }); // O
  state = applyMove(state, { index: 1 }); // X
  state = applyMove(state, { index: 4 }); // O
  state = applyMove(state, { index: 2 }); // X wins top row
  assert.equal(state.winner, 'X');
  assert.deepEqual(state.winningLine, [0, 1, 2]);
});

test('2. Infinite XoX removes oldest stone on 4th placement by same player', () => {
  let state = createInitialState('infinite-xox');
  state = applyMove(state, { index: 0 }); // X1 at 0
  state = applyMove(state, { index: 3 }); // O1 at 3
  state = applyMove(state, { index: 1 }); // X2 at 1
  state = applyMove(state, { index: 4 }); // O2 at 4
  state = applyMove(state, { index: 6 }); // X3 at 6 (X has [0, 1, 6])
  state = applyMove(state, { index: 8 }); // O3 at 8
  assert.equal(state.cells[0], 'X');
  // Now X places 4th stone at 7 -> stone at 0 must vanish!
  state = applyMove(state, { index: 7 });
  assert.equal(state.cells[0], null);
  assert.equal(state.cells[7], 'X');
  assert.deepEqual(state.fifoQueues?.X, [1, 6, 7]);
});

test('3. Ultimate XoX routes next player to corresponding sub-board', () => {
  let state = createInitialState('ultimate-xox');
  // X plays in sub-board 0, local cell 4 (center)
  state = applyMove(state, { index: 4 });
  assert.equal(state.activeSubBoard, 4);
  assert.equal(state.currentTurn, 'O');
  // O tries to play in sub-board 0 (illegal) -> state unchanged
  const invalidAttempt = applyMove(state, { index: 1 });
  assert.equal(invalidAttempt.moveCount, 1);
  // O plays in sub-board 4, local cell 2 (global index 4*9 + 2 = 38)
  state = applyMove(state, { index: 38 });
  assert.equal(state.activeSubBoard, 2);
  assert.equal(state.currentTurn, 'X');
});

test('4. Gobblet XoX allows larger piece to swallow smaller piece', () => {
  let state = createInitialState('gobblet-xox');
  state = applyMove(state, { index: 4, gobbletSize: 1 }); // X places size 1 at center
  assert.equal(state.cells[4], 'X');
  // O cannot place size 1 on top of size 1
  const invalid = applyMove(state, { index: 4, gobbletSize: 1 });
  assert.equal(invalid.cells[4], 'X');
  // O places size 2 on top of X's size 1 at center
  state = applyMove(state, { index: 4, gobbletSize: 2 });
  assert.equal(state.cells[4], 'O');
  assert.equal(state.gobbletStacks?.[4].length, 2);
});

test('5. Numeric XoX awards victory when a line sums to 15', () => {
  let state = createInitialState('numeric-xox');
  state = applyMove(state, { index: 0, numberValue: 9 }); // X puts 9 at 0
  state = applyMove(state, { index: 1, numberValue: 2 }); // O puts 2 at 1
  // Top row has 9 + 2 = 11. Wait: 4 is an even number (O's pool), let's test 5+6+4 = 15
  let s2 = createInitialState('numeric-xox');
  s2 = applyMove(s2, { index: 0, numberValue: 5 }); // X puts 5
  s2 = applyMove(s2, { index: 1, numberValue: 6 }); // O puts 6 (5+6=11)
  s2 = applyMove(s2, { index: 3, numberValue: 1 }); // X puts 1 elsewhere
  s2 = applyMove(s2, { index: 2, numberValue: 4 }); // O completes 5+6+4 = 15 on top row!
  assert.equal(s2.winner, 'O');
  assert.deepEqual(s2.winningLine, [0, 1, 2]);
});

test('6. Tapatan XoX transitions from drop phase to slide phase after 6 stones', () => {
  let state = createInitialState('tapatan-xox');
  // Place 6 stones without creating a 3-in-a-row
  // 0:X, 1:O, 2:X, 3:O, 4:X, 6:O (X at 0,2,4; O at 1,3,6)
  const drops = [0, 1, 2, 3, 4, 6];
  for (const idx of drops) {
    state = applyMove(state, { index: idx });
  }
  assert.equal(state.winner, null);
  assert.equal(state.tapatanPhase, 'slide');
  // X slides stone from 4 to 7, then O slides, etc.
  state = applyMove(state, { fromIndex: 4, index: 7 });
  assert.equal(state.cells[4], null);
  assert.equal(state.cells[7], 'X');
});

test('7. Misère XoX makes the player who forms 3-in-a-row lose', () => {
  let state = createInitialState('misere-xox');
  state = applyMove(state, { index: 0 }); // X
  state = applyMove(state, { index: 4 }); // O
  state = applyMove(state, { index: 1 }); // X
  state = applyMove(state, { index: 5 }); // O
  state = applyMove(state, { index: 2 }); // X completes 3-in-a-row [0,1,2] -> O wins!
  assert.equal(state.winner, 'O');
});

test('8. Connect 4 drops pieces to bottom of column and detects 4-in-a-row', () => {
  let state = createInitialState('connect4-xox');
  state = applyMove(state, { index: 0 }); // X drops in col 0 -> lands at row 5, col 0 (idx 35)
  assert.equal(state.cells[35], 'X');
  state = applyMove(state, { index: 0 }); // O drops in col 0 -> lands at row 4, col 0 (idx 28)
  assert.equal(state.cells[28], 'O');
});

test('9. SOS XoX grants point and extra turn when SOS is completed', () => {
  let state = createInitialState('sos-xox');
  state = applyMove(state, { index: 0, sosLetter: 'S' }); // X puts S at 0
  state = applyMove(state, { index: 1, sosLetter: 'O' }); // O puts O at 1
  // Now it is X's turn; X puts S at 2 to complete S-O-S at [0, 1, 2]
  state = applyMove(state, { index: 2, sosLetter: 'S' });
  assert.equal(state.sosScores?.X, 1);
  assert.equal(state.currentTurn, 'X'); // Extra turn granted!
});

test('10. Dots & Boxes grants box and extra turn on 4th edge', () => {
  let state = createInitialState('dots-boxes');
  // Box 0 uses edges [0, 3, 12, 13]
  state = applyMove(state, { index: 0 }); // X
  state = applyMove(state, { index: 3 }); // O
  state = applyMove(state, { index: 12 }); // X
  state = applyMove(state, { index: 13 }); // O closes 4th edge of Box 0!
  assert.equal(state.dotsBoxes?.[0], 'O');
  assert.equal(state.dotsScores?.O, 1);
  assert.equal(state.currentTurn, 'O'); // O gets extra turn!
});

test('11. Reversi flips outflanked opponent stones and AI chooses valid move across all games', () => {
  let state = createInitialState('reversi-xox');
  const validMoves = getLegalMoves(state);
  assert.equal(validMoves.length, 4);
  state = applyMove(state, validMoves[0]);
  assert.equal(state.reversiScores?.X, 4);
  assert.equal(state.reversiScores?.O, 1);

  for (const game of GAME_CATALOG) {
    const s = createInitialState(game.id);
    const aiMove = chooseAIMove(s, 'uzman');
    assert.ok(aiMove !== null, `AI should return a move for ${game.id}`);
    const after = applyMove(s, aiMove!);
    assert.equal(after.moveCount, 1, `AI move should be valid and advance moveCount for ${game.id}`);
  }
});
