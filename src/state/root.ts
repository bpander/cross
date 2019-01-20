import { lens } from 'lens.ts';

import createStateContext from 'lib/createStateContext';
import * as dictionary from 'state/dictionary';

interface RootState {
  dictionary: dictionary.DictionaryState;
}

const defaultValue: RootState = {
  dictionary: dictionary.defaultValue,
};

const l = lens<RootState>();
export const dictionaryLens = l.k('dictionary');

const { StateProvider, StateContext } = createStateContext(defaultValue, []);
export { StateProvider, StateContext };
