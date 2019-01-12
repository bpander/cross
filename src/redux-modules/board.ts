import includes from 'lodash/includes';
import { createSelector } from 'reselect';

import { BLACK_SYMBOL } from 'config/global';
import createReducer from 'lib/createReducer';
import { Direction, getSlots, toggleDirection } from 'lib/crossword';
import BoardState from 'redux-modules/definitions/BoardState';
import RootThunkAction from 'redux-modules/definitions/RootThunkAction';
import { replaceIndex, times } from 'util/arrays';
import { getIndex, getXY, reflectXY } from 'util/grid2Ds';

const initialState: BoardState = {
  author: null,
  title: null,
  size: 15, // TODO: Maybe this could be derived from sqrt(grid.length)?
  clues: {
    across: [],
    down: [],
  },
  grid: times(15 ** 2, () => ''),
  cursor: 0,
  direction: Direction.Across,
};

const { reducer, update } = createReducer<BoardState>('board/UPDATE', initialState);
export const boardReducer = reducer;

export const boardActions = {
  toggleDirection: (): RootThunkAction<void> => (dispatch, getState) => {
    const { board } = getState();
    dispatch(update({ direction: toggleDirection(board.direction) }));
  },

  setCursor: (cursor: number) => update({ cursor }),

  setValueAtCursor: (value: string): RootThunkAction<void> => (dispatch, getState) => {
    const { board } = getState();
    if (value === BLACK_SYMBOL) {
      const newValue = (board.grid[board.cursor] === BLACK_SYMBOL) ? '' : value;
      const mid = (board.size - 1) / 2;
      const grid = replaceIndex(
        replaceIndex(board.grid, board.cursor, newValue),
        getIndex(board.size, reflectXY(getXY(board.size, board.cursor), [ mid, mid ])),
        newValue,
      );
      dispatch(update({ grid }));
      return;
    }
    const cursorDirection = (value === '') ? -1 : 1;
    const stepSize = (board.direction === Direction.Across) ? 1 : board.size;
    dispatch(update({
      grid: replaceIndex(board.grid, board.cursor, value),
      cursor: board.cursor + (cursorDirection * stepSize),
    }));
  },
};

const memoizedGetSlots = createSelector(
  (state: BoardState) => state.grid,
  (state: BoardState) => state.size,
  (grid, size) => getSlots({ grid, size }),
);

export const boardSelectors = {

  getSlots: memoizedGetSlots,

  getSlotAtCursor: createSelector(
    memoizedGetSlots,
    (state: BoardState) => state.cursor,
    (state: BoardState) => state.direction,
    (slots, cursor, direction) => {
      return slots.find(slot => slot.direction === direction && includes(slot.cells, cursor));
    },
  ),
};
