import { LensImpl } from 'lens.ts';
import reduce from 'lodash/reduce';

import Dictionary from 'definitions/Dictionary';
import { Middleware } from 'lib/createStateContext';

const getLocalStorageMiddleware = <T>(prefix: string, lenses: Dictionary<LensImpl<T, {}>>) => {
  const middleware: Middleware<T> = (state, prevState) => {
    return reduce(
      lenses,
      (s, lens, key) => {
        if (!prevState) {
          const storedValue = JSON.parse(localStorage.getItem(prefix + '.' + key)!);
          if (storedValue) {
            return lens.set((defaultState: {}) => ({ ...defaultState, ...storedValue }))(s);
          }
        }
        const newValue = lens.get()(state);
        if (!prevState || newValue !== lens.get()(prevState)) {
          localStorage.setItem(prefix + '.' + key, JSON.stringify(newValue));
        }
        return state;
      },
      state,
    );
  };
  return middleware;
};

export default getLocalStorageMiddleware;
