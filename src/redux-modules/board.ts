import createReducer from 'lib/createReducer';
import BoardState from 'redux-modules/definitions/BoardState';

const initialState: BoardState = {
  author: null,
  title: null,
  size: 15,
  clues: {
    across: [],
    down: [],
  },
  grid: [],
  cursor: null,
  cursorDirection: 'across',
};

const { reducer } = createReducer<BoardState>('board/UPDATE', initialState);
export const boardReducer = reducer;
