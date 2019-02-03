import keyBy from 'lodash/keyBy';
import { createSelector } from 'reselect';

import { compose } from 'lib/createStore';
import { Slot } from 'lib/crossword/Types';
import { emptyUndoHistory, UndoHistory } from 'lib/getHistoryMiddleware';
import { lens, Setter } from 'lib/lens';
import * as dictionary from 'state/dictionary';
import { getSlots } from 'state/shape';
import * as viewer from 'state/viewer';
import { mapValues, minKey } from 'util/objects';

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
  ...l,
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

export const getFittingWordsAtSlot = (state: RootState) => {
  const slot = viewer.getSlotAtCursor(state.editor);
  if (!slot) {
    return [];
  }
  const getters = getFittingWordsGetters(state);
  return getters[slot.id](state.editor.board.letters) || [];
};

export const getFittingWords = createSelector(
  (state: RootState) => getFittingWordsGetters(state),
  (state: RootState) => state.editor.board.letters,
  (getters, letters) => mapValues(getters, getter => getter(letters)),
);

export const setCursorAtBestSlot: Setter<RootState> = state => {
  const fittingWords = getFittingWords(state);
  const keyOfLeastFittingWords = minKey(fittingWords, words => {
    if (!words) {
      return Infinity;
    }
    return words.length;
  });

  let { cursor, direction } = state.editor.board;
  if (keyOfLeastFittingWords) {
    const slots = getSlots(state.editor.shape);
    const leastFittingSlot = slots.find(slot => slot.id === keyOfLeastFittingWords);
    if (leastFittingSlot) {
      cursor = leastFittingSlot.cells[0];
      direction = leastFittingSlot.direction;
    }
  }

  return compose(
    L.editor.board.k('cursor').set(cursor),
    L.editor.board.k('direction').set(direction),
  )(state);
};

export const fillWordAtSlot = (word: string, slot: Slot): Setter<RootState> => state => {
  const lettersCopy = [ ...state.editor.board.letters ];
  slot.cells.forEach((cell, i) => {
    lettersCopy[cell] = word.substr(i, 1);
  });

  return compose(
    setCursorAtBestSlot,
    L.editor.board.k('letters').set(lettersCopy),
  )(state);
};
