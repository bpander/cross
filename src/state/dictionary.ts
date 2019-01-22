import { LensImpl } from 'lens.ts';
import groupBy from 'lodash/groupBy';
import { createSelector } from 'reselect';

import dictPath from 'data/default.dict';
import { parser } from 'parsers/dict.parser';

export interface DictionaryState {
  wordList: string[];
}

export const defaultValue: DictionaryState = {
  wordList: [],
};

export const fetchWordList = () => async <T>(lens: LensImpl<T, DictionaryState>) => {
  const dictResponse = await fetch(dictPath);
  const dictContents = await dictResponse.text();
  const dictResult = parser(dictContents);
  return lens.k('wordList').set(dictResult.data);
};

export const getWordsGrouped = createSelector(
  (state: DictionaryState) => state.wordList,
  wordList => groupBy(wordList, 'length'),
);
