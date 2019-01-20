import { lens } from 'lens.ts';

import createStateContext from 'lib/createStateContext';
import * as dictionary from 'state/dictionary';

export interface RootState {
  dictionary: dictionary.DictionaryState;
}

const defaultValue: RootState = {
  dictionary: dictionary.defaultValue,
};

export const l = lens<RootState>();

const { StateProvider, StateContext } = createStateContext(defaultValue, []);
export { StateProvider, StateContext };
