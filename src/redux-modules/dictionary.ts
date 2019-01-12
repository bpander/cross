import groupBy from 'lodash/groupBy';
import { createSelector } from 'reselect';

import createReducer from 'lib/createReducer';
import { parser } from 'parsers/dict.parser';
import DictionaryState from 'redux-modules/definitions/DictionaryState';

import dictPath from 'data/default.dict';
import RootThunkAction from './definitions/RootThunkAction';

const initialState: DictionaryState = {
  wordList: [],
};

const { reducer, update } = createReducer<DictionaryState>('dictionary/UPDATE', initialState);
export const dictionaryReducer = reducer;

export const dictionaryActions = {
  fetchWordList: (): RootThunkAction<void> => async dispatch => {
    const dictResponse = await fetch(dictPath);
    const dictContents = await dictResponse.text();
    const dictResult = parser(dictContents);
    dispatch(update({ wordList: dictResult.data }));
  },
};

export const dictionarySelectors = {
  getWordsGrouped: createSelector(
    (state: DictionaryState) => state.wordList,
    wordList => groupBy(wordList, 'length'),
  ),
};
