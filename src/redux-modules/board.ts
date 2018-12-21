import { BLACK_SYMBOL } from 'config/global';
import createReducer from 'lib/createReducer';
import { Direction, toggleDirection } from 'lib/direction';
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
  cursor: null,
  direction: Direction.Across,
};

const { reducer, update } = createReducer<BoardState>('board/UPDATE', initialState);
export const boardReducer = reducer;

export const actions = {
  setCursor: (cursor: number | null): RootThunkAction<void> => (dispatch, getState) => {
    const { board } = getState();
    const direction = toggleDirection(board.direction, board.cursor === cursor);
    dispatch(update({ cursor, direction }));
  },

  setValueAtCursor: (value: string): RootThunkAction<void> => (dispatch, getState) => {
    const { board } = getState();
    if (board.cursor === null) {
      return;
    }
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

const hasBorderAbove = (board: BoardState, cell: number): boolean => {
  return cell < board.size || board.grid[cell - board.size] === BLACK_SYMBOL;
};

const hasBorderLeft = (board: BoardState, cell: number): boolean => {
  return cell % board.size === 0 || board.grid[cell - 1] === BLACK_SYMBOL;
};

export const selectors = {

  getClueMap: (board: BoardState): { [cell: string]: number } => {
    const clueMap: { [cell: string]: number } = {};
    let n = 1;

    board.grid.forEach((value, i) => {
      if (value === BLACK_SYMBOL) {
        return;
      }
      if (hasBorderAbove(board, i) || hasBorderLeft(board, i)) {
        clueMap[i] = n;
        n++;
      }
    });

    return clueMap;
  },

};
