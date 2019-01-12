import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import keyBy from 'lodash/keyBy';
import { AnyAction, combineReducers, Reducer } from 'redux';
import { createSelector } from 'reselect';

import { boardReducer, boardSelectors } from 'redux-modules/board';
import RootState from 'redux-modules/definitions/RootState';
import { dictionaryReducer, dictionarySelectors } from 'redux-modules/dictionary';
import { mapValues } from 'util/objects';

export const createRootReducer = (history: History): Reducer<RootState, AnyAction> => {
  return combineReducers({
    board: boardReducer,
    dictionary: dictionaryReducer,
    router: connectRouter(history),
  });
};

export const rootSelectors = {
  getFittingWords: createSelector(
    (state: RootState) => boardSelectors.getSlots(state.board),
    (state: RootState) => dictionarySelectors.getWordsGrouped(state.dictionary),
    (slots, wordsGrouped) => {
      return mapValues(keyBy(slots, 'id'), slot => wordsGrouped[slot.cells.length]);
    },
  ),
};
