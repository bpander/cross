import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { AnyAction, combineReducers, Reducer } from 'redux';

import RootState from 'redux-modules/definitions/RootState';

export const createRootReducer = (history: History): Reducer<RootState, AnyAction> => {
  return combineReducers({
    router: connectRouter(history),
  });
};
