import keyBy from 'lodash/keyBy';
import { createSelector } from 'reselect';

import { emptyUndoHistory, UndoHistory } from 'lib/getHistoryMiddleware';
import { lens } from 'lib/lens';
import * as dictionary from 'state/dictionary';
import { getSlots } from 'state/shape';
import * as viewer from 'state/viewer';
import { mapValues } from 'util/objects';

export interface RootState {
  dictionary: dictionary.DictionaryState;
  editor: viewer.ViewerState;
  editorHistory: UndoHistory<viewer.ViewerState>;
}

export const defaultValue: RootState = {
  dictionary: dictionary.defaultValue,
  editor: viewer.defaultValue,
  editorHistory: emptyUndoHistory,
};

const l = lens<RootState>();
const editorL = l.k('editor');

export const L = {
  dictionary: l.k('dictionary'),
  editor: {
    ...editorL,
    board: editorL.k('board'),
    shape: editorL.k('shape'),
  },
  editorHistory: l.k('editorHistory'),
};

export const getFittingWordsGetters = createSelector(
  (state: RootState) => getSlots(state.editor.shape),
  (state: RootState) => dictionary.getWordsGrouped(state.dictionary),
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

export const getFittingWords = createSelector(
  (state: RootState) => getFittingWordsGetters(state),
  (state: RootState) => state.editor.board.letters,
  (getters, letters) => mapValues(getters, getter => getter(letters)),
);
