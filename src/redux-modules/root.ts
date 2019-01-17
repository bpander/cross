import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import keyBy from 'lodash/keyBy';
import { AnyAction, combineReducers, Reducer } from 'redux';
import { createSelector } from 'reselect';

import RootState from 'redux-modules/definitions/RootState';
import { dictionaryReducer, dictionarySelectors } from 'redux-modules/dictionary';
import { editorReducer } from 'redux-modules/editor';
import { shapeSelectors } from 'redux-modules/shape';
import { mapValues } from 'util/objects';
import BoardState from './definitions/BoardState';

export const createRootReducer = (history: History): Reducer<RootState, AnyAction> => {
  return combineReducers({
    editor: editorReducer,
    dictionary: dictionaryReducer,
    router: connectRouter(history),
  });
};

export const rootSelectors = {
  getFittingWordsGetters: createSelector(
    (state: RootState) => shapeSelectors.getSlots(state.editor.shape),
    (state: RootState) => dictionarySelectors.getWordsGrouped(state.dictionary),
    (slots, wordsGrouped) => {
      return mapValues(keyBy(slots, 'id'), slot => {
        return createSelector(
          (boardState: BoardState) => slot.cells.map(cell => boardState.letters[cell] || '.').join(''),
          pattern => {
            if (!pattern.includes('.')) {
              return null;
            }
            if (pattern.search(/[A-Z]/) === -1) {
              return wordsGrouped[pattern.length];
            }
            const re = new RegExp(`^${pattern}$`);
            const r = wordsGrouped[pattern.length].filter(word => re.test(word));
            return r;
          },
        );
      });
    },
  ),
};
