import Dictionary from 'definitions/Dictionary';
import createReducer from 'lib/createReducer';
import * as Enums from 'lib/crossword/Enums';
import BoardState from 'redux-modules/definitions/BoardState';
import RootThunkAction from 'redux-modules/definitions/RootThunkAction';

const initialState: BoardState = {
  letters: [],
  cursor: 0,
  direction: Enums.Direction.Across,
};

const flipMap: Dictionary<Enums.Direction> = {
  [Enums.Direction.Across]: Enums.Direction.Down,
  [Enums.Direction.Down]: Enums.Direction.Across,
};

const { reducer, update } = createReducer<BoardState>('board/UPDATE', initialState);
export const boardReducer = reducer;

export const boardActions = {

  update,

  toggleDirection: (): RootThunkAction<void> => (dispatch, getState) => {
    const { board } = getState().editor;
    dispatch(update({ direction: flipMap[board.direction] }));
  },

  setCursor: (cursor: number) => update({ cursor }),
};
