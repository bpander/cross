import { LensImpl } from 'lens.ts';
import groupBy from 'lodash/groupBy';
import { createSelector } from 'reselect';

import dictPath from 'data/default.dict';
import { Store } from 'lib/createStateContext';
import { parser } from 'parsers/dict.parser';

export interface DictionaryState {
  wordList: string[];
}

export const defaultValue: DictionaryState = {
  wordList: [],
};

export const fetchWordList = () => async <T>(store: Store<T>, lens: LensImpl<T, DictionaryState>) => {
  const dictResponse = await fetch(dictPath);
  const dictContents = await dictResponse.text();
  const dictResult = parser(dictContents);
  store.update(lens.k('wordList').set(dictResult.data)(store.state));
};

export const getWordsGrouped = createSelector(
  (state: DictionaryState) => state.wordList,
  wordList => groupBy(wordList, 'length'),
);
