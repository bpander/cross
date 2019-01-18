import uniq from 'lodash/uniq';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';

import { BLACK_SYMBOL } from 'config/global';
import * as Enums from 'lib/crossword/Enums';
import { ClosedSet } from 'lib/crossword/Types';
import { boardActions, boardReducer } from 'redux-modules/board';
import EditorState from 'redux-modules/definitions/EditorState';
import RootThunkAction from 'redux-modules/definitions/RootThunkAction';
import { shapeActions, shapeReducer, shapeSelectors } from 'redux-modules/shape';
import { includes, removeFirst, removeIndex, replaceIndex } from 'util/arrays';
import { getIndex, getXY, reflectXY } from 'util/grid2Ds';

export const editorReducer = combineReducers({
  board: boardReducer,
  shape: shapeReducer,
});

export const editorActions = {

  setValueAtCursor: (value: string): RootThunkAction<void> => (dispatch, getState) => {
    const { board, shape } = getState().editor;
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
        dispatch(boardActions.update({ letters: newLetters }));
        dispatch(shapeActions.update({ blocks: newBlocks }));
      } else {
        const newBlocks = removeFirst(removeIndex(shape.blocks, blockIndex), mirrorIndex);
        dispatch(shapeActions.update({ blocks: newBlocks }));
      }
      return;
    }
    const cursorDirection = (value === '') ? -1 : 1;
    const stepSize = (board.direction === Enums.Direction.Across) ? 1 : shape.width;
    dispatch(boardActions.update({
      letters: replaceIndex(board.letters, board.cursor, value),
      cursor: board.cursor + (cursorDirection * stepSize),
    }));
  },

};

export const editorSelectors = {

  getSlotAtCursor: createSelector(
    (editorState: EditorState) => shapeSelectors.getSlots(editorState.shape),
    (editorState: EditorState) => editorState.board.cursor,
    (editorState: EditorState) => editorState.board.direction,
    (slots, cursor, direction) => {
      return slots.find(slot => slot.direction === direction && includes(slot.cells, cursor));
    },
  ),

  getClosedSet: createSelector(
    (editorState: EditorState) => shapeSelectors.getSlots(editorState.shape),
    (editorState: EditorState) => editorState.board.letters,
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
  ),

};
