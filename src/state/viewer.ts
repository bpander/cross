import { lens } from 'lens.ts';
import uniq from 'lodash/uniq';
import { createSelector } from 'reselect';

import { BLACK_SYMBOL } from 'config/global';
import { Updater } from 'lib/createStore';
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

// TODO: Split this up
export const setValueAtCursor: Updater<ViewerState> = l => (value: string) => {
  return l.set(editor => {
    const { board, shape } = editor;
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
        return {
          shape: { ...shape, blocks: newBlocks },
          board: { ...board, letters: newLetters },
        };
      } else {
        const newBlocks = removeFirst(removeIndex(shape.blocks, blockIndex), mirrorIndex);
        return lens<ViewerState>().k('shape').k('blocks').set(newBlocks)(editor);
      }
    }
    const cursorDirection = (value === '') ? -1 : 1;
    const stepSize = (board.direction === Enums.Direction.Across) ? 1 : shape.width;
    return lens<ViewerState>().k('board').set(state => ({
      ...state,
      letters: replaceIndex(state.letters, state.cursor, value),
      cursor: state.cursor + (cursorDirection * stepSize),
    }))(editor);
  });
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
