import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { AnyAction, combineReducers, Reducer } from 'redux';

import { boardReducer } from 'redux-modules/board';
import RootState from 'redux-modules/definitions/RootState';

export const createRootReducer = (history: History): Reducer<RootState, AnyAction> => {
  return combineReducers({
    board: boardReducer,
    router: connectRouter(history),
  });
};
