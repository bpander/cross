import { LensImpl } from 'lens.ts';
import uniq from 'lodash/uniq';
import { createSelector } from 'reselect';

import { BLACK_SYMBOL } from 'config/global';
import { Store } from 'lib/createStateContext';
import * as Enums from 'lib/crossword/Enums';
import { ClosedSet } from 'lib/crossword/Types';
import * as Board from 'state/board';
import * as Shape from 'state/shape';
import { includes, removeFirst, removeIndex, replaceIndex } from 'util/arrays';
import { getIndex, getXY, reflectXY } from 'util/grid2Ds';

export interface ViewerState {
  shape: Shape.ShapeState;
  board: Board.BoardState;
}

export const defaultValue: ViewerState = {
  shape: Shape.defaultValue,
  board: Board.defaultValue,
};

export const setValueAtCursor = (value: string) => <T>(store: Store<T>, lens: LensImpl<T, ViewerState>) => {
  const { board, shape } = lens.get()(store.state);
  if (value === BLACK_SYMBOL) {
    const blockIndex = shape.blocks.indexOf(board.cursor);
    const midX = (shape.width - 1) / 2; // TODO: Handle decimals
    const midY = (shape.height - 1) / 2;
    const mirrorIndex = getIndex(shape.width, reflectXY(getXY(shape.width, board.cursor), [ midX, midY ]));
    if (blockIndex === -1) {
      const newLetters = replaceIndex(
        replaceIndex(board.letters, board.cursor, ''), mirrorIndex, '',
      );
      const newBlocks = [ ...shape.blocks, ...uniq([ board.cursor, mirrorIndex ]) ];
      store.update(lens.set(state => ({
        shape: { ...state.shape, blocks: newBlocks },
        board: { ...state.board, letters: newLetters },
      }))(store.state));
    } else {
      const newBlocks = removeFirst(removeIndex(shape.blocks, blockIndex), mirrorIndex);
      store.update(lens.k('shape').k('blocks').set(newBlocks)(store.state));
    }
    return;
  }
  const cursorDirection = (value === '') ? -1 : 1;
  const stepSize = (board.direction === Enums.Direction.Across) ? 1 : shape.width;
  store.update(lens.k('board').set(state => ({
    ...state,
    letters: replaceIndex(board.letters, board.cursor, value),
    cursor: board.cursor + (cursorDirection * stepSize),
  }))(store.state));
};

export const getSlotAtCursor = createSelector(
  (viewerState: ViewerState) => Shape.getSlots(viewerState.shape),
  (viewerState: ViewerState) => viewerState.board.cursor,
  (viewerState: ViewerState) => viewerState.board.direction,
  (slots, cursor, direction) => {
    return slots.find(slot => slot.direction === direction && includes(slot.cells, cursor));
  },
);

export const getClosedSet = createSelector(
  (viewerState: ViewerState) => Shape.getSlots(viewerState.shape),
  (viewerState: ViewerState) => viewerState.board.letters,
  (slots, letters) => {
    const closedSet: ClosedSet = {};
    slots.forEach(slot => {
      let runningChars: string = '';
      for (let i = 0; i < slot.cells.length; i++) {
        const char = letters[slot.cells[i]];
        if (!char) {
          return;
        }
        runningChars += char;
      }
      closedSet[slot.id] = runningChars;
    });
    return closedSet;
  },
);
