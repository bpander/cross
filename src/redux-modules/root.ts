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

export const createRootReducer = (history: History): Reducer<RootState, AnyAction> => {
  return combineReducers({
    editor: editorReducer,
    dictionary: dictionaryReducer,
    router: connectRouter(history),
  });
};

const getFittingWordsGetters = createSelector(
  (state: RootState) => shapeSelectors.getSlots(state.editor.shape),
  (state: RootState) => dictionarySelectors.getWordsGrouped(state.dictionary),
  (slots, wordsGrouped) => {
    return mapValues(keyBy(slots, 'id'), slot => {
      return createSelector(
        (letters: string[]) => slot.cells.map(cell => letters[cell] || '.').join(''),
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
);

export const rootSelectors = {

  getFittingWordsGetters,

  getFittingWords: createSelector(
    (state: RootState) => getFittingWordsGetters(state),
    (state: RootState) => state.editor.board.letters,
    (getters, letters) => mapValues(getters, getter => getter(letters)),
  ),
};
