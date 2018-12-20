import { AnyAction, combineReducers, Reducer } from 'redux';

import { boardReducer } from 'redux-modules/board';
import RootState from 'redux-modules/definitions/RootState';

export const rootReducer: Reducer<RootState, AnyAction> = combineReducers({
  board: boardReducer,
});
