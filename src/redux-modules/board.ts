import createReducer from 'lib/createReducer';
import BoardState from 'redux-modules/definitions/BoardState';
import RootThunkAction from 'redux-modules/definitions/RootThunkAction';

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
  isCursorAcross: true,
};

const { reducer, update } = createReducer<BoardState>('board/UPDATE', initialState);
export const boardReducer = reducer;

export const actions = {
  setCursor: (cursor: number | null): RootThunkAction<void> => (dispatch, getState) => {
    const { board } = getState();
    let { isCursorAcross } = board;
    if (board.cursor === cursor) {
      isCursorAcross = !isCursorAcross;
    }
    dispatch(update({ cursor, isCursorAcross }));
  },
};
