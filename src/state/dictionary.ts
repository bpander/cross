import groupBy from 'lodash/groupBy';
import { createSelector } from 'reselect';

import dictPath from 'data/default.dict';
import { Setter } from 'lib/lens';
import { parser } from 'parsers/dict.parser';

export interface DictionaryState {
  wordList: string[];
}

export const defaultValue: DictionaryState = {
  wordList: [],
};

export const fetchWordList = async (): Promise<Setter<DictionaryState>> => {
  const dictResponse = await fetch(dictPath);
  const dictContents = await dictResponse.text();
  const dictResult = parser(dictContents);
  return state => ({ ...state, wordList: dictResult.data });
};

export const getWordsGrouped = createSelector(
  (state: DictionaryState) => state.wordList,
  wordList => groupBy(wordList, 'length'),
);
